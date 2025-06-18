import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent {
  private authService = inject(AuthService);
  currentDate: Date = new Date();

  get userName(): string {
    const user = this.authService.currentUserValue;
    return user ? user.name : '';
  }
}
