import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-medic',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './medic.component.html',
  styleUrl: './medic.component.css'
})
export class MedicComponent {

  constructor(private router: Router) {}
  
  // <-- Metodo para cerrar sesion -->
  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/home']);
  }

}
