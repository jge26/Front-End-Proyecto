import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  currentDate: Date = new Date();

  get userName(): string {
    const user = this.authService.currentUserValue;
    return user ? user.name : '';
  }
  get isPatient(): boolean {
    return this.authService.isPatient();
  }
  // Métodos para navegar
  goToAgendar() {
    this.router.navigate(['/appointments']);
  }

  goToCitas() {
    this.router.navigate(['/dashboard/appointments']);
  }

  goToHistorial() {
    this.router.navigate(['/dashboard/historia-medica']);
  }
}
