import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface AssignPatientPayload {
  Id_user_patient: number;
  report?: string;
}

@Injectable({ providedIn: 'root' })
export class TreatsService {
  private readonly API_URL = 'http://localhost:8080/api/therapists';

  constructor(private http: HttpClient) {}

  getMyPatients(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/me/patients`);
  }

  assignPatientToMe(payload: AssignPatientPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/me/patients`, payload);
  }
}