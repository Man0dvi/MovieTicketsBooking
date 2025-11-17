// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000'; // json-server

  constructor(private http: HttpClient) {}

  private url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  get<T>(path: string, params?: HttpParams | { [key: string]: string | string[] }): Observable<T> {
    return this.http.get<T>(this.url(path), { params });
  }

  post<T>(path: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(this.url(path), body, { headers });
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }
}
