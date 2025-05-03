import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { MedicRegisterComponent } from './pages/medic-register/medic-register.component';

export const routes: Routes = [
  
  {
    path: '',
    component: HomeComponent,
  },
  
  {
    path: 'home',
    component: HomeComponent,
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
    path: '**',
    redirectTo: '',
  },
];
