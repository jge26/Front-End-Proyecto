import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PatientComponent } from './pages/patient/patient.component';
import { MedicComponent } from './pages/medic/medic.component';
import { AdminComponent } from './pages/admin/admin.component';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { MedicRegisterComponent } from './pages/medic-register/medic-register.component';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AppointmentComponent } from './pages/appointment/appointment.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'patient',
        component: PatientComponent,
    },
    {
        path: 'medic',
        component: MedicComponent,
    },
    {
        path: 'admin',
        component: AdminComponent,
    },
    
    {
        path: 'login',
        component: LoginComponent,
    },
    {
      path: 'appointment',
      component: AppointmentComponent,
  },
    {
        path: 'UserRegister',
        component: UserRegisterComponent,
    },
    {
        path: 'MedicRegister',
        component: MedicRegisterComponent,
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
      
    { 
        path: 'reset-password',
         component: ResetPasswordComponent 
    },
    {     
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
