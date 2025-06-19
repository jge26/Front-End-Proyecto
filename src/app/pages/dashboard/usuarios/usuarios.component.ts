import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Añadir esta importación
import { AdminService } from '../../../services/admin.service';
import { UserListItem } from '../../../interfaces/UserList';
import { AuthService } from '../../../services/auth.service';
import { EditUserComponent } from './edit-user/edit-user.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditUserComponent,
    RouterModule,
  ],
  styleUrls: ['./usuarios.component.css'],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  // Datos y estados
  users: UserListItem[] = [];
  filteredUsers: UserListItem[] = [];
  paginatedUsers: UserListItem[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  searchTerm: string = '';
  selectedUser: UserListItem | null = null;
  showEditModal: boolean = false;
  showToggleModal: boolean = false;

  // Variables para paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  startItem: number = 0;
  endItem: number = 0;

  // Agregar esta propiedad al componente si no existe
  selectedRoleFilter: string = 'all';

  ngOnInit(): void {
    this.loadUsers();
  }

  // Métodos para solucionar los errores de cálculos en expresiones
  getActiveUserCount(): number {
    if (!this.users) return 0;
    return this.users.filter((user) => user.enabled === 1).length;
  }

  getDoctorCount(): number {
    if (!this.users) return 0;
    return this.users.filter((user) => this.getRoleLabel(user) === 'Doctor')
      .length;
  }

  getRoleLabel(user: UserListItem): string {
    try {
      // Intentar acceder a role_id aunque TypeScript no lo reconozca
      const roleId = (user as any).role_id;
      if (roleId === 1) return 'Administrador';
      if (roleId === 2) return 'Doctor';
      if (roleId === 3) return 'Paciente';
    } catch (e) {
      // Si hay error, no hacer nada y continuar con el método alternativo
    }

    // Método alternativo basado en email
    return user.email && user.email.includes('doctor') ? 'Doctor' : 'Paciente';
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Verificar que el usuario actual tenga rol de administrador
    if (!this.authService.isAdmin()) {
      this.errorMessage =
        'No tiene permisos para acceder a esta funcionalidad.';
      this.loading = false;
      return;
    }

    this.adminService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.filteredUsers = [...this.users];
        this.updatePagination();
        this.loading = false;

        if (response.message) {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar los usuarios';
        this.loading = false;
      },
    });
  }

  searchUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.lastname.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.rut.toLowerCase().includes(term)
      );
    }

    this.currentPage = 1; // Resetear a la primera página cuando se busca
    this.updatePagination();
  }

  // Método para filtrar por rol
  filterByRole(): void {
    if (this.selectedRoleFilter === 'all') {
      this.filteredUsers = [...this.users];
    } else if (this.selectedRoleFilter === 'doctor') {
      this.filteredUsers = this.users.filter((user) => {
        try {
          if ((user as any).role_id === 2) return true;
        } catch (e) {}
        return user.email && user.email.includes('doctor');
      });
    } else if (this.selectedRoleFilter === 'patient') {
      this.filteredUsers = this.users.filter((user) => {
        try {
          if ((user as any).role_id === 3) return true;
        } catch (e) {}
        return !user.email || !user.email.includes('doctor');
      });
    } else if (this.selectedRoleFilter === 'admin') {
      this.filteredUsers = this.users.filter((user) => {
        try {
          return (user as any).role_id === 1;
        } catch (e) {
          return false;
        }
      });
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  // Métodos para manejar la paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.goToPage(this.currentPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    const startIdx = (page - 1) * this.itemsPerPage;
    const endIdx = Math.min(
      startIdx + this.itemsPerPage,
      this.filteredUsers.length
    );

    this.startItem = this.filteredUsers.length > 0 ? startIdx + 1 : 0;
    this.endItem = endIdx;

    this.paginatedUsers = this.filteredUsers.slice(startIdx, endIdx);
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  showPageNumber(page: number): boolean {
    return (
      page === 1 ||
      page === this.totalPages ||
      Math.abs(page - this.currentPage) <= 1
    );
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset a la primera página
    this.updatePagination();
  }

  openEditModal(user: UserListItem): void {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  openToggleStatusModal(user: UserListItem): void {
    this.selectedUser = { ...user };
    this.showToggleModal = true;
  }

  closeToggleStatusModal(): void {
    this.showToggleModal = false;
    this.selectedUser = null;
  }

  updateUser(userData: Partial<UserListItem>): void {
    if (!this.selectedUser) return;

    this.adminService.updateUser(this.selectedUser.id, userData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          const index = this.users.findIndex(
            (u) => u.id === this.selectedUser!.id
          );
          if (index !== -1) {
            this.users[index] = { ...response.data };
            this.filteredUsers = [...this.users];
            this.updatePagination();
          }

          this.successMessage = 'Usuario actualizado correctamente.';
          this.closeEditModal();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage =
            response.message || 'Error al actualizar el usuario';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al actualizar el usuario';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      },
    });
  }

  toggleUserStatus(): void {
    if (!this.selectedUser) return;

    const newStatus = this.selectedUser.enabled === 0 ? 1 : 0;

    this.adminService
      .toggleUserStatus(this.selectedUser.id, newStatus === 1)
      .subscribe({
        next: (response) => {
          const index = this.users.findIndex(
            (u) => u.id === this.selectedUser!.id
          );
          if (index !== -1) {
            this.users[index].enabled = newStatus;
            this.filteredUsers = [...this.users];
            this.updatePagination();
          }

          this.successMessage = `Usuario ${
            newStatus === 1 ? 'habilitado' : 'deshabilitado'
          } correctamente.`;
          this.closeToggleStatusModal();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Error al actualizar el estado del usuario';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        },
      });
  }
}
