import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Course {
  Id_course: number;
  Name: string;
  Teacher?: string;
  Price?: number;
  Course_type?: string;
  Course_description?: string;
  Course_Date?: string; // DATEONLY
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private API_URL = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) {}

  // Mis cursos del centro: mine=true
  getMine() {
    const params = new HttpParams().set('mine', 'true');
    return this.http.get<{ success: boolean; count: number; data: Course[] }>(this.API_URL, { params });
  }

  create(payload: Partial<Course>) {
    return this.http.post<{ success: boolean; data: Course; message?: string }>(this.API_URL, payload);
  }

  update(id: number, payload: Partial<Course>) {
    return this.http.put<{ success: boolean; data: Course; message?: string }>(`${this.API_URL}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.API_URL}/${id}`);
  }
}