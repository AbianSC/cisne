import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Resource = {
  Id_resource: number;
  Name: string;
  Resource_type?: string | null;
  Resource_description?: string | null;
};

type ApiList<T> = { success: boolean; count: number; data: T[] };
type ApiOne<T> = { success: boolean; data: T; message?: string };
type ApiMsg = { success: boolean; message?: string };

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private API_URL = 'http://localhost:8080/api/resources';

  constructor(private http: HttpClient) {}

  // THERAPIST: mis recursos
  getMine() {
    return this.http.get<ApiList<Resource>>(`${this.API_URL}/mine`);
  }

  // Crear (ADMIN/THERAPIST)
  create(payload: Partial<Resource>) {
    return this.http.post<ApiOne<Resource>>(`${this.API_URL}`, payload);
  }

  // Actualizar (ADMIN/THERAPIST)
  update(id: number, payload: Partial<Resource>) {
    return this.http.put<ApiOne<Resource>>(`${this.API_URL}/${id}`, payload);
  }

  // Eliminar (ADMIN/THERAPIST)
  delete(id: number) {
    return this.http.delete<ApiMsg>(`${this.API_URL}/${id}`);
  }

  // PATIENT: feed
  getFeed() {
    return this.http.get<ApiList<Resource>>(`${this.API_URL}/feed`);
  }
}