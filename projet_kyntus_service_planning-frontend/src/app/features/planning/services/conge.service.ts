// features/planning/services/conge.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CongeItem {
  id:        number;
  userId:    number;
  fullName:  string;
  startDate: string;
  endDate:   string;
  reason:    string;
  status:    string;
}

export interface CreateCongeDto {
  userId:    number;
  startDate: string;
  endDate:   string;
  reason:    string;
}

export interface SetSaturdaySlotDto {
  userId: number;
  slot:   number; // 1 = 8h-12h | 2 = 12h-16h
}

export interface EmployeeSimple {
  id:                number;
  fullName:          string;
  isNewEmployee:     boolean;
   hireDate:          string;      // ✅ NOUVEAU
  monthsHere:        number; 
  saturdaySlot:      number;
  saturdaySlotLabel: string;
}

@Injectable({ providedIn: 'root' })
export class CongeService {

  private base = `${environment.apiUrl}/Conges`;

  constructor(private http: HttpClient) {}

  // GET /api/Conges/subservice/{id}?weekStart=...
  getBySubService(subServiceId: number, weekStart?: string): Observable<CongeItem[]> {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    return this.http.get<CongeItem[]>(`${this.base}/subservice/${subServiceId}${params}`);
  }

  // GET /api/Conges/{id}
  getById(id: number): Observable<CongeItem> {
    return this.http.get<CongeItem>(`${this.base}/${id}`);
  }
  setNewEmployeeStatus(userId: number, isNewEmployee: boolean): Observable<any> {
  return this.http.put(`${environment.apiUrl}/Users/${userId}/new-employee`,
    { isNewEmployee });
}

  // POST /api/Conges
  create(dto: CreateCongeDto): Observable<CongeItem> {
    return this.http.post<CongeItem>(this.base, dto);
  }

  // PUT /api/Conges/{id}
  update(id: number, dto: CreateCongeDto): Observable<CongeItem> {
    return this.http.put<CongeItem>(`${this.base}/${id}`, dto);
  }

  // DELETE /api/Conges/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // GET /api/Conges/new-employees/{subServiceId}
  getNewEmployees(subServiceId: number): Observable<EmployeeSimple[]> {
    return this.http.get<EmployeeSimple[]>(`${this.base}/new-employees/${subServiceId}`);
  }

  // POST /api/Conges/saturday-slot
  setSaturdaySlot(dto: SetSaturdaySlotDto): Observable<any> {
    return this.http.post(`${this.base}/saturday-slot`, dto);
  }

  // GET /api/Conges/user/{userId}
  getByUser(userId: number): Observable<CongeItem[]> {
    return this.http.get<CongeItem[]>(`${this.base}/user/${userId}`);
  }
}