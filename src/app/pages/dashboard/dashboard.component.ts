import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, DatePipe, NgIf, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  isAdmin: boolean = false;
  isDoctor: boolean = false;
  isPatient: boolean = false;
  today: Date = new Date();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      this.user = currentUser;

      // Determinar rol del usuario
      this.isAdmin = currentUser.role_id === 1;
      this.isDoctor = currentUser.role_id === 2;
      this.isPatient = currentUser.role_id === 3;
    } else {
      // Si no hay usuario, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
