import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';


interface AdminAppointment {
  id: number;
  doctorNombre: string;
  especialidad: string;
  paciente: string;
  fecha: string;
  tiempoInicio: string;
  tiempoFin: string;
  estado: string; // 'Pendiente', 'Confirmada', 'Cancelada'
  razon: string;
  precio: number;
}

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatTooltipModule],
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.css'],
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
  specialties: { id: string; name: string }[] = [];
  viewMode: 'weekly' | 'monthly' = 'weekly';
  currentDate: Date = new Date();
  selectedDate: Date = new Date();

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      fecha: ['', Validators.required],
      tiempoInicio: ['', Validators.required],
      tiempoFin: ['', Validators.required],
      razon: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.errorMessage = 'No autorizado para acceder a esta sección.';
      return;
    }

    this.loadAppointments();
    this.loadSpecialties();
  }

  loadAppointments(): void {
    this.loading = true;

    this.appointmentService.getAppointmentsAdmin().subscribe({
      next: (response) => {
        // Verifica si viene como paginación
        const citas = response.data ?? response;

        this.appointments = citas.map((cita: any) => {
          const fechaHora = new Date(cita.scheduled_at);
          const fecha = fechaHora.toISOString().split('T')[0];
          const tiempoInicio = fechaHora.toTimeString().slice(0, 5); // "HH:mm"
          const tiempoFin = this.calcularTiempoFin(
            tiempoInicio,
            cita.duration || 30
          ); // 30 por defecto

          return {
            id: cita.id,
            doctorNombre: `Dr. ${cita.doctor.name} ${cita.doctor.lastname}`,
            especialidad: this.getSpecialtyName(cita.doctor.specialty_id),
            paciente: `${cita.patient.name} ${cita.patient.lastname}`,
            fecha,
            tiempoInicio,
            tiempoFin,
            estado: cita.status,
            razon: cita.reason,
            precio: Number(cita.price),
          };
        });

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.message || 'Error en la comunicación con el servidor.';
        this.loading = false;
      },
    });
  }

  getSpecialtyName(id: number | null): string {
    const found = this.specialties.find((s) => s.id === String(id));
    return found ? found.name : 'N/A';
  }

  calcularTiempoFin(inicio: string, duracion: number): string {
    const [h, m] = inicio.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + duracion);
    return date.toTimeString().slice(0, 5);
  }

  loadSpecialties(): void {
    this.specialties = [
      { id: '1', name: 'Medicina General' },
      { id: '2', name: 'Cardiología' },
      { id: '3', name: 'Pediatría' },
      { id: '4', name: 'Traumatología' },
      { id: '5', name: 'Dermatología' },
      { id: '6', name: 'Psiquiatría' },
      { id: '7', name: 'Ginecología' },
    ];
  }

  // Funciones de calendario
  getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return this.formatDate(date1) === this.formatDate(date2);
  }

  getMonthName(date: Date): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[date.getMonth()];
  }

  getDayName(date: Date): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  }

  getWeekDays(date: Date): Date[] {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  }

  navigateMonth(direction: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(this.currentDate.getMonth() + direction);
    this.currentDate = newDate;
  }

  navigateWeek(direction: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(this.currentDate.getDate() + direction * 7);
    this.currentDate = newDate;
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  getAppointmentsForDate(date: Date): AdminAppointment[] {
    const dateStr = this.formatDate(date);
    return this.appointments.filter((appointment) => {
      const matchesDate = appointment.fecha === dateStr;
      const matchesSpecialty =
        this.selectedSpecialty === 'all' ||
        appointment.especialidad === this.selectedSpecialty;
      return matchesDate && matchesSpecialty;
    });
  }

  // Appointment Functions
  isPastAppointment(appointment: AdminAppointment): boolean {
    const now = new Date();
    const appointmentDateTime = new Date(
      `${appointment.fecha}T${appointment.tiempoInicio}`
    );
    return appointmentDateTime < now;
  }


  handleAppointmentClick(appointment: AdminAppointment): void {
    this.selectedAppointment = appointment;
    this.errorMessage = '';
    this.successMessage = '';
  }


  startEditing(appointment: AdminAppointment): void {
    if (this.isPastAppointment(appointment)) {
      this.errorMessage = 'No se pueden editar citas pasadas.';
      return;
    }

    this.editingAppointmentId = appointment.id;
    this.editForm.setValue({
      fecha: appointment.fecha,
      tiempoInicio: appointment.tiempoInicio,
      tiempoFin: appointment.tiempoFin,
      razon: appointment.razon,
    });
  }

  saveChanges(): void {
    if (!this.editForm.valid || this.editingAppointmentId === null) {
      this.errorMessage = 'Formulario inválido.';
      return;
    }

    const formData = this.editForm.value;

    const payload = {
      appointment_id: this.editingAppointmentId,
      scheduled_at: `${formData.fecha} ${formData.tiempoInicio}`,
      reason: formData.razon,
    };

    this.appointmentService.updateAppointment(payload).subscribe({
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
        this.errorMessage =
          err.message || 'Error en la comunicación con el servidor.';
      },
    });
  }

  cancelAppointment(appointment: AdminAppointment): void {
    if (this.isPastAppointment(appointment)) {
      this.errorMessage = 'No se pueden cancelar citas pasadas.';
      return;
    }

    if (
      !confirm(
        `¿Seguro que desea cancelar la cita con ${appointment.paciente}?`
      )
    ) {
      return;
    }

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: (response) => {

        this.successMessage =
          response.message || 'Cita cancelada correctamente.';
        this.errorMessage = '';
        this.loadAppointments();
      },
      error: (err) => {

        this.errorMessage =
          err.error?.error || err.message || 'Error al cancelar la cita.';
        this.successMessage = '';
      },
    });
  }

  cancelEditing(): void {
    this.editingAppointmentId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearSelectedAppointment(): void {
    this.selectedAppointment = null;
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

  get selectedAppointments(): AdminAppointment[] {
    const selected = this.formatDate(this.selectedDate);
    return this.appointments.filter(
      (app) =>
        app.fecha === selected &&
        (this.selectedSpecialty === 'all' ||
          app.especialidad === this.selectedSpecialty)
    );
  }

  createDate(day: number): Date {
    return new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
  }
}
