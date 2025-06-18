import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <svg class="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h1 class="text-2xl font-bold text-gray-900 mt-4">Acceso denegado</h1>
        <p class="text-gray-600 mt-2">No tienes permisos para acceder a esta sección.</p>
        <div class="mt-6">
          <button (click)="volver()" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/']);
  }
}
