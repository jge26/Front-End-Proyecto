import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';

interface AdminAppointment {
  id: number;
  doctorNombre: string;
  especialidad: string;
  paciente: string;
  fecha: string;      
  tiempoInicio: string; 
  tiempoFin: string;   
  estado: string;  // 'Pendiente', 'Confirmada', 'Cancelada'  
  razon: string;
  precio: number;
}

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.css']
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: AdminAppointment[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  editForm: FormGroup;
  editingAppointmentId: number | null = null;

  selectedAppointment: AdminAppointment | null = null;

  selectedSpecialty: string = 'all';
  specialties: { id: string, name: string }[] = [];
  viewMode: 'weekly' | 'monthly' = 'weekly';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      fecha: ['', Validators.required],
      tiempoInicio: ['', Validators.required],
      tiempoFin: ['', Validators.required],
      razon: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.errorMessage = 'No autorizado para acceder a esta sección.';
      return;
    }

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAppointmentsAdmin().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          //Mapear cada cita 
          this.appointments = response.data.map((cita: any) => ({
            id: cita.id,
            doctorNombre: `Dr. ${cita.doctor.nombre} ${cita.doctor.apellido}`,
            especialidad: cita.doctor.especialidad?.nombre || 'N/A',
            paciente: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
            fecha: cita.fecha,
            tiempoInicio: cita.hora_inicio,
            tiempoFin: cita.hora_fin,
            estado: cita.estado,
            razon: cita.razon,
            precio: cita.precio
          }));

        } else {
          this.errorMessage = 'Error al cargar las citas médicas.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error en la comunicación con el servidor.';
        this.loading = false;
      }
    });
  }

  //Aquí se sabe si la cita ya ocurrio
  isPastAppointment(appointment: AdminAppointment): boolean {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.fecha}T${appointment.tiempoInicio}`);
    return appointmentDateTime < now;
  }

  // Selecciona una cita para abrir sus acciones
  handleAppointmentClick(appointment: AdminAppointment): void {
    this.selectedAppointment = appointment;
    this.errorMessage = '';
    this.successMessage = '';
  }

  //Editar cita
  startEditing(appointment: AdminAppointment): void {
    if (this.selectedAppointment) {
      if (this.isPastAppointment(this.selectedAppointment)) {
        this.errorMessage = 'No se pueden editar citas pasadas.';
        return;
      }

      this.editingAppointmentId = this.selectedAppointment.id;
      this.editForm.setValue({
        fecha: this.selectedAppointment.fecha,
        tiempoInicio: this.selectedAppointment.tiempoInicio,
        tiempoFin: appointment.tiempoFin,
        razon: '',
      });
    }
  }

  saveChanges(): void {
    if (!this.editForm.valid || this.editingAppointmentId === null) {
      this.errorMessage = 'Formulario inválido.';
      return;
    }

    const changes = this.editForm.value;

    this.appointmentService.updateAppointment(this.editingAppointmentId, changes).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.successMessage = 'Cita modificada correctamente.';
          this.editingAppointmentId = null;
          this.loadAppointments();
        } else {
          this.errorMessage = response.message || 'Error al modificar la cita.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error en la comunicación con el servidor.';
      }
    });
  }

  cancelAppointment(appointment: AdminAppointment): void {
    if (this.selectedAppointment) {
      if (this.isPastAppointment(this.selectedAppointment)) {
        this.errorMessage = 'No se pueden cancelar citas pasadas.';
        return;
      }

      if (!confirm(`¿Seguro que desea cancelar la cita con ${this.selectedAppointment.paciente}?`)) {
        return;
      }

      this.appointmentService.cancelAppointment(this.selectedAppointment.id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.successMessage = 'Cita cancelada correctamente.';
            this.selectedAppointment = null;
            this.loadAppointments();
          } else {
            this.errorMessage = response.message || 'Error al cancelar la cita.';
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'Error en la comunicación con el servidor.';
        },
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  get todayAppointments(): AdminAppointment[] {
    // Filtra solo las citas de hoy y por especialidad si aplica
    const today = new Date().toISOString().split('T')[0];
    return this.appointments.filter(app =>
      app.fecha === today &&
      (this.selectedSpecialty === 'all' || app.especialidad === this.selectedSpecialty)
    )
  }

  cancelEditing(): void {
    this.editingAppointmentId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearSelectedAppointment(): void {
    this.selectedAppointment = null;
  }
}