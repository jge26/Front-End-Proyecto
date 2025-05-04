import { Component, inject } from '@angular/core';
import { AccesoService } from '../../services/acceso.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Login } from '../../interfaces/Login';
import { ResponseAcceso } from '../../interfaces/RespondeAcceso';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private AccesoService = inject(AccesoService);
  private router = inject(Router);
  public formBuild = inject(FormBuilder);

  public formLogin: FormGroup = this.formBuild.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });
  
  login() {
    if (this.formLogin.invalid) return;

    const objeto: Login = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password
    }

    this.AccesoService.login(objeto).subscribe({
      next: (data: ResponseAcceso) => {
        if (data.status === 'success') {
          localStorage.setItem('token', data.data.token);
          this.router.navigate(['/home']);
        }else {
          alert('Error al iniciar sesion, verifique sus credenciales.');
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesion', error);
        alert('Error al iniciar sesion, verifique sus credenciales.');
      },
    });
  }

  registrarse() {
    this.router.navigate(['register']);
  }

}
