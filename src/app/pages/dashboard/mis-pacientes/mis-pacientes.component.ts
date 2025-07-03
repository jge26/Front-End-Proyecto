import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { DiagnosisService } from '../../../services/diagnosis.service';

// Interfaces 
interface Response {

  status: string;
  estadisticas: {
    total: number;
    agendadas: number;
    completadas: number;
    canceladas: number;
  }
  data: Dia[];
}

interface Dia {

  fecha: Date;
  fecha_formateada: string;
  dia_semana: string;
  citas: [];
}

interface Cita {
  id: number;
  paciente: paciente;
  fecha: Date;
  hora: string; 
  fecha_formateada: string;
  hora_formateada: string;
  motivo: string;
  estado: string;
  precio: string;
  observaciones: string;
  puede_cancelar: boolean;
  puede_completar:boolean;
}

interface paciente {

  id: number;
  nombre: string;
  apellido: string;
  nombre_completo: string
  rut: string;
  email: string;
  telefono: string;
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
        const respuesta: Response = res;
        const dias: Dia[] = respuesta.data;
        console.log(dias[0].citas)
        this.citasCompletadas = dias[0].citas
          .filter((cita: Cita) => cita.estado === 'completada')
          .map((cita: Cita) => ({
            id: cita.id,
            paciente: cita.paciente,
            fecha: new Date(cita.fecha),
            hora: cita.hora,
            fecha_formateada: cita.fecha_formateada,
            hora_formateada: cita.hora_formateada,
            motivo: cita.motivo,
            estado: cita.estado,
            precio: cita.precio,
            observaciones: cita.observaciones,
            puede_cancelar: cita.puede_cancelar,
            puede_completar: cita.puede_completar
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
    this.router.navigate(['/dashboard/ver-diagnostico', cita.paciente.id]);
  }
}
