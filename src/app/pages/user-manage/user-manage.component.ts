import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User as BaseUser } from '../../services/user.service';

// <-- Modelo extendido con campos locales para edición -->
interface User extends BaseUser {
  editing?: boolean;
  backup?: {
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
export class UserManageComponent implements OnInit {

  // <-- Lista de usuarios cargada desde el backend -->
  users: User[] = [];

  // <-- Apellido del usuario logeado extraído del token -->
  public currentUserLastname: string = '';

  constructor(private userService: UserService) {}

  // <-- Cargar usuarios reales al iniciar el componente -->
  ngOnInit() {
    this.loadCurrentUserLastname();

    this.userService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
  }

  // <-- Extrae el apellido desde el token JWT almacenado en localStorage -->
  loadCurrentUserLastname() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserLastname = payload.lastname || 'Usuario';
    } catch (error) {
      console.error('No se pudo decodificar el token:', error);
    }
  }

  // <-- Activar o desactivar cuenta de usuario -->
  toggleActive(u: User) {
    u.is_active = !u.is_active;
    this.userService.toggleStatus(u.id, u.is_active).subscribe({
      next: () => console.log(`Usuario ${u.name} actualizado.`),
      error: () => console.error('Error al cambiar el estado del usuario')
    });
  }

  // <-- Entrar en modo edición -->
  startEdit(u: User) {
    u.backup = {
      name: u.name,
      phone: u.phone,
      email: u.email
    };
    u.editing = true;
  }

  // <-- Cancelar edición y restaurar los datos -->
  cancelEdit(u: User) {
    if (u.backup) {
      u.name = u.backup.name;
      u.phone = u.backup.phone;
      u.email = u.backup.email;
    }
    u.editing = false;
  }

  // <-- Guardar cambios de usuario editado -->
  save(u: User) {
    this.userService.updateUser({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email
    }).subscribe({
      next: () => {
        u.editing = false;
        delete u.backup;
        alert('Usuario actualizado correctamente.');
      },
      error: () => alert('Error al guardar los cambios del usuario.')
    });
  }
}
