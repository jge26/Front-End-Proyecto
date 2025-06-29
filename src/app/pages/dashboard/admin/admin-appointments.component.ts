import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';

interface Appointment {
  id: number;
  doctor: string;
  patient: string;
  specialty: string;
  date: string;      
  startTime: string; 
  endTime: string;   
  status: string;    
  reason: string;
  cost: number;
}

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.css']
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  editForm: FormGroup;
  editingAppointmentId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    //if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      //this.errorMessage = 'No autorizado para acceder a esta sección.';
      //return;
    //}

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.appointments = response.data;
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

  isPastAppointment(appointment: Appointment): boolean {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    return appointmentDateTime < now;
  }

  startEditing(appointment: Appointment): void {
    if (this.isPastAppointment(appointment)) {
      this.errorMessage = 'No se pueden modificar citas que ya han sido atendidas.';
      return;
    }
    this.editingAppointmentId = appointment.id;
    this.editForm.setValue({
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      reason: appointment.reason,
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing(): void {
    this.editingAppointmentId = null;
    this.errorMessage = '';
    this.successMessage = '';
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

  cancelAppointment(appointment: Appointment): void {
    if (this.isPastAppointment(appointment)) {
      this.errorMessage = 'No se pueden cancelar citas que ya han sido atendidas.';
      return;
    }

    if (!confirm(`¿Seguro que desea cancelar la cita con ${appointment.patient} el ${appointment.date} a las ${appointment.startTime}?`)) {
      return;
    }

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.successMessage = 'Cita cancelada y paciente notificado.';
          this.loadAppointments();
        } else {
          this.errorMessage = response.message || 'Error al cancelar la cita.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error en la comunicación con el servidor.';
      }
    });
  }
}