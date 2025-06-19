import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Day {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isAvailable: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <button (click)="previousMonth()" class="calendar-nav-button" aria-label="Mes anterior">
          <span aria-hidden="true">&lt;</span>
        </button>
        <h2 class="calendar-title">{{ currentDate | date:'MMMM yyyy':'':'es' }}</h2>
        <button (click)="nextMonth()" class="calendar-nav-button" aria-label="Mes siguiente">
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      <div class="weekday-header">
        <div *ngFor="let day of weekDays" class="weekday">{{ day }}</div>
      </div>

      <div class="calendar-grid">
        <div *ngFor="let day of days" class="day"
            [ngClass]="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'available': day.isAvailable,
              'selected': day.isSelected,
              'unavailable': !day.isAvailable
            }"
            (click)="selectDay(day)">
          {{ day.dayOfMonth }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      width: 100%;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #f8f9fa;
    }

    .calendar-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      text-transform: capitalize;
    }

    .calendar-nav-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 4px 8px;
      color: #495057;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .calendar-nav-button:hover {
      background-color: #e9ecef;
    }

    .weekday-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-bottom: 1px solid #dee2e6;
    }

    .weekday {
      text-align: center;
      padding: 8px 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #495057;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .day {
      position: relative;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .day:hover:not(.unavailable):not(.other-month) {
      background-color: #e9ecef;
    }

    .other-month {
      color: #adb5bd;
      pointer-events: none;
    }

    .today {
      font-weight: bold;
      color: #007bff;
    }

    .available {
      cursor: pointer;
    }

    .selected {
      background-color: #007bff;
      color: white;
      font-weight: bold;
    }

    .selected:hover {
      background-color: #0069d9;
    }

    .unavailable {
      color: #ced4da;
      pointer-events: none;
      text-decoration: line-through;
      opacity: 0.5;
    }
  `]
})
export class CalendarSelectorComponent implements OnInit, OnChanges {
  @Input() availableDays: string[] = []; // Formato 'YYYY-MM-DD'
  @Input() availableWeekDays: string[] = []; // Ej: ['Lunes', 'Martes', etc]
  @Output() dateSelected = new EventEmitter<string>();

  currentDate = new Date();
  days: Day[] = [];
  selectedDate: Date | null = null;
  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  ngOnInit() {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['availableDays'] || changes['availableWeekDays']) {
      this.generateCalendar();
    }
  }

  generateCalendar() {
    this.days = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Primer día del mes actual
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajustar primer día a lunes (en JS, 0 es domingo, 1 es lunes)
    let firstDayOfGrid = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convertir 0 (domingo) a 6, y restar 1 de los demás
    firstDayOfGrid.setDate(firstDayOfMonth.getDate() - diff);

    // Generar 6 semanas de días (42 días)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Modificar para usar tanto días específicos como días de la semana
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDayOfGrid);
      date.setDate(firstDayOfGrid.getDate() + i);

      const dateStr = this.formatDate(date);

      // Verificar si está disponible según día específico o día de la semana
      const isSpecificDayAvailable = this.availableDays.includes(dateStr);

      // Verificar si el día de la semana está disponible
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const diaSemana = diasSemana[date.getDay()];
      const isWeekDayAvailable = this.availableWeekDays.includes(diaSemana);

      const isAvailable = isSpecificDayAvailable || isWeekDayAvailable;
      const isCurrentMonth = date.getMonth() === month;
      const isPastDate = date < today;

      this.days.push({
        date: date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: isCurrentMonth,
        isToday: this.isSameDay(date, today),
        isAvailable: isAvailable && !isPastDate && isCurrentMonth,
        isSelected: this.selectedDate ? this.isSameDay(date, this.selectedDate) : false
      });
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDay(day: Day) {
    // No permitir seleccionar días que no son del mes actual, no están disponibles o son días pasados
    if (!day.isCurrentMonth || !day.isAvailable) return;

    // Verificar si el día es anterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (day.date < today) {
      return; // No hacer nada si es un día pasado
    }

    this.days = this.days.map(d => ({
      ...d,
      isSelected: this.isSameDay(d.date, day.date)
    }));

    this.selectedDate = day.date;
    const dateStr = this.formatDate(day.date);
    this.dateSelected.emit(dateStr);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isDateAvailable(dateStr: string): boolean {
    return this.availableDays.length === 0 || this.availableDays.includes(dateStr);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
