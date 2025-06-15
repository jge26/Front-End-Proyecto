import { Component, OnInit } from '@angular/core';
import { UserService, User as BaseUser } from '../../services/user.service';

interface User extends BaseUser {
  editing?: boolean;
  backup?: {
    name: string;
    phone: string;
    email: string;
  };
}

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {
  doctors: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Filter only users with role 'DOCTOR'
        this.doctors = users.filter(user => user.id === 2);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }
}
