import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appSettings } from '../settings/appsettings';

export interface AppointmentRequest {
  doctor_id: number;
  scheduled_at: string; 
  reason: string;
}

export interface AppointmentResponse {
  message: string;
  appointment: any;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = `${appSettings.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  scheduleAppointment(data: AppointmentRequest): Observable<AppointmentResponse> {
    const token = localStorage.getItem('token'); // o como manejes el JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<AppointmentResponse>(this.apiUrl, data, { headers });
  }
}
