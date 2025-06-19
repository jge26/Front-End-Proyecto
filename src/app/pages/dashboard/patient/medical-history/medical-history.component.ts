import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">Mi Historial Médico</h1>

      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p class="text-blue-700">Esta funcionalidad estará disponible próximamente.</p>
      </div>

      <div class="prose max-w-none">
        <p>Aquí podrás ver tu historial médico completo, incluyendo:</p>
        <ul>
          <li>Resumen de consultas anteriores</li>
          <li>Tratamientos prescritos</li>
          <li>Resultados de exámenes</li>
          <li>Documentos médicos</li>
        </ul>
      </div>
    </div>
  `
})
export class MedicalHistoryComponent {}
