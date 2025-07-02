import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { appSettings } from '../settings/appsettings';
import { HorarioDisponible } from '../interfaces/medical.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = `${appSettings.apiUrl}`;

  // Mantener en caché los datos de médicos para no hacer múltiples solicitudes
  private medicosCache: any = null;
  private lastCacheTime: number = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 minutos de caché

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener lista completa de médicos con disponibilidad
  getMedicosCompleto(): Observable<any> {
    // Si tenemos datos en caché recientes, usarlos
    const ahora = Date.now();
    if (this.medicosCache && ahora - this.lastCacheTime < this.cacheDuration) {
      return of(this.medicosCache);
    }

    // Si no hay caché o expiró, hacer la solicitud
    return this.http.get(`${this.baseUrl}/medicos/listado-completo`).pipe(
      map((response: any) => {
        // Guardar en caché
        this.medicosCache = response;
        this.lastCacheTime = Date.now();
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Obtener médico por ID con sus horarios disponibles
  getMedicoById(medicoId: number): Observable<any> {
    // Primero intentamos obtener del caché
    if (this.medicosCache) {
      const medico = this.buscarMedicoEnCache(medicoId);
      if (medico) {
        return of(medico);
      }
    }

    // Si no está en caché, obtenemos todos los médicos
    return this.getMedicosCompleto().pipe(
      map((response: any) => {
        const medico = this.buscarMedicoEnCache(medicoId);
        if (!medico) {
          throw new Error('Médico no encontrado');
        }
        return medico;
      })
    );
  }

  // Buscar un médico en el caché por ID
  private buscarMedicoEnCache(medicoId: number): any {
    if (!this.medicosCache || !this.medicosCache.especialidades) return null;

    for (const especialidad of this.medicosCache.especialidades) {
      const medico = especialidad.medicos.find((m: any) => m.id === medicoId);
      if (medico) return medico;
    }
    return null;
  }

  // Nuevo método para obtener bloques de horarios disponibles basados en la disponibilidad real del médico
  getHorariosDisponibles(
    medicoId: number,
    fecha: string
  ): Observable<HorarioDisponible[]> {
    // Primero obtenemos al médico con sus horarios
    return this.getMedicoById(medicoId).pipe(
      switchMap((medico) => {
        // Verificar si el médico tiene disponibilidad
        if (!medico.tiene_disponibilidad) {
          return of([]);
        }

        // Convertir la fecha a objeto Date para obtener el día de la semana
        const fechaObj = new Date(fecha);
        const diasSemana = [
          'Domingo',
          'Lunes',
          'Martes',
          'Miércoles',
          'Jueves',
          'Viernes',
          'Sábado',
        ];
        const diaSemana = diasSemana[fechaObj.getDay()];

        // Verificar si el médico atiende ese día
        if (!medico.dias_disponibles.includes(diaSemana)) {
          return of([]);
        }

        // Obtener los bloques de horario para ese día
        const bloquesDia = medico.horarios[diaSemana] || [];

        // Convertir los bloques en HorarioDisponible usando los nuevos estados
        const slots: HorarioDisponible[] = [];

        bloquesDia.forEach((bloque: any) => {
          // Mapear estado del backend a nuestra interfaz
          const disponible = bloque.estado === 'habilitado';

          slots.push({
            hora: bloque.inicio,
            horaFin: bloque.fin,
            disponible: disponible,
            estado: bloque.estado,
            reservada: bloque.estado === 'ocupado',
            precio: bloque.precio,
          });
        });

        // Log para debuggear (solo en desarrollo)
        console.debug(
          `Generados ${slots.length} slots para ${diaSemana}:`,
          slots.reduce((acc, slot) => {
            const key = slot.estado;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {})
        );

        return of(slots);
      }),
      catchError((err) => {
        console.error('Error al obtener horarios disponibles:', err);
        return of([]);
      })
    );
  }

  // Verificar horarios reservados para un médico y fecha
  getHorariosReservados(doctorId: number, fecha: string): Observable<string[]> {
    const headers = this.getHeaders();
    return this.http
      .get<any>(
        `${this.baseUrl}/appointments/doctor/${doctorId}/fecha/${fecha}`,
        { headers }
      )
      .pipe(
        map((response) => {
          if (response && response.appointments) {
            return response.appointments.map((app: any) => {
              // Extraer solo la parte de la hora (HH:MM) de la fecha completa
              const timePart = app.scheduled_at.split(' ')[1] || '';
              return timePart.substring(0, 5); // Obtener "09:30" de "09:30:00"
            });
          }
          return [];
        }),
        catchError(() => of([])) // Si hay error, devolvemos array vacío
      );
  }

  // Método para verificar disponibilidad del médico usando los datos reales
  checkDisponibilidadMedico(
    doctorId: number,
    fecha: string
  ): Observable<{ status: string; data: HorarioDisponible[] }> {
    return this.getHorariosDisponibles(doctorId, fecha).pipe(
      map((horarios) => {
        return {
          status: 'success',
          data: horarios,
        };
      }),
      catchError((error) => {
        console.error('Error al verificar disponibilidad:', error);
        return of({
          status: 'error',
          data: [],
        });
      })
    );
  }

  // Agendar una cita
  scheduleAppointment(data: {
    doctor_id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    motivo: string;
  }): Observable<any> {
    const headers = this.getHeaders();
    // Usar el nuevo endpoint
    return this.http
      .post(`${this.baseUrl}/citas/agendar`, data, { headers })
      .pipe(
        // Al agendar con éxito, limpiamos la caché para forzar una actualización en la próxima solicitud
        map((response) => {
          this.medicosCache = null;
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateAppointment(data: {
    appointment_id: number;
    scheduled_at?: string;
    doctor_id?: number;
    reason?: string;
  }): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .put(`${this.baseUrl}/admin/appointments/update`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  // Cancelar cita (para uso de admin)
  cancelAppointment(appointmentId: number): Observable<any> {
    const headers = this.getHeaders();

    const body = { appointment_id: appointmentId };

    return this.http
      .post(`${this.baseUrl}/admin/appointments/cancel`, body, { headers })
      .pipe(catchError(this.handleError));
  }

  // Obtener citas del usuario current
  getAppointments(): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .get(`${this.baseUrl}/appointments`, { headers })
      .pipe(catchError(this.handleError));
  }

  getCitasPacientes(): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .get(`${this.baseUrl}/appointments/patient`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Obtener TODAS las citas con info de doctor y paciente
  getAppointmentsAdmin(): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .get(`${this.baseUrl}/admin/appointments`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Añade este método de depuración si necesitas verificar datos

  // SOLO PARA DESARROLLO - Método para depurar los horarios disponibles
  debugHorarios(medicoId: number, fecha: string): Observable<any> {
    console.log(`Depurando horarios para médico ${medicoId} en fecha ${fecha}`);

    return this.getMedicoById(medicoId).pipe(
      map((medico) => {
        console.log('Información del médico:', medico);

        const fechaObj = new Date(fecha);
        const diasSemana = [
          'Domingo',
          'Lunes',
          'Martes',
          'Miércoles',
          'Jueves',
          'Viernes',
          'Sábado',
        ];
        const diaSemana = diasSemana[fechaObj.getDay()];

        console.log(`Día de la semana para ${fecha}: ${diaSemana}`);
        console.log(
          `Días disponibles del médico: ${medico.dias_disponibles?.join(', ')}`
        );
        console.log(
          `¿Atiende este día? ${medico.dias_disponibles?.includes(diaSemana)}`
        );

        if (medico.horarios && medico.horarios[diaSemana]) {
          console.log(`Bloques para ${diaSemana}:`, medico.horarios[diaSemana]);
        } else {
          console.log(`No hay bloques definidos para ${diaSemana}`);
        }

        return medico;
      })
    );
  }

  // Agregar este método de utilidad al final de la clase AppointmentService

  // Utilidad para depurar respuestas de error
  debugResponseError(error: any): void {
    console.error('Error completo:', error);

    if (error.error) {
      console.error('Detalle del error del servidor:', error.error);

      if (error.error.errors) {
        console.error('Errores de validación:', error.error.errors);
      }
    }
  }

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    let errorMsg = 'Ha ocurrido un error en el servidor';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMsg = `Error: ${error.error.message}`;
    } else if (error.status) {
      // El servidor retornó un código de error
      errorMsg =
        error.error?.message ||
        error.error?.error ||
        `Error ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMsg));
  }

  getCitasPaciente(): Observable<any> {
    const headers = this.getHeaders();
    return this.http
      .get(`${this.baseUrl}/appointments`, { headers })
      .pipe(catchError(this.handleError));
  }
}