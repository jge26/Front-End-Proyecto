import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Añadir esta importación
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule  // Añadir RouterModule a la lista de imports
  ],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">Mi Perfil</h1>

      <div *ngIf="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div *ngIf="!loading && user">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-lg font-medium text-gray-700 mb-2">Información Personal</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600">Nombre</label>
                <div class="mt-1 text-gray-900">{{user.name}}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600">Apellido</label>
                <div class="mt-1 text-gray-900">{{user.lastname}}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600">Email</label>
                <div class="mt-1 text-gray-900">{{user.email}}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600">Rol</label>
                <div class="mt-1 text-gray-900">
                  <span *ngIf="authService.isPatient()" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Paciente</span>
                  <span *ngIf="authService.isDoctor()" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Médico</span>
                  <span *ngIf="authService.isAdmin()" class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Administrador</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-lg font-medium text-gray-700 mb-2">Acciones</h2>
            <div class="space-y-4">
              <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Editar perfil
              </button>

              <button *ngIf="authService.isPatient()"
                      [routerLink]="['/appointments']"
                      class="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                Agendar cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  loading = true;
  user: any = null;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.loading = false;
  }
}
