import { Component, inject } from '@angular/core';
import { AccesoService } from '../../services/acceso.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Login } from '../../interfaces/Login';
import { ResponseAcceso } from '../../interfaces/RespondeAcceso';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
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
    console.log(objeto);
    this.AccesoService.login(objeto).subscribe({
      next: (data: ResponseAcceso) => {
        if (data.status === 'success') {
          const token = data.data.token;
          const roleId = data.data.user.role_id;
  
          localStorage.setItem('token', token);
  
          //<!-- Redirigir segun el role_id -->
          switch (roleId) {
            case 1:
              this.router.navigate(['/admin']);
              break;
            case 2:
              this.router.navigate(['/patient']);
              break;
            case 3:
              this.router.navigate(['//medic']);
              break;
            default:
              this.router.navigate(['/home']);
          }
        } else {
          alert('Error al iniciar sesión. Verifique sus credenciales.');
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesión', error);
        alert('Error al iniciar sesión. Verifique sus credenciales.');
      },
    });
  }
  
  registrarse() {
    this.router.navigate(['register']);
  }
  
}
