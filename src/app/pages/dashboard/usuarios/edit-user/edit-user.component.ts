import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserListItem } from '../../../../interfaces/UserList';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="user" class="bg-white shadow-md rounded-lg">
      <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <input
              type="text"
              formControlName="name"
              id="name"
              class="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EC4B6] focus:border-[#2EC4B6] sm:text-sm p-2.5 border"
              [ngClass]="{'border-red-500 bg-red-50': submitted && f['name'].errors}"
            />
          </div>
          <div *ngIf="submitted && f['name'].errors" class="mt-1 text-sm text-red-600">
            <div *ngIf="f['name'].errors['required']">El nombre es obligatorio</div>
            <div *ngIf="f['name'].errors['minlength']">El nombre debe tener al menos 3 caracteres</div>
            <div *ngIf="f['name'].errors['maxlength']">El nombre no debe exceder los 32 caracteres</div>
            <div *ngIf="f['name'].errors['pattern']">El nombre solo puede contener letras</div>
          </div>
        </div>

        <div>
          <label for="lastname" class="block text-sm font-medium text-gray-700 mb-1">
            Apellido
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <input
              type="text"
              formControlName="lastname"
              id="lastname"
              class="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EC4B6] focus:border-[#2EC4B6] sm:text-sm p-2.5 border"
              [ngClass]="{'border-red-500 bg-red-50': submitted && f['lastname'].errors}"
            />
          </div>
          <div *ngIf="submitted && f['lastname'].errors" class="mt-1 text-sm text-red-600">
            <div *ngIf="f['lastname'].errors['required']">El apellido es obligatorio</div>
            <div *ngIf="f['lastname'].errors['minlength']">El apellido debe tener al menos 3 caracteres</div>
            <div *ngIf="f['lastname'].errors['maxlength']">El apellido no debe exceder los 32 caracteres</div>
            <div *ngIf="f['lastname'].errors['pattern']">El apellido solo puede contener letras</div>
          </div>
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <input
              type="text"
              formControlName="phone"
              id="phone"
              placeholder="+56 9 XXXX XXXX"
              class="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EC4B6] focus:border-[#2EC4B6] sm:text-sm p-2.5 border"
              [ngClass]="{'border-red-500 bg-red-50': submitted && f['phone'].errors}"
            />
          </div>
          <div *ngIf="submitted && f['phone'].errors" class="mt-1 text-sm text-red-600">
            <div *ngIf="f['phone'].errors['required']">El teléfono es obligatorio</div>
            <div *ngIf="f['phone'].errors['pattern']">Formato inválido. Debe comenzar con +56 seguido de 9 dígitos</div>
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <input
              type="email"
              formControlName="email"
              id="email"
              class="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EC4B6] focus:border-[#2EC4B6] sm:text-sm p-2.5 border"
              [ngClass]="{'border-red-500 bg-red-50': submitted && f['email'].errors}"
            />
          </div>
          <div *ngIf="submitted && f['email'].errors" class="mt-1 text-sm text-red-600">
            <div *ngIf="f['email'].errors['required']">El email es obligatorio</div>
            <div *ngIf="f['email'].errors['email']">Ingrese un email válido</div>
            <div *ngIf="f['email'].errors['pattern']">El formato del email no es válido</div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#2EC4B6] text-white rounded-md hover:bg-[#27ADA1]">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  `,
})
export class EditUserComponent implements OnInit {
  @Input() user!: UserListItem;
  @Output() save = new EventEmitter<Partial<UserListItem>>();
  @Output() cancel = new EventEmitter<void>();

  editForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.editForm = this.fb.group({
      name: [
        this.user?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(32),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
        ]
      ],
      lastname: [
        this.user?.lastname || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(32),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
        ]
      ],
      phone: [
        this.user?.phone || '',
        [
          Validators.required,
          Validators.pattern('^\\+56[0-9]{9}$') // Formato: +56 seguido de 9 dígitos
        ]
      ],
      email: [
        this.user?.email || '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
        ]
      ],
    });
  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.editForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      return;
    }

    this.save.emit(this.editForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Función auxiliar para marcar todos los campos como tocados
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
