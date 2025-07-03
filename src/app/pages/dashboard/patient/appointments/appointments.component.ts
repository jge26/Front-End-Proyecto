import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../../services/appointment.service';


@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">
        Mis Citas Médicas
      </h1>

      <div *ngIf="loading" class="flex justify-center my-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <div
        *ngIf="!loading && errorMessage"
        class="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
      >
        <p class="text-red-700">{{ errorMessage }}</p>
      </div>

      <div
        *ngIf="!loading && !errorMessage && appointments.length === 0"
        class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6"
      >
        <p class="text-blue-700">No tienes citas agendadas actualmente.</p>
        <button
          [routerLink]="['/appointments']"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Agendar una cita
        </button>
      </div>

      <div
        *ngIf="!loading && !errorMessage && appointments.length > 0"
        class="space-y-6"
      >
        <!-- Aquí irían las citas del paciente -->
        <p class="text-gray-700">
          Se encontraron {{ appointments.length }} citas
        </p>
        <div
          *ngFor="let cita of appointments"
          class="p-4 bg-gray-50 rounded-lg shadow"
        >
          <p><strong>Fecha:</strong> {{ cita.fecha }} - <strong>Hora:</strong> {{ cita.hora }}</p>
          <p><strong>Estado:</strong> {{ cita.estado }}</p>
          <p><strong>Doctor:</strong> {{ cita.doctor }}</p>
          <p><strong>Especialidad:</strong> {{ cita.especialidad }}</p>
          <p><strong>Motivo:</strong> {{ cita.motivo }}</p>
          <p><strong>Precio:</strong> $ {{ cita.precio }} </p>
          <p><strong>Duracion:</strong> {{ cita.duracion }} minutos </p>
        </div>
      </div>
    </div>
  `,
})
export class AppointmentsComponent implements OnInit {
  loading = true;
  errorMessage = '';
  appointments: any[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.appointmentService.getCitasPaciente().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.appointments = res.data;
        } else {
          this.errorMessage = 'Error al cargar las citas.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          'No se pudieron cargar las citas. Verifica tu sesión.';
      },
    });
  }
}
