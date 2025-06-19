import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { CalendarSelectorComponent } from '../../../components/calendar-selector/calendar-selector.component';
import {
  Doctor,
  EspecialidadConMedicos,
  HorarioDisponible,
  AppointmentSummary,
  PaymentMethod
} from '../../../interfaces/medical.interface';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CalendarSelectorComponent],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  // Listas y datos
  especialidades: EspecialidadConMedicos[] = [];
  medicos: Doctor[] = [];
  medicosFiltrados: Doctor[] = [];
  fechasDisponibles: string[] = [];
  horasDisponibles: HorarioDisponible[] = []; // Usar la interfaz correcta

  // Propiedades para el flujo de reserva
  pasoActual = 1;
  totalPasos = 4;
  medicoSeleccionado: Doctor | null = null;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  horaRangoSeleccionado: string = ''; // Nueva propiedad para el rango de hora
  resumenCita: AppointmentSummary | null = null;

  // Formularios
  seleccionForm: FormGroup;
  fechaForm: FormGroup;
  pagoForm: FormGroup;

  // Estados de la interfaz
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Para filtrado
  especialidadSeleccionada: string = '';

  // Dias específicos disponibles
  diasDisponibles: string[] = [];

  // Nombres de días de semana disponibles
  diasSemanasDisponibles: string[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Inicializar formularios
    this.seleccionForm = this.fb.group({
      especialidad: ['', Validators.required],
      medico: ['', Validators.required],
    });

    // Actualizar el formulario de fecha para incluir hora_inicio y hora_fin
    this.fechaForm = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required], // mantenemos esto para la UI
      horaFin: [''], // Nuevo campo para guardar la hora de fin
      razon: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500), // Actualizado a 500 según backend
        ],
      ],
    });

    this.pagoForm = this.fb.group({
      metodoPago: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Verificar si el usuario está autenticado y es un paciente
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Debe iniciar sesión para agendar una cita.';
      setTimeout(() => this.router.navigate(['/login']), 3000);
      return;
    }

    // Si está autenticado, verificamos si es un paciente
    if (!this.authService.isPatient()) {
      this.errorMessage = 'Solo los pacientes pueden agendar citas.';
      setTimeout(() => this.router.navigate(['/dashboard']), 3000);
      return;
    }

    // Si todo está correcto, cargamos los datos necesarios
    this.cargarMedicosCompleto();
  }

  // Cargar médicos y especialidades usando el nuevo endpoint
  cargarMedicosCompleto(): void {
    this.loading = true;
    this.appointmentService.getMedicosCompleto().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.medicos = response.medicos;
          this.especialidades = response.especialidades;
          this.medicosFiltrados = [...this.medicos];
        } else {
          this.errorMessage =
            'No se pudieron cargar los datos de médicos y especialidades.';
        }
        this.loading = false;
      },
      (error) => {
        this.errorMessage =
          error.message || 'Error al cargar datos de médicos.';
        this.loading = false;
      }
    );
  }

  // Filtrar médicos por especialidad
  filtrarMedicosPorEspecialidad(): void {
    const especialidadNombre = this.seleccionForm.value.especialidad;
    this.especialidadSeleccionada = especialidadNombre;

    if (especialidadNombre) {
      const especialidadEncontrada = this.especialidades.find(
        (esp) => esp.nombre === especialidadNombre
      );

      if (especialidadEncontrada) {
        this.medicosFiltrados = especialidadEncontrada.medicos;
      } else {
        this.medicosFiltrados = [];
      }
    } else {
      this.medicosFiltrados = [...this.medicos];
    }

    // Resetear selección de médico
    this.seleccionForm.patchValue({ medico: '' });
    this.medicoSeleccionado = null;
  }

  // Este método debe aceptar un parámetro de tipo Doctor
  seleccionarMedico(medico?: Doctor): void {
    if (!medico) {
      // Si se llama desde el select, obtener el médico por ID
      const medicoId = Number(this.seleccionForm.value.medico);
      if (medicoId) {
        const medicoEncontrado = this.medicos.find(m => m.id === medicoId);
        if (medicoEncontrado) {
          this.medicoSeleccionado = medicoEncontrado;
          // Actualizar los días disponibles según el médico seleccionado
          this.diasSemanasDisponibles = medicoEncontrado.dias_disponibles || [];
        } else {
          this.errorMessage = 'No se pudo encontrar el médico seleccionado.';
          return;
        }
      } else {
        this.errorMessage = 'Por favor seleccione un médico.';
        return;
      }
    } else {
      // Si se pasa el médico directamente (desde la lista)
      this.medicoSeleccionado = medico;
      this.seleccionForm.patchValue({ medico: medico.id });

      // Actualizar los días disponibles según el médico seleccionado
      this.diasSemanasDisponibles = medico.dias_disponibles || [];
    }

    // Limpiar selecciones previas
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.fechaForm.patchValue({ fecha: '', hora: '', razon: '' });
    this.horasDisponibles = [];

    // Avanzar al siguiente paso
    this.pasoActual = 2;
  }

  // Generar fechas disponibles basadas en los días disponibles del médico
  generarFechasDisponibles(): void {
    this.fechasDisponibles = [];

    if (
      !this.medicoSeleccionado ||
      !this.medicoSeleccionado.dias_disponibles.length
    ) {
      return;
    }

    const hoy = new Date();
    const diasDisponibles = this.medicoSeleccionado.dias_disponibles;
    const diasSemana = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];

    // Generar fechas para los próximos 30 días
    for (let i = 0; i < 30; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);

      const diaSemana = diasSemana[fecha.getDay()];

      // Si este día de la semana está disponible, agregarlo a las opciones
      if (diasDisponibles.includes(diaSemana)) {
        const fechaStr = fecha.toISOString().split('T')[0];
        this.fechasDisponibles.push(fechaStr);
      }
    }
  }

  // Verificar si una fecha/hora ya ha pasado
  isFechaPasada(fecha: string, hora: string): boolean {
    const ahora = new Date();
    const fechaHora = new Date(`${fecha}T${hora}`);
    return fechaHora < ahora;
  }

  // Actualizar el método seleccionarFecha para recibir el valor directamente del calendario
  seleccionarFecha(fecha: string): void {
    // Verificar si la fecha seleccionada es anterior a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fecha);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      this.errorMessage = 'No es posible seleccionar una fecha pasada.';
      return;
    }

    this.fechaSeleccionada = fecha;
    this.horaSeleccionada = '';
    this.fechaForm.patchValue({ fecha: fecha, hora: '' });
    this.cargarHorasDisponibles();
    this.errorMessage = ''; // Limpiar mensajes de error previos
  }

  // Obtener texto legible según el estado del horario
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'habilitado':
        return 'Disponible';
      case 'ocupado':
        return 'Reservado';
      case 'bloqueado':
        return 'No disponible';
      case 'eliminado':
        return 'Eliminado';
      default:
        return 'No disponible';
    }
  }

  // Método para seleccionar una hora
  seleccionarHora(slot: HorarioDisponible): void {
    // Solo permitir seleccionar horarios habilitados
    if (slot.estado === 'habilitado') {
      // Guardamos tanto la hora de inicio como la de fin
      this.fechaForm.patchValue({
        hora: slot.hora,
        horaFin: slot.horaFin
      });

      this.horaSeleccionada = slot.hora;

      // Si el slot tiene precio, actualizamos el precio en el resumen
      if (slot.precio && this.medicoSeleccionado) {
        this.medicoSeleccionado.valor_consulta = slot.precio;
      }
    }
  }

  // Cargar horas disponibles para la fecha seleccionada
  cargarHorasDisponibles(): void {
    if (!this.fechaSeleccionada || !this.medicoSeleccionado) return;

    this.loading = true;
    this.errorMessage = '';

    this.appointmentService
      .checkDisponibilidadMedico(
        this.medicoSeleccionado.id,
        this.fechaSeleccionada
      )
      .subscribe(
        (response) => {
          if (response.status === 'success') {
            this.horasDisponibles = response.data;

            // Si no hay horas disponibles, mostrar mensaje
            if (!this.horasDisponibles.some(slot => slot.disponible)) {
              this.errorMessage = 'No hay horarios disponibles para la fecha seleccionada.';
            }
          } else {
            this.errorMessage = 'No se pudieron cargar los horarios disponibles.';
            this.horasDisponibles = [];
          }
          this.loading = false;
        },
        (error) => {
          this.errorMessage = error.message || 'Error al cargar horarios disponibles.';
          this.horasDisponibles = [];
          this.loading = false;
        }
      );
  }

  // Avanzar al siguiente paso
  siguiente(): void {
    if (this.pasoActual < this.totalPasos) {
      // Validaciones específicas por paso
      if (this.pasoActual === 1 && this.seleccionForm.invalid) {
        this.errorMessage =
          'Por favor seleccione una especialidad y un médico.';
        return;
      }

      if (this.pasoActual === 2 && this.fechaForm.invalid) {
        this.errorMessage =
          'Por favor seleccione fecha, hora y proporcione el motivo de la consulta.';
        return;
      }

      if (this.pasoActual === 3 && this.pagoForm.invalid) {
        this.errorMessage = 'Por favor seleccione un método de pago.';
        return;
      }

      // Acciones específicas por paso
      if (this.pasoActual === 3) {
        // Generar resumen antes de confirmar
        this.generarResumenCita();
      }

      // Avanzar al siguiente paso
      this.pasoActual++;
      this.errorMessage = '';
    }
  }

  // Retroceder al paso anterior
  anterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.errorMessage = '';
    }
  }

  // Generar resumen de la cita
  generarResumenCita(): void {
    if (!this.medicoSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
      this.errorMessage = 'Faltan datos para generar el resumen.';
      return;
    }

    // Buscar el slot seleccionado para obtener la hora de fin
    const slotSeleccionado = this.horasDisponibles.find(slot => slot.hora === this.horaSeleccionada);
    const horaFinSlot = slotSeleccionado?.horaFin || ''; // Cambié el nombre de la variable

    // Calcular duración en minutos (para mostrar en el resumen)
    let duracionConsulta = 30; // Valor predeterminado

    if (this.horaSeleccionada && horaFinSlot) {
      // Convertir a minutos para calcular duración
      const [horaInicio, minInicio] = this.horaSeleccionada.split(':').map(Number);
      const [horaFin, minFin] = horaFinSlot.split(':').map(Number); // Ahora usamos horaFinSlot

      const inicioMinutos = horaInicio * 60 + minInicio;
      const finMinutos = horaFin * 60 + minFin;

      duracionConsulta = finMinutos - inicioMinutos;
    }

    const metodoPagoSeleccionado = this.pagoForm.value.metodoPago || null;

    this.resumenCita = {
      doctor: `Dr. ${this.medicoSeleccionado.nombre} ${this.medicoSeleccionado.apellido}`,
      specialtyName: this.medicoSeleccionado.especialidad.nombre,
      date: new Date(this.fechaSeleccionada).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      // Usar el rango completo
      time: slotSeleccionado ? `${slotSeleccionado.hora} - ${horaFinSlot}` : this.horaSeleccionada,
      duration: duracionConsulta,
      price: this.medicoSeleccionado.valor_consulta,
      paymentMethod: this.obtenerTextoPago(metodoPagoSeleccionado),
      reason: this.fechaForm.value.razon || '',
    };
  }

  // Confirmar y agendar la cita
  confirmarCita(): void {
    if (!this.medicoSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
      this.errorMessage = 'Faltan datos para agendar la cita.';
      return;
    }

    this.loading = true;

    // Buscar el slot seleccionado para obtener la hora de fin
    const slotSeleccionado = this.horasDisponibles.find(slot => slot.hora === this.horaSeleccionada);

    if (!slotSeleccionado || !slotSeleccionado.horaFin) {
      this.errorMessage = 'No se pudo determinar el horario completo de la cita.';
      this.loading = false;
      return;
    }

    // Formatear los datos según el nuevo formato del endpoint
    const citaData = {
      doctor_id: this.medicoSeleccionado.id,
      fecha: this.fechaSeleccionada, // Formato YYYY-MM-DD
      hora_inicio: slotSeleccionado.hora, // Formato HH:MM
      hora_fin: slotSeleccionado.horaFin, // Formato HH:MM
      motivo: this.fechaForm.value.razon
    };

    this.appointmentService.scheduleAppointment(citaData).subscribe(
      (response) => {
        this.loading = false;
        if (response && response.status === 'success') {
          this.successMessage = 'Cita médica agendada con éxito.';

          // Actualizar inmediatamente los horarios disponibles
          this.horasDisponibles = this.horasDisponibles.map(slot => {
            if (slot.hora === this.horaSeleccionada) {
              return { ...slot, disponible: false, estado: 'ocupado' };
            }
            return slot;
          });

          // Redirigir a la página de citas después de un tiempo
          setTimeout(
            () => this.router.navigate(['/dashboard/appointments']),
            3000
          );
        } else {
          this.errorMessage = response.message || 'Hubo un problema al agendar la cita.';
        }
      },
      (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error al agendar la cita.';

        // Si el error es específicamente de horario ya ocupado, actualizar horarios
        if (error.message?.includes('horario') || error.message?.includes('médico no está disponible')) {
          this.cargarHorasDisponibles();
        }
      }
    );
  }

  // Método auxiliar para obtener el texto del método de pago
  obtenerTextoPago(metodo: PaymentMethod | undefined | null): string {
    if (!metodo) {
      return 'Pendiente';
    }

    switch (metodo) {
      case 'tarjeta':
        return 'Pago con tarjeta (crédito/débito)';
      case 'transferencia':
        return 'Transferencia bancaria';
      case 'consulta':
        return 'Pago en consulta';
      default:
        return 'Pendiente';
    }
  }

  // Método para formatear el precio
  formatoPrecio(precio: number): string {
    return precio.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  }
}
