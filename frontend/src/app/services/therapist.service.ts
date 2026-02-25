import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type CentreTherapist = {
  Id_user_therapist: number;
  firstname: string;
  lastname: string;
  NIF: string;
  phone?: string | null;
  Employs?: { Contract?: string };
  User?: { email: string; role: string };
};

@Injectable({ providedIn: 'root' })
export class CentreService {
  private API = 'http://localhost:8080/api/centres';

  constructor(private http: HttpClient) {}

  // OJO: esto requiere endpoints /me en backend
  getMyTherapists() {
    return this.http.get<{ success: boolean; count: number; data: CentreTherapist[] }>(
      `${this.API}/me/therapists`
    );
  }

  addTherapistToMyCentre(payload: { Id_user_therapist: number; Contract?: string }) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.API}/me/therapists`,
      payload
    );
  }

  removeTherapistFromMyCentre(therapistId: number) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API}/me/therapists/${therapistId}`
    );
  }
}