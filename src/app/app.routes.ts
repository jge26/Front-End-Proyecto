import { Routes } from '@angular/router';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { MedicRegisterComponent } from './pages/medic-register/medic-register.component';

export const routes: Routes = [
    
    {
        path: '',
        redirectTo: 'UserRegister',
        pathMatch: 'full',
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
