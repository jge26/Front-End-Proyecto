import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiagnosisService {
  
    private getHeaders() {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      });
    }
  private apiUrl = 'http://localhost:8000/api/diagnostico'; 

  constructor(private http: HttpClient) {}

  // Crear un nuevo diagnóstico
  createDiagnosis(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/registrar`, data, { headers });
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
    return this.http.post(
      `${this.apiUrl}/licencia/pdf/citaLicencia`,
      {
        appointment_id: appointmentId,
      },
      {
        responseType: 'blob', // muy importante para PDF
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
}
