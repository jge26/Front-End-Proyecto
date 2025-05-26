import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// <-- Define los posibles estados de una casilla del horario -->
type SlotStatus = 'available' | 'occupied' | 'blocked';

@Component({
  selector: 'app-medic-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './medic-availability.component.html',
  styleUrl: './medic-availability.component.css'
})
export class MedicAvailabilityComponent {

  // <-- Arreglos con los días y horas disponibles para agendar -->
  days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  editing = false;

  // <-- Objeto que contiene el estado de cada celda del horario -->
  availability: { [key: string]: { status: SlotStatus; patient: string | null } } = {};
  private originalAvailability: { [key: string]: { status: SlotStatus; patient: string | null } } = {};

  // <-- Constructor que inicializa todo el horario como disponible -->
  constructor() {
    this.initializeAvailability();
  }

  // <-- Llena el horario marcando todas las celdas como disponibles por defecto -->
  initializeAvailability() {
    for (const day of this.days) {
      for (const time of this.times) {
        const key = `${day}-${time}`;
        this.availability[key] = { status: 'available', patient: null };
      }
    }
  }

  // <-- Activa el modo edición y guarda el estado actual por si se cancela -->
  startEdit() {
    this.originalAvailability = JSON.parse(JSON.stringify(this.availability));
    this.editing = true;
  }

  // <-- Cancela la edición y restaura el horario original -->
  cancelEdit() {
    this.availability = JSON.parse(JSON.stringify(this.originalAvailability));
    this.editing = false;
  }

  // <-- Cambia el estado de una casilla al hacer clic: disponible → ocupado → bloqueado → disponible -->
  toggleSlot(day: string, time: string) {
    if (!this.editing) return;

    const key = `${day}-${time}`;
    const current = this.availability[key];

    if (!current) {
      this.availability[key] = { status: 'occupied', patient: 'Julio Pérez' };
    } else {
      switch (current.status) {
        case 'available':
          this.availability[key] = { status: 'occupied', patient: 'Julio Pérez' };
          break;
        case 'occupied':
          this.availability[key] = { status: 'blocked', patient: null };
          break;
        case 'blocked':
          this.availability[key] = { status: 'available', patient: null };
          break;
      }
    }
  }

  // <-- Retorna true si la celda está disponible -->
  isAvailable(day: string, time: string): boolean {
    const key = `${day}-${time}`;
    return this.availability[key]?.status === 'available';
  }

  // <-- Retorna el nombre del paciente si la celda está ocupada -->
  getPatientName(day: string, time: string): string | null {
    const key = `${day}-${time}`;
    return this.availability[key]?.patient ?? null;
  }

  // <-- Retorna el estado actual de la celda -->
  getStatus(day: string, time: string): SlotStatus {
    const key = `${day}-${time}`;
    return this.availability[key]?.status ?? 'available';
  }

  // <-- Guarda el horario actualizado (actualmente solo muestra en consola) -->
  saveSchedule() {
    console.log('Guardando horario:', this.availability);
    this.editing = false;
  }
}
