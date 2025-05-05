import { Routes } from '@angular/router';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { MedicRegisterComponent } from './pages/medic-register/medic-register.component';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
    
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
        redirectTo: 'login',
        pathMatch: 'full',
    },

];
