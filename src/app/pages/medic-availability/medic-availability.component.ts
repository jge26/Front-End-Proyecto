import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

type SlotStatus = 'available' | 'occupied' | 'blocked';

@Component({
  selector: 'app-medic-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './medic-availability.component.html',
  styleUrl: './medic-availability.component.css'
})
export class MedicAvailabilityComponent {

  days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  editing = false;

  availability: { [key: string]: { status: SlotStatus; patient: string | null } } = {};
  private originalAvailability: { [key: string]: { status: SlotStatus; patient: string | null } } = {};

  // <-- Muestra mensaje de éxito después de guardar -->
  public showSuccessMessage: boolean = false;
  
  // <-- Apellido del médico logeado -->
  public currentUserLastname: string = '';

  // <-- Extrae el apellido desde el token JWT almacenado en localStorage -->
  loadCurrentUserLastname() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserLastname = payload.lastname || 'Usuario';
    } catch (error) {
      console.error('No se pudo decodificar el token:', error);
    }
  }

  constructor() {
    this.initializeAvailability();
    this.loadCurrentUserLastname();
  }

  initializeAvailability() {
    for (const day of this.days) {
      for (const time of this.times) {
        const key = `${day}-${time}`;
        this.availability[key] = { status: 'available', patient: null };
      }
    }

    // Simula una hora ocupada como ejemplo
    this.availability['Lun-10:00'] = { status: 'occupied', patient: 'Julio Pérez' };
  }

  startEdit() {
    this.originalAvailability = JSON.parse(JSON.stringify(this.availability));
    this.editing = true;
  }

  cancelEdit() {
    this.availability = JSON.parse(JSON.stringify(this.originalAvailability));
    this.editing = false;
  }

  toggleSlot(day: string, time: string) {
    if (!this.editing) return;

    const key = `${day}-${time}`;
    const current = this.availability[key];

    if (!current || current.status === 'occupied') {
      // No permitir cambios en celdas ocupadas
      return;
    }

    // Alternar entre disponible y bloqueado
    if (current.status === 'available') {
      this.availability[key] = { status: 'blocked', patient: null };
    } else if (current.status === 'blocked') {
      this.availability[key] = { status: 'available', patient: null };
    }
  }

  getPatientName(day: string, time: string): string | null {
    const key = `${day}-${time}`;
    return this.availability[key]?.patient ?? null;
  }

  getStatus(day: string, time: string): SlotStatus {
    const key = `${day}-${time}`;
    return this.availability[key]?.status ?? 'available';
  }

saveSchedule() {
  console.log('Guardando horario:', this.availability);
  this.editing = false;

  // <-- Mostrar mensaje de éxito temporalmente -->
  this.showSuccessMessage = true;
  setTimeout(() => {
    this.showSuccessMessage = false;
  }, 3000); // <-- desaparece en 3 segundos
}
}
