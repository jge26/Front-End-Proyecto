import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserManage } from '../../models/user.model';

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.css']
})
export class UserManageComponent implements OnInit {

  // <-- Lista de usuarios cargada desde el backend -->
  users: UserManage[] = [];

  // <-- Apellido del usuario logeado extraído del token -->
  public currentUserLastname: string = '';

  constructor(private userService: UserService) {}

  // <-- Cargar usuarios reales al iniciar el componente -->
  ngOnInit() {
    this.loadCurrentUserLastname();

    this.userService.getAllUsers().subscribe(response => {
      this.users = response.data;
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

  // <-- Entrar en modo edición -->
  startEdit(user: UserManage) {
    user.backup = {
      name: user.name,
      phone: user.phone,
      email: user.email
    };
    user.editing = true;
  }

  // <-- Cancelar edición y restaurar datos -->
  cancelEdit(user: UserManage) {
    if (user.backup) {
      user.name = user.backup.name;
      user.phone = user.backup.phone;
      user.email = user.backup.email;
    }
    user.editing = false;
  }

  // <-- Guardar cambios -->
  save(user: UserManage) {
    const payload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email
    };

    this.userService.updateUser(payload).subscribe({
      next: () => {
        user.editing = false;
        delete user.backup;
        alert('Usuario actualizado correctamente.');
      },
      error: () => {
        alert('Error al guardar los cambios.');
      }
    });
  }

  // <-- Cambiar estado habilitado/deshabilitado -->
  toggleStatus(user: UserManage) {
    const newStatus = user.enabled ? 0 : 1;

    this.userService.toggleStatus(user.rut, newStatus).subscribe({
      next: () => {
        user.enabled = newStatus;
        console.log(`Estado actualizado a ${newStatus}`);
      },
      error: () => {
        alert('Error al actualizar estado');
      }
    });
  }
}