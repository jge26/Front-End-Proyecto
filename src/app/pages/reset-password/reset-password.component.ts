import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccesoService } from '../../services/acceso.service';
import { ResponseAcceso } from '../../interfaces/RespondeAcceso';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  private accesoService = inject(AccesoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);

  public formResetPassword: FormGroup = this.formBuilder.group({
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });

  private token: string = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      alert('Token inválido o ausente.');
      this.router.navigate(['/login']);
    }
  }

  resetPassword() {
    if (this.formResetPassword.invalid) {
      this.formResetPassword.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.formResetPassword.value;

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.accesoService.resetPassword(this.token, newPassword).subscribe({
      next: (data: ResponseAcceso) => {
        if (data.status === 'success') {
          alert('Contraseña restablecida correctamente.');
          this.router.navigate(['/login']);
        } else {
          alert(data.message || 'No se pudo restablecer la contraseña.');
        }
      },
      error: (error: any) => {
        console.error('Error al restablecer la contraseña', error);
        alert('Hubo un error en el proceso.');
      }
    });
  }
}
