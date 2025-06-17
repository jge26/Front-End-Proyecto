import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent {
  constructor(private router: Router) {}

  // <-- Metodo para cerrar sesion -->
  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/home']);
  }
}
