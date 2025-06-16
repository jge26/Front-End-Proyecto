import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})

export class PatientComponent {

  constructor(private router: Router) {}

  // <-- Cierra la sesión del paciente y redirige al login -->
  logout() {
    localStorage.clear();   
    sessionStorage.clear();  
    this.router.navigate(['/login']);  
  }
}