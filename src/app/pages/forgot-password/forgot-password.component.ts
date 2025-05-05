import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccesoService } from '../../services/acceso.service';
import { ResponseAcceso } from '../../interfaces/RespondeAcceso';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  private accesoService = inject(AccesoService);
  private router = inject(Router);
  public formBuild = inject(FormBuilder);

  public formForgotPassword: FormGroup = this.formBuild.group({
    email: ['', [Validators.required, Validators.email]]
  });

  enviarCorreo() {
    if (this.formForgotPassword.invalid) return;

    const email = this.formForgotPassword.value.email;

    this.accesoService.recoverPassword(email).subscribe({
      next: (data: ResponseAcceso) => {
        if (data.status === 'success') {
          alert('Correo enviado. Revisa tu bandeja de entrada.');
          this.router.navigate(['/login']);
        } else {
          alert(data.message || 'No se pudo enviar el correo.');
        }
      },
      error: (error) => {
        console.error('Error al enviar correo de recuperación', error);
        alert('Hubo un error al enviar el correo.');
      }
    });
  }

}
