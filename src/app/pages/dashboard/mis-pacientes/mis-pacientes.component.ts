import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { DiagnosisService } from '../../../services/diagnosis.service';

// Interfaz para definir el tipo de datos de una cita
interface Cita {
  id: number;
  pacienteIniciales: string;
  pacienteNombre: string;
  pacienteEdad: number;
  fecha: Date;
  hora: string;
  duracion: string;
  estado: string;
  tieneDiagnostico: boolean;
}

@Component({
  selector: 'app-mis-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-pacientes.component.html'
})
export class MisPacientesComponent implements OnInit {

  // Arreglo de citas completadas
  citasCompletadas: Cita[] = [];

  // Estado para el modal
  modalVisible = false;
  diagnosticoActual: any = null;

  constructor(private router: Router, private appointmentService: AppointmentService,private diagnosisService: DiagnosisService) {}

  ngOnInit(): void {
    this.appointmentService.getCitasDelMedico().subscribe({
      next: (res) => {
        this.citasCompletadas = res
          .filter((cita: any) => cita.estado === 'completada')
          .map((cita: any) => ({
            id: cita.id,
            pacienteIniciales: this.getIniciales(cita.paciente?.nombre || 'SN'),
            pacienteNombre: cita.paciente?.nombre || 'Sin nombre',
            pacienteEdad: this.calcularEdad(cita.paciente?.fecha_nacimiento),
            fecha: new Date(cita.fecha),
            hora: cita.hora_inicio,
            duracion: cita.duracion + ' min',
            estado: cita.estado,
            tieneDiagnostico: !!cita.diagnostico
          }));
      },
      error: () => {
        alert('Error al obtener las citas del médico.');
      }
    });
  }

  getIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }  

  // Cerrar modal
  cerrarModal(): void {
    this.modalVisible = false;
    this.diagnosticoActual = null;
  }

  // Si no tiene diagnóstico, se redirige al formulario
  generarDiagnostico(cita: Cita): void {
    console.log('Redirigiendo a diagnóstico para la cita:', cita);
    this.router.navigate(['/dashboard/diagnostico-medico', cita.id]);
  }
  descargarPDF(cita: Cita): void {
    this.diagnosisService.downloadLicensePDF(cita.id).subscribe({
      next: (res) => {
        if (res.url) {
          window.open(res.url, '_blank');
        } else {
          alert('No se encontró la URL del PDF.');
        }
      },
      error: () => {
        alert('No se pudo descargar el diagnóstico.');
      }
    });
  }

  verDiagnostico(cita: Cita): void {
    this.router.navigate(['/dashboard/ver-diagnostico', cita.id]);
  }
}
