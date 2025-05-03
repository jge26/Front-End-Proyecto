import { Component, inject } from '@angular/core';
import { AccesoService } from '../../services/acceso.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicRegister } from '../../interfaces/MedicRegister';

@Component({
  selector: 'app-medic-register',
  standalone: true,
  imports: [],
  templateUrl: './medic-register.component.html',
  styleUrl: './medic-register.component.css'
})
export class MedicRegisterComponent {

  private accesoService = inject(AccesoService);
  private router = inject (Router);
  public formBuild = inject(FormBuilder);
  
  public formRegister: FormGroup = this.formBuild.group({
    name: ['', Validators.required],
    lastname: ['', Validators.required],
    speciality: ['', Validators.required],
    rut: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  registrarMedico() {
    if (this.formRegister.invalid) return;

    const medico: MedicRegister = {
      name: this.formRegister.value.name,
      lastname: this.formRegister.value.lastname,
      speciality: this.formRegister.value.speciality,
      rut: this.formRegister.value.rut,
      phone: this.formRegister.value.phone,
      email: this.formRegister.value.email
    };

    this.accesoService.registrarMedico(medico).subscribe({
      next: (data) => {
        if (data.status === 'success') {
          alert('Médico registrado con éxito.');
          this.router.navigate(['login']);
        } else {
          alert('No se pudo registrar el médico.');
        }
      },
      error: (error) => {
        console.error('Error en el registro de médico:', error);
        alert('Ocurrió un error. Intenta nuevamente más tarde.');
      }
    });
  }

  volver() {
    this.router.navigate(['login']);
  }
}
