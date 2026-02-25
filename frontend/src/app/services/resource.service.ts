import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Resource = {
  Id_resource: number;
  Name: string;
  Resource_type?: string | null;
  Resource_description?: string | null;
};

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private API_URL = 'http://localhost:8080/api/resources';

  constructor(private http: HttpClient) {}

  // Therapist
  getMine() {
    return this.http.get<{ success: boolean; count: number; data: any[] }>(`${this.API_URL}/mine`);
  }

  // Patient
  getFeed() {
    return this.http.get<{ success: boolean; count: number; data: any[] }>(`${this.API_URL}/feed`);
  }

  // Public / Admin
  getAll(params?: any) {
    return this.http.get<{ success: boolean; count: number; data: any[] }>(this.API_URL, { params });
  }

  create(payload: Partial<Resource>) {
    return this.http.post<{ success: boolean; data: any; message?: string }>(this.API_URL, payload);
  }

  update(id: number, payload: Partial<Resource>) {
    return this.http.put<{ success: boolean; data: any; message?: string }>(`${this.API_URL}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.API_URL}/${id}`);
  }
}