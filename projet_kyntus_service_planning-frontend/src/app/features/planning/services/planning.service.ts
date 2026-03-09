// features/planning/services/planning.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

// ════════════════════════════════════════════════════
// INTERFACES — ANCIEN SYSTÈME (gardées pour compatibilité)
// ════════════════════════════════════════════════════

export interface ShiftConfig {
  shiftId:       number;
  shiftLabel:    string;
  startTime:     string;
  requiredCount: number;
  percentage:    number;
}

export interface DayAssignment {
  assignmentId:      number;
  day:               string;
  assignedDate:      string;
  shiftLabel:        string;
  startTime:         string;
  endTime:           string;       // ✅ NOUVEAU
  isSaturday:        boolean;
  isManagerOverride: boolean;
  breakTime?:        string;
  isOnLeave:         boolean;      // ✅ NOUVEAU
  isHalfDaySaturday: boolean;      // ✅ NOUVEAU
  saturdaySlot:      number;       // ✅ NOUVEAU
  slotLabel:         string;       // ✅ NOUVEAU
}

export interface EmployeePlanning {
  userId:        number;
  fullName:      string;
  isNewEmployee: boolean;
  days:          DayAssignment[];
  managerComment?: string;   // 
}

export interface WeeklyPlanningResponse {
  id:              number;
  weekCode:        string;
  weekStartDate:   string;
  status:          string;
  totalEffectif:   number;
  saturdayGroupId: number;
  subServiceName:  string;
  shiftConfigs:    ShiftConfig[];
  assignments:     EmployeePlanning[];
}

export interface CreatePlanningDto {
  subServiceId:  number;
  weekCode:      string;
  weekStartDate: string;
  totalEffectif: number;
}

export interface GeneratePlanningDto {
  weeklyPlanningId: number;
  totalEffectif:    number;
}

export interface OverrideShiftDto {
  shiftAssignmentId: number;
  newShiftId:        number;
}

export interface SubServiceSimple {
  id:   number;
  name: string;
}

export interface ShiftSimple {
  id:        number;
  label:     string;
  startTime: string;
}

export interface EmployeeItem {
  userId:        number;
  fullName:      string;
  isNewEmployee: boolean;
  isActive:      boolean;
}
export interface SavePlanningCommentDto {
  weeklyPlanningId: number;
  userId:           number;
  comment:          string;
  createdBy:        number;
}

export interface PlanningCommentDto {
  id:        number;
  userId:    number;
  fullName:  string;
  comment:   string;
  createdAt: string;
  updatedAt?: string;

}
// ════════════════════════════════════════════════════
// ✅ NOUVEAU — INTERFACES CONFIG SHIFTS
// ════════════════════════════════════════════════════

// Un shift dans le tableau de config (ce que le responsable remplit)
export interface ShiftConfigItem {
  label:              string;    // "Matin", "Tardif"...
  startTime:          string;    // "08:00"
  workHours:          number;    // 8 par défaut
  breakDurationMinutes: number;  // 60 par défaut
  breakRangeStart?:   string;    // "11:00" — null = calculé auto
  breakRangeEnd?:     string;    // "14:00" — null = calculé auto
  requiredCount:      number;    // nb employés sur ce shift
  minPresencePercent: number;    // 70 par défaut
  displayOrder:       number;    // ordre dans le tableau
}

// Ce que le responsable envoie pour sauvegarder sa config
export interface SaveShiftConfigDto {
  subServiceId:  number;
  weekCode:      string;
  weekStartDate: string;
  shifts:        ShiftConfigItem[];
}

// Réponse d'un shift après sauvegarde (avec les calculs auto)
export interface ShiftConfigResponseNew {
  id:                   number;
  label:                string;
  startTime:            string;
  endTime:              string;    // calculé : début + workHours + pause
  workHours:            number;
  breakRangeStart:      string;
  breakRangeEnd:        string;
  breakDurationMinutes: number;
  requiredCount:        number;
  percentage:           number;    // calculé auto
  minPresencePercent:   number;
  displayOrder:         number;
}

// Réponse config complète d'une semaine
export interface WeekShiftConfigResponse {
  subServiceId:    number;
  subServiceName:  string;
  weekCode:        string;
  weekStartDate:   string;
  totalEffectif:   number;
  shifts:          ShiftConfigResponseNew[];
}

// Ce qu'on envoie pour déclencher la génération depuis la config
export interface GeneratePlanningFromConfigDto {
  subServiceId:      number;
  weekCode:          string;
  weeklyPlanningId:  number;
}

// ════════════════════════════════════════════════════
// ✅ NOUVEAU — SHIFTS DISPONIBLES (horaires flexibles)
// ════════════════════════════════════════════════════
export interface ShiftOption {
  label:     string;   // "08:00", "08:30"...
  value:     string;   // "08:00"
}

// ════════════════════════════════════════════════════
// SERVICE
// ════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class PlanningService {

  private base      = `${environment.apiUrl}/planning`;
  private subSvcUrl = `${environment.apiUrl}/SubServices`;

  constructor(private http: HttpClient) {}

  // ── CRUD Planning ──────────────────────────────────

  create(dto: CreatePlanningDto): Observable<WeeklyPlanningResponse> {
    return this.http.post<WeeklyPlanningResponse>(this.base, dto);
  }

  getById(id: number): Observable<WeeklyPlanningResponse> {
    return this.http.get<WeeklyPlanningResponse>(`${this.base}/${id}`);
  }

  getBySubService(subServiceId: number): Observable<WeeklyPlanningResponse[]> {
    return this.http.get<WeeklyPlanningResponse[]>(
      `${this.base}/subservice/${subServiceId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // ── Génération ancienne (compatibilité) ───────────

  generate(dto: GeneratePlanningDto): Observable<WeeklyPlanningResponse> {
    return this.http.post<WeeklyPlanningResponse>(`${this.base}/generate`, dto);
  }

  // ── ✅ NOUVEAU — Config shifts ─────────────────────

  // Sauvegarder la config shifts du responsable
  saveShiftConfig(dto: SaveShiftConfigDto): Observable<WeekShiftConfigResponse> {
    return this.http.post<WeekShiftConfigResponse>(`${this.base}/config`, dto);
  }

  // Lire la config d'un sous-service pour une semaine
  getShiftConfig(
    subServiceId: number,
    weekCode: string
  ): Observable<WeekShiftConfigResponse> {
    return this.http.get<WeekShiftConfigResponse>(
      `${this.base}/config/${subServiceId}/${weekCode}`);
  }

  // ── ✅ NOUVEAU — Génération depuis config ──────────

  generateFromConfig(
    dto: GeneratePlanningFromConfigDto
  ): Observable<WeeklyPlanningResponse> {
    return this.http.post<WeeklyPlanningResponse>(
      `${this.base}/generate-from-config`, dto);
  }

  // ── Publication + Override ─────────────────────────

  publish(id: number, validatorId: number): Observable<WeeklyPlanningResponse> {
    return this.http.post<WeeklyPlanningResponse>(
      `${this.base}/${id}/publish?validatorId=${validatorId}`, {});
  }

  overrideShift(dto: OverrideShiftDto): Observable<DayAssignment> {
    return this.http.put<DayAssignment>(`${this.base}/override`, dto);
  }

  // ── Groupes samedi ────────────────────────────────

  autoAssignSaturdayGroups(subServiceId: number): Observable<any> {
    return this.http.post(
      `${this.base}/saturday-groups/auto/${subServiceId}`, {});
  }

  setSaturdayGroup(dto: {
    userId: number;
    groupNumber: number;
    isNewEmployee: boolean;
  }): Observable<any> {
    return this.http.post(`${this.base}/saturday-group`, dto);
  }

  getSaturdayGroups(subServiceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/saturday-groups/${subServiceId}`);
  }

  // ── Sous-services + Employés ──────────────────────

  getSubServices(): Observable<SubServiceSimple[]> {
    return this.http.get<SubServiceSimple[]>(this.subSvcUrl);
  }

  getSubServiceEmployees(subServiceId: number): Observable<EmployeeItem[]> {
    return this.http.get<EmployeeItem[]>(
      `${this.subSvcUrl}/${subServiceId}/employees`);
  }
  overrideBreakTime(dto: { shiftAssignmentId: number; newBreakTime: string }): Observable<any> {
  return this.http.put(`${this.base}/override-break`, dto);
}

  // ── ✅ NOUVEAU — Options horaires shifts ──────────
  // Horaires disponibles de 5h à 14h par tranches de 30min
  getShiftStartOptions(): ShiftOption[] {
    const options: ShiftOption[] = [];
    for (let h = 5; h <= 14; h++) {
      options.push({ label: `${h.toString().padStart(2,'0')}:00`,
                     value: `${h.toString().padStart(2,'0')}:00` });
      options.push({ label: `${h.toString().padStart(2,'0')}:30`,
                     value: `${h.toString().padStart(2,'0')}:30` });
    }
    return options;
    // 05:00, 05:30, 06:00 ... 13:30, 14:00
  }
  saveComment(dto: SavePlanningCommentDto): Observable<PlanningCommentDto> {
  return this.http.post<PlanningCommentDto>(`${this.base}/comment`, dto);
}

deleteComment(planningId: number, userId: number): Observable<void> {
  return this.http.delete<void>(`${this.base}/${planningId}/comment/${userId}`);
}

  // Créneaux de pause de 11h à 16h par tranches de 30min
  getBreakSlotOptions(): ShiftOption[] {
    const options: ShiftOption[] = [];
    for (let h = 11; h <= 16; h++) {
      options.push({ label: `${h.toString().padStart(2,'0')}:00`,
                     value: `${h.toString().padStart(2,'0')}:00` });
      if (h < 16) {
        options.push({ label: `${h.toString().padStart(2,'0')}:30`,
                       value: `${h.toString().padStart(2,'0')}:30` });
      }
    }
    return options;
    // 11:00, 11:30, 12:00 ... 15:30, 16:00
  }

  // Calculer heure de fin automatiquement
  calculateEndTime(startTime: string, workHours: number): string {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + (workHours * 60) + 60; // +60 = pause 1h
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2,'0')}:${endM.toString().padStart(2,'0')}`;
    // Ex: 08:00 + 8h + 1h pause = 17:00
  }

  // Ancien getShifts() gardé pour compatibilité
  getShifts(): Observable<ShiftSimple[]> {
    return of([
      { id: 1, label: '8h',  startTime: '08:00' },
      { id: 2, label: '9h',  startTime: '09:00' },
      { id: 3, label: '10h', startTime: '10:00' },
      { id: 4, label: '11h', startTime: '11:00' },
    ]);
  }
}
