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
import { UserManageComponent } from './pages/user-manage/user-manage.component';
import { MedicAvailabilityComponent } from './pages/medic-availability/medic-availability.component';
import { adminGuard } from './guards/admin.guard';
import { medicGuard } from './guards/medic.guard';
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
        canActivate: [medicGuard]
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [adminGuard]
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'UserRegister',
        component: UserRegisterComponent,
    },
    {
        path: 'MedicRegister',
        component: MedicRegisterComponent,
        canActivate: [adminGuard]
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
        path: 'user-manage',
         component: UserManageComponent,
         canActivate: [adminGuard]
    },
    { 
        path: 'medic-availability',
         component: MedicAvailabilityComponent,
        canActivate: [medicGuard]
    },
    { 
        path: 'appointment',
         component: AppointmentComponent,
    },
    {     
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
