import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// <-- Modelo de usuario con campos obligatorios y control de edición -->
interface User {
  id?: number;
  name: string;
  lastname: string;
  rut: string;
  phone: string;
  email: string;
  is_active: boolean;
  editing?: boolean; // <-- Controla si está en modo edición -->
  backup?: {         // <-- Almacena copia de los datos para cancelar cambios -->
    name: string;
    phone: string;
    email: string;
  };
}
@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.css']
})
export class UserManageComponent {

  // **Prueba**

  // <-- Lista simulada de usuarios para pruebas, será reemplazada por datos desde el backend -->
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
    
      // **Prueba**

  ];


  //  **Prueba**

  // <-- Activa o desactiva un usuario al hacer clic, simulado con consola -->
  toggleActive(u: User) {
    u.is_active = !u.is_active;
    console.log(`Usuario ${u.name} ${u.lastname} ahora está ${u.is_active ? 'activo' : 'inactivo'}`);
  }
  
  // **Prueba**

  // <-- Entra en modo edición guardando una copia de los datos originales -->
  startEdit(u: User) {
    u.backup = {
      name: u.name,
      phone: u.phone,
      email: u.email
    };
    u.editing = true;
  }

  // <-- Cancela la edición y restaura los datos desde la copia (backup) -->
  cancelEdit(u: User) {
    if (u.backup) {
      u.name  = u.backup.name;
      u.phone = u.backup.phone;
      u.email = u.backup.email;
    }
    u.editing = false;
  }

  // **Prueba**

  // <-- Simula el guardado de cambios del usuario, será reemplazado por una llamada a servicio -->
  save(u: User) {
    console.log('Guardando cambios de', u);
    u.editing = false;
    delete u.backup;
  }

  //  **Prueba** 

}
