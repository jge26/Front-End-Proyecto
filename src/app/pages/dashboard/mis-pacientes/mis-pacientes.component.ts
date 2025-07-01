import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simulación de datos, reemplazar por servicio real en el futuro
    this.citasCompletadas = [
      {
        id: 1,
        pacienteIniciales: 'JP',
        pacienteNombre: 'Juan Pérez',
        pacienteEdad: 35,
        fecha: new Date('2025-06-17T10:00:00'),
        hora: '10:00 AM',
        duracion: '60 min',
        estado: 'Completada',
        tieneDiagnostico: true
      },
      {
        id: 2,
        pacienteIniciales: 'MG',
        pacienteNombre: 'María González',
        pacienteEdad: 42,
        fecha: new Date('2025-06-15T11:30:00'),
        hora: '11:30 AM',
        duracion: '30 min',
        estado: 'Completada',
        tieneDiagnostico: false
      }
    ];
  }

  // Mostrar modal con diagnóstico simulado
  verDiagnostico(cita: Cita): void {
    if (cita.tieneDiagnostico) {
      this.modalVisible = true;
      this.diagnosticoActual = {
        motivo_consulta: 'Dolor abdominal persistente',
        diagnostico: 'Gastritis crónica',
        tratamiento: 'Omeprazol por 14 días',
        medicamentos: 'Omeprazol 20mg',
        notas: 'Se recomienda dieta blanda.',
        licencia: {
          dias: 3,
          fecha_inicio: new Date('2025-06-16'),
          fecha_fin: new Date('2025-06-19'),
          motivo: 'Reposo médico'
        }
      };
    }
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
  descargarPDF() {
  // En el futuro aquí puedes usar jsPDF o generar desde backend
  console.log('Descargando PDF del diagnóstico de:', this.diagnosticoActual?.pacienteNombre);
}
}
