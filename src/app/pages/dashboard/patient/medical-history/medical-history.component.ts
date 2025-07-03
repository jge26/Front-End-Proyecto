import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosisService } from '../../../../services/diagnosis.service';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">
        Mi Historial Médico
      </h1>

      <div *ngIf="loading" class="flex justify-center my-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <div
        *ngIf="!loading && errorMessage"
        class="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
      >
        <p class="text-red-700">{{ errorMessage }}</p>
      </div>

      <div
        *ngIf="!loading && !errorMessage && historial.length === 0"
        class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6"
      >
        <p class="text-blue-700">No hay diagnósticos registrados.</p>
      </div>

      <div
        *ngIf="!loading && historial.length > 0"
        class="overflow-x-auto mt-4"
      >
        <p class="text-gray-700 mb-2">
          Se encontraron {{ historial.length }} registros en tu historial
          médico.
        </p>
        <table class="min-w-full text-sm text-left border">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-2 px-4 border-b">Fecha</th>
              <th class="py-2 px-4 border-b">Diagnóstico</th>
              <th class="py-2 px-4 border-b">Tratamiento</th>
              <th class="py-2 px-4 border-b">Doctor</th>
              <th class="py-2 px-4 border-b text-center">Licencia</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of historial">
              <td class="py-2 px-4 border-b">
                {{ item.fecha | date : 'dd/MM/yyyy' }}
              </td>
              <td class="py-2 px-4 border-b">{{ item.diagnostico }}</td>
              <td class="py-2 px-4 border-b">{{ item.tratamiento }}</td>
              <td class="py-2 px-4 border-b">{{ item.doctor }}</td>
              <td class="py-2 px-4 border-b text-center">
                <ng-container *ngIf="item.tieneLicencia; else noLicencia">
                  <button
                    class="inline-block px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    (click)="descargarPDF(item.cita_id)"
                  >
                    Descargar PDF
                  </button>
                </ng-container>
                <ng-template #noLicencia>
                  <span class="text-gray-400 italic">No emitida</span>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class MedicalHistoryComponent implements OnInit {
  loading = true;
  errorMessage = '';
  historial: any[] = [];

  constructor(private diagnosisService: DiagnosisService) {}

  ngOnInit() {
    this.diagnosisService.getHistorialMedico().subscribe({
      next: (res) => {
        this.historial = res.map((item: any) => ({
          ...item,
          fecha: new Date(item.fecha),
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo cargar el historial. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  descargarPDF(citaId: number) {
    this.diagnosisService.downloadLicensePDF(citaId).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `licencia_cita_${citaId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        alert('No se pudo descargar la licencia.');
      }
    });
  }

}
