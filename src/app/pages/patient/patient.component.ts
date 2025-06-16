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

  // <-- Metodo para cerrar sesion -->
  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/home']);
  }
}