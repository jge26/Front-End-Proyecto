import { Routes } from '@angular/router';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { MedicRegisterComponent } from './pages/medic-register/medic-register.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
    
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
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
    },
];
