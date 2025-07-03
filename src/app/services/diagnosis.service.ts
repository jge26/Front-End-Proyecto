import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiagnosisService {
  private apiUrl = 'http://localhost:8000/api'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  // Crear un nuevo diagnóstico
  createDiagnosis(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrarDiagnostico`, data);
  }

  createLicense(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/emitirLicencia`, data);
  }

  // Obtener diagnósticos de un paciente específico
  getDiagnosesByPatient(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  // Obtener un diagnóstico por ID
  getDiagnosisById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Descargar PDF de licencia
  downloadLicensePDF(appointmentId: number): Observable<Blob> {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.post(
      `${this.apiUrl}/licencia/pdf/citaLicencia`,
      { appointment_id: appointmentId },
      {
        headers,
        responseType: 'blob',
      }
    );
  }

  getHistorialMedico(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.get(`${this.apiUrl}/paciente/historial`, { headers });
  }

  verDiagnostico(appointmentId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.post(
      `${this.apiUrl}/diagnostico/ver`,
      { appointment_id: appointmentId },
      { headers }
    );

  }
}
