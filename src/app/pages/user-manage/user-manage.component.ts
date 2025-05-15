import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

//Prueba

interface User {
  id?: number;
  name: string;
  lastname: string;
  rut: string;
  phone: string;
  email: string;
  is_active: boolean;
}

//Prueba


@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [CommonModule, RouterModule], // Agregar despues el form
  templateUrl: './user-manage.component.html',
  styleUrl: './user-manage.component.css'
})
export class UserManageComponent {

  //Prueba

   users: User[] = [
    {
      name: 'Juan',
      lastname: 'Pérez',
      rut: '12.345.678-9',
      phone: '+56 9 8765 4321',
      email: 'juan.perez@mail.com',
      is_active: true
    },
    {
      name: 'María',
      lastname: 'González',
      rut: '23.456.789-0',
      phone: '+56 9 1234 5678',
      email: 'maria.gonzalez@mail.com',
      is_active: false
    },
    {
      name: 'Carlos',
      lastname: 'Ramírez',
      rut: '34.567.890-1',
      phone: '+56 9 5555 6666',
      email: 'carlos.ramirez@mail.com',
      is_active: true
    },
    {
      name: 'Ana',
      lastname: 'Fuentes',
      rut: '45.678.901-2',
      phone: '+56 9 7777 8888',
      email: 'ana.fuentes@mail.com',
      is_active: true
    },
    {
      name: 'Luis',
      lastname: 'López',
      rut: '56.789.012-3',
      phone: '+56 9 9999 0000',
      email: 'luis.lopez@mail.com',
      is_active: false
    }

    //Prueba

  ];

  toggleActive(u: User) {
    u.is_active = !u.is_active;
    // aquí podrías llamar a tu servicio para persistir el cambio
    console.log(`Usuario ${u.name} ${u.lastname} ahora está ${u.is_active ? 'activo' : 'inactivo'}`);
  }
}