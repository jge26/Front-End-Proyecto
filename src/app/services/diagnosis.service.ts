import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  private apiUrl = 'http://localhost:8000/api/diagnosis'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  // Crear un nuevo diagnóstico
  createDiagnosis(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
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
  downloadLicensePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/license-pdf`, { responseType: 'blob' });
  }
}
