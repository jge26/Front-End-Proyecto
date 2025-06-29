import { Routes } from '@angular/router';
import { authGuard, dashboardGuard } from './guards/auth.guard';
import { PatientGuard } from './guards/patient.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [dashboardGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      // Rutas para administradores
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/dashboard/usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },
      {
        path: 'register-doctor',
        loadComponent: () => import('./pages/dashboard/register-doctor/register-doctor.component').then(m => m.RegisterDoctorComponent),
      },
      // Rutas para médicos
      {
        path: 'disponibilidad',
        loadComponent: () => import('./pages/dashboard/disponibilidad/disponibilidad.component').then(m => m.DisponibilidadComponent),
      },
      // Rutas para pacientes
      {
        path: 'appointments',
        loadComponent: () => import('./pages/dashboard/patient/appointments/appointments.component').then(m => m.AppointmentsComponent),
      },
      // Ruta para Admin (Gestión de Citas)
      {
        path: 'admin',
        loadComponent: () => import('./pages/dashboard/admin/admin-appointments.component').then(m => m.AdminAppointmentsComponent),
      },
      {
        path: 'historia-medica',
        loadComponent: () => import('./pages/dashboard/patient/medical-history/medical-history.component').then(m => m.MedicalHistoryComponent),
      },
      // Rutas comunes para todos los usuarios
      {
        path: 'perfil',
        loadComponent: () => import('./pages/dashboard/profile/profile.component').then(m => m.ProfileComponent),
      }
    ]
  },
  // Ruta especial para agendar citas (fuera del dashboard pero protegida)
  {
    path: 'appointments',
    loadComponent: () => import('./pages/appointments/schedule/schedule.component').then(m => m.ScheduleComponent),
    canActivate: [authGuard]
  },
  // Ruta para página no encontrada
  {
    path: '**',
    redirectTo: '',
  }
];
