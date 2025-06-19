import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule, // Añadida la importación
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { DisponibilidadService } from '../../../services/disponibilidad.service';
import {
  Disponibilidad,
  DiasSemanaNombres,
  BloquePredefinido
} from '../../../interfaces/disponibilidad.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // Añadido FormsModule aquí
  templateUrl: './disponibilidad.component.html',
  styleUrls: ['./disponibilidad.component.css'],
})
export class DisponibilidadComponent implements OnInit {
  disponibilidadForm: FormGroup;
  bloqueForm: FormGroup;
  diasSemana = DiasSemanaNombres;
  loading = false;
  loadingData = true;
  errorMessage = '';
  successMessage = '';
  diasSeleccionados = new Set<number>();
  mostrarFormCreacion = false;
  mostrarModal = false;
  disponibilidades: Disponibilidad[] = [];
  user: any = null;
  bloqueAEliminar: Disponibilidad | null = null;
  mostrarConfirmacion: boolean = false;

  // Bloques horarios predefinidos para simplificar la creación
  bloquesPredefinidos: BloquePredefinido[] = [
    {
      id: 1,
      nombre: 'Mañana temprano',
      horaInicio: '08:00',
      horaFin: '08:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 2,
      nombre: 'Mañana',
      horaInicio: '09:00',
      horaFin: '09:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 3,
      nombre: 'Media mañana',
      horaInicio: '10:00',
      horaFin: '10:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 4,
      nombre: 'Media mañana',
      horaInicio: '11:00',
      horaFin: '11:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 5,
      nombre: 'Mediodía',
      horaInicio: '12:00',
      horaFin: '12:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 6,
      nombre: 'Inicio tarde',
      horaInicio: '14:00',
      horaFin: '14:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 7,
      nombre: 'Media tarde',
      horaInicio: '15:00',
      horaFin: '15:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 8,
      nombre: 'Tarde',
      horaInicio: '16:00',
      horaFin: '16:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 9,
      nombre: 'Fin tarde',
      horaInicio: '17:00',
      horaFin: '17:30',
      precio: 0, // Quitamos precio predeterminado
    },
    {
      id: 10,
      nombre: 'Tarde-noche',
      horaInicio: '18:00',
      horaFin: '18:30',
      precio: 0, // Quitamos precio predeterminado
    },
  ];

  // Días seleccionados para aplicación masiva
  diasParaAplicarBloque: number[] = [];
  bloquePredefinidoSeleccionado: BloquePredefinido | null = null;

  // Cambia la propiedad de bloque seleccionado único por un array de bloques seleccionados
  bloquesPredefinidosSeleccionados: BloquePredefinido[] = [];
  precioPersonalizado: number = 0; // Inicialmente en 0 para que el usuario lo defina

  constructor(
    private fb: FormBuilder,
    private disponibilidadService: DisponibilidadService,
    private authService: AuthService
  ) {
    this.disponibilidadForm = this.crearFormularioDisponibilidad();
    this.bloqueForm = this.crearFormularioBloque();
    this.user = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.cargarDisponibilidad();
  }

  cargarDisponibilidad(): void {
    this.loadingData = true;
    this.errorMessage = '';

    this.disponibilidadService.obtenerDisponibilidad().subscribe({
      next: (data) => {
        // Procesamos la disponibilidad del backend
        if (data.disponibilidad && data.disponibilidad.length > 0) {
          // Añadimos las propiedades adicionales necesarias para la interfaz
          this.disponibilidades = data.disponibilidad.map((disp) => ({
            ...disp,
            activo: disp.activo !== undefined ? disp.activo : true,
            tiene_citas: false, // Por defecto, asumimos que no tiene citas
          }));
        } else {
          this.disponibilidades = [];
        }

        this.loadingData = false;

        // Actualizar los días seleccionados basados en los datos cargados
        this.diasSeleccionados.clear();
        this.disponibilidades.forEach((disp) => {
          this.diasSeleccionados.add(disp.dia_semana);
        });
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Error al cargar la disponibilidad';
        this.loadingData = false;
      },
    });
  }

  // Método para obtener la fecha de cada día de la semana actual
  obtenerFechaPorDia(diaSemana: number): string {
    const hoy = new Date();
    const diaSemanaActual = hoy.getDay() || 7; // Convertir 0 (domingo) a 7
    const diferenciaDias = diaSemana - diaSemanaActual;

    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + diferenciaDias);

    return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
  }

  // Método para obtener bloques por día (múltiples bloques por día)
  obtenerBloquesPorDia(diaSemana: number): Disponibilidad[] {
    return this.disponibilidades.filter((d) => d.dia_semana === diaSemana);
  }

  // Método para seleccionar un bloque predefinido
  seleccionarBloquePredefinido(bloque: BloquePredefinido): void {
    // Buscar si el bloque ya está seleccionado
    const index = this.bloquesPredefinidosSeleccionados.findIndex(b => b.id === bloque.id);

    if (index === -1) {
      // Si no está seleccionado, lo agregamos a la lista
      this.bloquesPredefinidosSeleccionados.push(bloque);
    } else {
      // Si ya está seleccionado, lo quitamos
      this.bloquesPredefinidosSeleccionados.splice(index, 1);
    }

    // No asignar automáticamente el precio, dejar que el usuario lo defina
    this.bloqueForm.patchValue({
      hora_inicio: this.bloquesPredefinidosSeleccionados.length === 1 ? this.bloquesPredefinidosSeleccionados[0].horaInicio : '',
      hora_fin: this.bloquesPredefinidosSeleccionados.length === 1 ? this.bloquesPredefinidosSeleccionados[0].horaFin : ''
      // No modificar el precio
    });
  }

  // Método para verificar si un bloque está seleccionado
  esBloqueSeleccionado(bloqueId: number): boolean {
    return this.bloquesPredefinidosSeleccionados.some(b => b.id === bloqueId);
  }

  // Método para aplicar el precio personalizado a todos los bloques seleccionados
  aplicarPrecioPersonalizado(precio: number): void {
    this.precioPersonalizado = precio;
  }

  // Método para alternar selección de día para aplicación masiva
  toggleDiaParaAplicarBloque(diaSemana: number): void {
    const index = this.diasParaAplicarBloque.indexOf(diaSemana);
    if (index === -1) {
      this.diasParaAplicarBloque.push(diaSemana);
    } else {
      this.diasParaAplicarBloque.splice(index, 1);
    }
  }

  // Comprobar si un día está seleccionado para aplicación masiva
  esDiaSeleccionadoParaBloque(diaSemana: number): boolean {
    return this.diasParaAplicarBloque.includes(diaSemana);
  }

  // Aplicar el mismo bloque a múltiples días
  aplicarBloqueAMultiplesDias(): void {
    if (this.bloquesPredefinidosSeleccionados.length === 0 || this.diasParaAplicarBloque.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos un bloque horario y un día para aplicarlo';
      return;
    }

    if (this.precioPersonalizado <= 0) {
      this.errorMessage = 'Debe ingresar un precio válido para los bloques';
      return;
    }

    this.loading = true;
    const bloquesParaCrear: Disponibilidad[] = [];

    // Para cada día seleccionado
    this.diasParaAplicarBloque.forEach(dia => {
      // Para cada bloque seleccionado
      this.bloquesPredefinidosSeleccionados.forEach(bloquePredefinido => {
        // Verificar si el día ya tiene este horario exacto
        const existeExacto = this.disponibilidades.some(disp =>
          disp.dia_semana === dia &&
          disp.hora_inicio === this.formatearHora(bloquePredefinido.horaInicio) &&
          disp.hora_fin === this.formatearHora(bloquePredefinido.horaFin)
        );

        if (!existeExacto) {
          bloquesParaCrear.push({
            dia_semana: dia,
            hora_inicio: this.formatearHora(bloquePredefinido.horaInicio),
            hora_fin: this.formatearHora(bloquePredefinido.horaFin),
            precio: this.precioPersonalizado, // Usar el precio personalizado
            activo: true
          });
        }
      });
    });

    if (bloquesParaCrear.length === 0) {
      this.loading = false;
      this.errorMessage = 'Los bloques ya existen para los días seleccionados';
      return;
    }

    console.log('Enviando bloques para crear:', bloquesParaCrear);

    this.disponibilidadService.crearDisponibilidad(bloquesParaCrear).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || `${bloquesParaCrear.length} bloques creados correctamente`;
        this.diasParaAplicarBloque = [];
        this.bloquesPredefinidosSeleccionados = []; // Limpiar selección
        this.cargarDisponibilidad();

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error completo:', err);

        if (err.error?.errors) {
          const errorsDetail = Object.entries(err.error.errors)
            .map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`)
            .join('; ');
          this.errorMessage = `${err.error.message} (${errorsDetail})`;
        } else {
          this.errorMessage = err.error?.message || 'Error al crear los bloques';
        }
      }
    });
  }

  // Método para bloquear disponibilidad
  bloquearDisponibilidad(bloque: Disponibilidad): void {
    if (bloque.tiene_citas) {
      this.errorMessage = 'No puede modificar horarios con citas ya programadas. Primero cancele o reagende las citas afectadas.';
      return;
    }

    this.loading = true;

    // Formatea las horas para quitar los segundos si existen
    const formatearHora = (hora: string): string => {
      // Si la hora incluye segundos (HH:MM:SS), los quitamos
      if (hora.split(':').length > 2) {
        return hora.substring(0, 5);
      }
      return hora;
    };

    // Estructura exacta que requiere el backend con formato correcto
    const bloqueParaDesactivar = [
      {
        dia_semana: bloque.dia_semana,
        hora_inicio: formatearHora(bloque.hora_inicio),
        hora_fin: formatearHora(bloque.hora_fin)
      }
    ];

    console.log('Enviando para desactivar:', { bloques: bloqueParaDesactivar });

    this.disponibilidadService.desactivarBloques(bloqueParaDesactivar).subscribe({
      next: (response) => {
        console.log('Respuesta desactivar:', response);
        // Actualizar el estado del bloque en la interfaz
        this.disponibilidades = this.disponibilidades.map(d =>
          (d.dia_semana === bloque.dia_semana &&
           d.hora_inicio === bloque.hora_inicio &&
           d.hora_fin === bloque.hora_fin) ? {...d, activo: false} : d
        );
        this.loading = false;
        this.successMessage = response.message || 'Bloque desactivado correctamente';

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error completo:', err);

        // Mostrar detalles específicos del error si están disponibles
        if (err.error?.errors) {
          console.log('Errores de validación:', err.error.errors);
          const errorsDetail = Object.entries(err.error.errors)
            .map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`)
            .join('; ');
          this.errorMessage = `${err.error.message} (${errorsDetail})`;
        } else {
          this.errorMessage = err.error?.message || 'Error al desactivar el bloque';
        }
      }
    });
  }

  // Método para desbloquear disponibilidad
  desbloquearDisponibilidad(bloque: Disponibilidad): void {
    this.loading = true;

    // Formatea las horas para quitar los segundos si existen
    const formatearHora = (hora: string): string => {
      // Si la hora incluye segundos (HH:MM:SS), los quitamos
      if (hora.split(':').length > 2) {
        return hora.substring(0, 5);
      }
      return hora;
    };

    // Estructura exacta que requiere el backend con formato correcto
    const bloqueParaActivar = [
      {
        dia_semana: bloque.dia_semana,
        hora_inicio: formatearHora(bloque.hora_inicio),
        hora_fin: formatearHora(bloque.hora_fin)
      }
    ];

    console.log('Enviando para activar:', { bloques: bloqueParaActivar });

    this.disponibilidadService.activarBloques(bloqueParaActivar).subscribe({
      next: (response) => {
        console.log('Respuesta activar:', response);
        // Actualizar el estado del bloque en la interfaz
        this.disponibilidades = this.disponibilidades.map(d =>
          (d.dia_semana === bloque.dia_semana &&
           d.hora_inicio === bloque.hora_inicio &&
           d.hora_fin === bloque.hora_fin) ? {...d, activo: true} : d
        );
        this.loading = false;
        this.successMessage = response.message || 'Bloque activado correctamente';

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error completo:', err);

        // Mostrar detalles específicos del error si están disponibles
        if (err.error?.errors) {
          console.log('Errores de validación:', err.error.errors);
          const errorsDetail = Object.entries(err.error.errors)
            .map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`)
            .join('; ');
          this.errorMessage = `${err.error.message} (${errorsDetail})`;
        } else {
          this.errorMessage = err.error?.message || 'Error al activar el bloque';
        }
      }
    });
  }

  // Método para eliminar un bloque
  eliminarBloque(bloque: Disponibilidad): void {
    if (bloque.tiene_citas) {
      this.errorMessage =
        'No puede eliminar un bloque con citas programadas. Primero cancele o reagende las citas afectadas.';
      return;
    }

    // Asignar bloque y mostrar modal de confirmación
    this.bloqueAEliminar = bloque;
    this.mostrarConfirmacion = true;
  }

  // Método para confirmar la eliminación con estructura correcta
  confirmarEliminarBloque(): void {
    if (!this.bloqueAEliminar) return;

    this.loading = true;

    // Formatea las horas para quitar los segundos si existen
    const formatearHora = (hora: string): string => {
      // Si la hora incluye segundos (HH:MM:SS), los quitamos
      if (hora.split(':').length > 2) {
        return hora.substring(0, 5);
      }
      return hora;
    };

    // Estructura exacta que requiere el backend con formato correcto
    const bloqueParaEliminar = [
      {
        dia_semana: this.bloqueAEliminar.dia_semana,
        hora_inicio: formatearHora(this.bloqueAEliminar.hora_inicio),
        hora_fin: formatearHora(this.bloqueAEliminar.hora_fin)
      }
    ];

    console.log('Enviando para eliminar:', { bloques: bloqueParaEliminar });

    this.disponibilidadService.eliminarBloques(bloqueParaEliminar).subscribe({
      next: (response) => {
        console.log('Respuesta eliminar:', response);
        if (response.status === 'success' || (response.status === 'warning' && response.eliminados > 0)) {
          this.disponibilidades = this.disponibilidades.filter(d =>
            !(d.dia_semana === this.bloqueAEliminar!.dia_semana &&
              d.hora_inicio === this.bloqueAEliminar!.hora_inicio &&
              d.hora_fin === this.bloqueAEliminar!.hora_fin)
          );
          this.successMessage = response.message || 'Bloque eliminado correctamente';
        } else {
          this.errorMessage = response.message || 'Error al eliminar el bloque';
        }

        this.loading = false;
        this.bloqueAEliminar = null;
        this.mostrarConfirmacion = false;

        setTimeout(() => {
          this.successMessage = '';
          this.errorMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.bloqueAEliminar = null;
        this.mostrarConfirmacion = false;

        console.error('Error completo:', err);

        if (err.error?.errores && err.error.errores.length > 0) {
          const errDetails = err.error.errores.map((e: any) => e.motivo).join(', ');
          this.errorMessage = `${err.error.message}: ${errDetails}`;
        } else if (err.error?.errors) {
          const errorsDetail = Object.entries(err.error.errors)
            .map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`)
            .join('; ');
          this.errorMessage = `${err.error.message} (${errorsDetail})`;
        } else {
          this.errorMessage = err.error?.message || 'Error al eliminar el bloque';
        }
      }
    });
  }

  // Cancelar la eliminación
  cancelarEliminarBloque(): void {
    this.bloqueAEliminar = null;
    this.mostrarConfirmacion = false;
  }

  // Método para crear formulario de bloque
  crearFormularioBloque(): FormGroup {
    return this.fb.group({
      dia_semana: ['', [Validators.required]],
      hora_inicio: [
        '09:00',
        [
          Validators.required,
          Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ],
      ],
      hora_fin: [
        '09:30',
        [
          Validators.required,
          Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ],
      ],
      precio: [
        '', // Inicialmente vacío para forzar al usuario a ingresar un valor
        [Validators.required, Validators.min(1000), Validators.max(9999999)],
      ],
    });
  }

  // Modal para agregar nuevo bloque
  agregarNuevoBloque(): void {
    this.bloqueForm.reset({
      dia_semana: '',
      hora_inicio: '09:00',
      hora_fin: '09:30',
      precio: '' // Vacío para forzar la entrada manual
    });
    this.bloquePredefinidoSeleccionado = null;
    this.mostrarModal = true;
  }

  // Agregar bloque para un día específico
  agregarBloqueParaDia(diaSemana: number): void {
    this.bloqueForm.patchValue({
      dia_semana: diaSemana.toString(),
    });
    this.bloquePredefinidoSeleccionado = null;
    this.mostrarModal = true;
  }

  // Cerrar modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.bloquePredefinidoSeleccionado = null;
  }

  // Guardar bloque desde el modal
  guardarBloque(): void {
    if (this.bloqueForm.invalid) {
      return;
    }

    this.loading = true;

    // Asegúrate de que las horas estén en formato correcto (HH:MM)
    const nuevoBloque = {
      dia_semana: Number(this.bloqueForm.value.dia_semana),
      hora_inicio: this.formatearHora(this.bloqueForm.value.hora_inicio),
      hora_fin: this.formatearHora(this.bloqueForm.value.hora_fin),
      precio: Number(this.bloqueForm.value.precio),
      activo: true
    };

    console.log('Enviando nuevo bloque:', nuevoBloque);

    this.disponibilidadService.crearDisponibilidad([nuevoBloque]).subscribe({
      next: (response) => {
        // Actualizar la lista de disponibilidades
        this.cargarDisponibilidad();
        this.loading = false;
        this.mostrarModal = false;
        this.successMessage = response.message || 'Bloque horario agregado correctamente';

        // Actualizar días seleccionados
        this.diasSeleccionados.add(nuevoBloque.dia_semana);

        // Ocultar mensaje de éxito después de unos segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error completo:', err);

        if (err.error?.errors) {
          const errorsDetail = Object.entries(err.error.errors)
            .map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`)
            .join('; ');
          this.errorMessage = `${err.error.message} (${errorsDetail})`;
        } else {
          this.errorMessage = err.error?.message || 'Error al crear el bloque de disponibilidad';
        }
      }
    });
  }

  // Método para formatear moneda
  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor);
  }

  // Los demás métodos se mantienen igual...
  crearFormularioDisponibilidad(): FormGroup {
    return this.fb.group({
      disponibilidad: this.fb.array([]),
    });
  }

  get disponibilidadArray(): FormArray {
    return this.disponibilidadForm.get('disponibilidad') as FormArray;
  }

  agregarDia(diaSemana: number): void {
    // Verificar si el día ya está en el formulario
    if (
      this.disponibilidadArray.controls.some(
        (control) => control.get('dia_semana')?.value === diaSemana
      )
    ) {
      return;
    }

    // Verificar si el día ya tiene disponibilidad registrada
    const disponibilidadExistente = this.disponibilidades.find(
      (d) => d.dia_semana === diaSemana
    );

    const horarioControl = this.fb.group({
      dia_semana: [diaSemana, [Validators.required]],
      hora_inicio: [
        '09:00',
        [
          Validators.required,
          Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ],
      ],
      hora_fin: [
        '18:00',
        [
          Validators.required,
          Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ],
      ],
      precio: [
        '15000',
        [Validators.required, Validators.min(1), Validators.max(9999999)],
      ],
    });

    // Si existe disponibilidad previa, rellenar con esos valores
    if (disponibilidadExistente) {
      horarioControl.patchValue({
        hora_inicio: disponibilidadExistente.hora_inicio,
        hora_fin: disponibilidadExistente.hora_fin,
        precio: disponibilidadExistente.precio.toString(),
      });
    }

    this.disponibilidadArray.push(horarioControl);
    this.diasSeleccionados.add(diaSemana);
  }

  quitarDia(index: number): void {
    const diaSemana = this.disponibilidadArray
      .at(index)
      .get('dia_semana')?.value;
    this.disponibilidadArray.removeAt(index);

    // Verificar si hay otro control con el mismo día antes de removerlo del set
    if (
      !this.disponibilidadArray.controls.some(
        (control) => control.get('dia_semana')?.value === diaSemana
      )
    ) {
      this.diasSeleccionados.delete(diaSemana);
    }
  }

  esDiaSeleccionado(diaSemana: number): boolean {
    return this.diasSeleccionados.has(diaSemana);
  }

  toggleCrearNuevaDisponibilidad(): void {
    if (!this.mostrarFormCreacion) {
      // Al mostrar el formulario, limpiar el formArray primero
      while (this.disponibilidadArray.length) {
        this.disponibilidadArray.removeAt(0);
      }
      this.diasSeleccionados.clear();
    }
    this.mostrarFormCreacion = !this.mostrarFormCreacion;
  }

  esDiaRegistrado(diaSemana: number): boolean {
    return this.disponibilidades.some((d) => d.dia_semana === diaSemana);
  }

  guardarDisponibilidad(): void {
    if (
      this.disponibilidadForm.invalid ||
      this.disponibilidadArray.length === 0
    ) {
      this.errorMessage =
        'Por favor complete todos los campos correctamente y agregue al menos un día';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convertir los precios de string a number antes de enviar al servidor
    const disponibilidadData = this.disponibilidadForm.value.disponibilidad.map(
      (item: any) => ({
        ...item,
        precio: parseInt(item.precio, 10),
      })
    );

    // Determinar si estamos creando o actualizando
    const algunDiaExistente = disponibilidadData.some((d: Disponibilidad) =>
      this.disponibilidades.some(
        (existente) => existente.dia_semana === d.dia_semana
      )
    );

    // Si todos los días son nuevos, usar crearDisponibilidad
    // De lo contrario, usar actualizarDisponibilidad
    const accion = algunDiaExistente
      ? this.disponibilidadService.actualizarDisponibilidad(disponibilidadData)
      : this.disponibilidadService.crearDisponibilidad(disponibilidadData);

    accion.subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage =
          response.message || 'Disponibilidad guardada correctamente';
        this.mostrarFormCreacion = false;

        // Recargar los datos
        this.cargarDisponibilidad();

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Error al guardar la disponibilidad';
      },
    });
  }

  // Editar disponibilidad existente
  editarDisponibilidad(): void {
    // Limpiar el formulario actual
    while (this.disponibilidadArray.length) {
      this.disponibilidadArray.removeAt(0);
    }

    // Agregar cada disponibilidad existente al formulario
    this.diasSeleccionados.clear();

    this.disponibilidades.forEach((disp) => {
      const horarioControl = this.fb.group({
        dia_semana: [disp.dia_semana, [Validators.required]],
        hora_inicio: [
          disp.hora_inicio,
          [
            Validators.required,
            Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
          ],
        ],
        hora_fin: [
          disp.hora_fin,
          [
            Validators.required,
            Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
          ],
        ],
        precio: [
          disp.precio.toString(),
          [Validators.required, Validators.min(1), Validators.max(9999999)],
        ],
      });

      this.disponibilidadArray.push(horarioControl);
      this.diasSeleccionados.add(disp.dia_semana);
    });

    this.mostrarFormCreacion = true;
  }

  // Método para limpiar selección de bloques
  limpiarBloqueSeleccionados(): void {
    this.bloquesPredefinidosSeleccionados = [];
    this.precioPersonalizado = 15000; // Restablecer al valor predeterminado
  }

  // Método para seleccionar todos los bloques en un rango horario
  seleccionarBloquesPorRango(rangoHorario: string): void {
    switch (rangoHorario) {
      case 'mañana':
        this.bloquesPredefinidosSeleccionados = this.bloquesPredefinidos.filter(b =>
          ['08:00', '09:00', '10:00', '11:00'].includes(b.horaInicio)
        );
        break;
      case 'tarde':
        this.bloquesPredefinidosSeleccionados = this.bloquesPredefinidos.filter(b =>
          ['14:00', '15:00', '16:00', '17:00'].includes(b.horaInicio)
        );
        break;
      case 'todos':
        this.bloquesPredefinidosSeleccionados = [...this.bloquesPredefinidos];
        break;
    }
  }

  // Función auxiliar para formatear horas (agrégala al inicio de la clase)
  private formatearHora(hora: string): string {
    // Si la hora incluye segundos (HH:MM:SS), los quitamos
    if (hora.split(':').length > 2) {
      return hora.substring(0, 5);
    }
    return hora;
  }

  // Añadir esta función para formatear la hora para visualización (sin segundos)
  formatearHoraVisualizacion(hora: string): string {
    if (!hora) return '';
    // Si la hora incluye segundos (HH:MM:SS), los quitamos para visualización
    if (hora.split(':').length > 2) {
      return hora.substring(0, 5);
    }
    return hora;
  }
}
