import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./dashboard.component.css'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private authService = inject(AuthService);

  user = this.authService.currentUserValue;
  today: Date = new Date(); // Fecha actual para mostrar en el header

  isAdmin = this.authService.isAdmin();
  isDoctor = this.authService.isDoctor();

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
