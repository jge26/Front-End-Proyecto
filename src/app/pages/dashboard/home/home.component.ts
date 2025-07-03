import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-semibold mb-6">Bienvenido, {{ userName }}</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Panel para Pacientes -->
        <div *ngIf="isPatient" class="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <h2 class="text-lg font-medium mb-4">Gestionar Mis Citas</h2>
          <p class="mb-4 text-gray-600">Agenda nuevas citas médicas o revisa tus citas existentes.</p>
          <div class="flex space-x-2">
            <a routerLink="/appointments" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Agendar Cita
            </a>
            <a routerLink="/dashboard/appointments" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Ver Mis Citas
            </a>
          </div>
        </div>

        <!-- Panel para Médicos -->
        <div *ngIf="isDoctor" class="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <h2 class="text-lg font-medium mb-4">Gestionar Consultas</h2>
          <p class="mb-4 text-gray-600">Administra tu agenda y revisa tus próximas consultas médicas.</p>
          <div class="flex space-x-2">
            <a routerLink="/dashboard/disponibilidad" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Mi Disponibilidad
            </a>
            <a routerLink="/dashboard/consultas" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Ver Consultas
            </a>
          </div>
        </div>

        <!-- Panel para Administradores -->
        <div *ngIf="isAdmin" class="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <h2 class="text-lg font-medium mb-4">Administración</h2>
          <p class="mb-4 text-gray-600">Administra usuarios, especialidades y configuraciones del sistema.</p>
          <div class="flex space-x-2">
            <a routerLink="/dashboard/users" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Gestionar Usuarios
            </a>
            <a routerLink="/dashboard/settings" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Configuración
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  userName: string = '';
  isAdmin: boolean = false;
  isDoctor: boolean = false;
  isPatient: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userName = `${user.name} ${user.lastname}`;
      this.isAdmin = this.authService.isAdmin();
      this.isDoctor = this.authService.isDoctor();
      this.isPatient = this.authService.isPatient();
    }
  }
}
