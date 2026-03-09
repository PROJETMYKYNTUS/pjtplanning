import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PlanningService,
  WeeklyPlanningResponse,
  EmployeePlanning,
  DayAssignment,
  ShiftSimple,
  ShiftOption,
  SavePlanningCommentDto   // ✅ AJOUTER dans planning.service.ts
} from '../../services/planning.service';

@Component({
  selector: 'app-planning-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning-view.component.html',
  styleUrls: ['./planning-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PlanningViewComponent implements OnInit {

  planning:     WeeklyPlanningResponse | null = null;
  shifts:       ShiftSimple[] = [];
  loading       = false;
  publishing    = false;
  error         = '';
  successMsg    = '';

  // ── Override shift modal ──
  showOverride         = false;
  selectedAssignmentId = 0;
  selectedEmployeeName = '';
  selectedDay          = '';
  selectedNewShiftId   = 0;

  // ── Override pause modal ──
  showBreakOverride         = false;
  selectedBreakAssignmentId = 0;
  selectedBreakEmployeeName = '';
  selectedBreakDay          = '';
  selectedNewBreakTime      = '';
  breakSlotOptions: ShiftOption[] = [];

  // ✅ NOUVEAU — Commentaire modal
  showCommentModal    = false;
  commentEmployeeId   = 0;
  commentEmployeeName = '';
  commentText         = '';
  savingComment       = false;

  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly dayLabels: Record<string, string> = {
    Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mer',
    Thursday: 'Jeu', Friday: 'Ven', Saturday: 'Sam'
  };

  private readonly shiftColorPalette = [
    'shift-color-1', 'shift-color-2', 'shift-color-3', 'shift-color-4',
    'shift-color-5', 'shift-color-6', 'shift-color-7', 'shift-color-8',
  ];

  private shiftColorMap: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planningService: PlanningService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlanning(+id);
      this.loadShifts();
    }
    this.breakSlotOptions = this.planningService.getBreakSlotOptions();
  }

  loadPlanning(id: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.planningService.getById(id).subscribe({
      next: data => {
        this.planning = data;
        this.loading  = false;
        this.buildShiftColorMap(data);
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  buildShiftColorMap(planning: WeeklyPlanningResponse): void {
    this.shiftColorMap = {};
    const labels = [...new Set(
      planning.assignments.flatMap(e => e.days.map(d => d.shiftLabel))
    )].filter(l => l !== 'CONGÉ' && l !== '—');

    labels.forEach((label, index) => {
      this.shiftColorMap[label] =
        this.shiftColorPalette[index % this.shiftColorPalette.length];
    });
  }

  loadShifts(): void {
    this.planningService.getShifts().subscribe({
      next: s => { this.shifts = s; this.cdr.detectChanges(); }
    });
  }

  getShiftColor(label: string): string {
    if (!label || label === 'CONGÉ' || label === '—') return 'shift-off-color';
    return this.shiftColorMap[label] ?? 'shift-color-1';
  }

  // ── Publication ──────────────────────────────────
  publishPlanning(): void {
    if (!this.planning) return;
    this.publishing = true;
    this.cdr.detectChanges();
    this.planningService.publish(this.planning.id, 3).subscribe({
      next: data => {
        this.planning   = data;
        this.publishing = false;
        this.successMsg = 'Planning publié ! Les employés peuvent voir leur planning.';
        this.cdr.detectChanges();
      },
      error: () => { this.publishing = false; this.cdr.detectChanges(); }
    });
  }

  getAssignment(employee: EmployeePlanning, day: string): DayAssignment | null {
    return employee.days.find(d => d.day === day) ?? null;
  }

  // ── Override SHIFT ────────────────────────────────
  openOverride(employee: EmployeePlanning, day: string, event: Event): void {
    event.stopPropagation();
    const assignment = this.getAssignment(employee, day);
    if (!assignment || assignment.isOnLeave) return;
    this.selectedAssignmentId = assignment.assignmentId;
    this.selectedEmployeeName = employee.fullName;
    this.selectedDay          = this.dayLabels[day] ?? day;
    this.selectedNewShiftId   = 0;
    this.showOverride         = true;
    this.cdr.detectChanges();
  }

  closeOverride(): void {
    this.showOverride = false;
    this.cdr.detectChanges();
  }

  confirmOverride(): void {
    if (!this.selectedNewShiftId) return;
    this.planningService.overrideShift({
      shiftAssignmentId: this.selectedAssignmentId,
      newShiftId:        this.selectedNewShiftId
    }).subscribe({
      next: () => {
        this.showOverride = false;
        this.loadPlanning(this.planning!.id);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Override PAUSE ────────────────────────────────
  openBreakOverride(employee: EmployeePlanning, day: string, event: Event): void {
    event.stopPropagation();
    const assignment = this.getAssignment(employee, day);
    if (!assignment || assignment.isOnLeave || !assignment.breakTime) return;
    this.selectedBreakAssignmentId = assignment.assignmentId;
    this.selectedBreakEmployeeName = employee.fullName;
    this.selectedBreakDay          = this.dayLabels[day] ?? day;
    this.selectedNewBreakTime      = assignment.breakTime;
    this.showBreakOverride         = true;
    this.cdr.detectChanges();
  }

  closeBreakOverride(): void {
    this.showBreakOverride = false;
    this.cdr.detectChanges();
  }

  confirmBreakOverride(): void {
    if (!this.selectedNewBreakTime) return;
    this.planningService.overrideBreakTime({
      shiftAssignmentId: this.selectedBreakAssignmentId,
      newBreakTime:      this.selectedNewBreakTime
    }).subscribe({
      next: () => {
        this.showBreakOverride = false;
        this.loadPlanning(this.planning!.id);
        this.cdr.detectChanges();
      },
      error: err => {
        this.error = `Erreur : ${err.error?.message ?? 'Erreur serveur'}`;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ NOUVEAU — COMMENTAIRE ─────────────────────────

  openCommentModal(employee: EmployeePlanning, event: Event): void {
    event.stopPropagation();
    this.commentEmployeeId   = employee.userId;
    this.commentEmployeeName = employee.fullName;
    this.commentText         = employee.managerComment ?? '';
    this.showCommentModal    = true;
    this.error               = '';
    this.cdr.detectChanges();
  }

  closeCommentModal(): void {
    this.showCommentModal = false;
    this.cdr.detectChanges();
  }

  saveComment(): void {
    if (!this.commentText.trim() || !this.planning) return;
    this.savingComment = true;
    this.error         = '';

    const dto: SavePlanningCommentDto = {
      weeklyPlanningId: this.planning.id,
      userId:           this.commentEmployeeId,
      comment:          this.commentText.trim(),
      createdBy:        3  // TODO: remplacer par l'id du responsable connecté
    };

    this.planningService.saveComment(dto).subscribe({
      next: () => {
        this.savingComment    = false;
        this.showCommentModal = false;
        this.successMsg       = '💬 Commentaire sauvegardé !';
        this.loadPlanning(this.planning!.id);
        this.cdr.detectChanges();
        // Effacer le message après 3s
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: err => {
        this.savingComment = false;
        this.error = `Erreur : ${err.error?.message ?? 'Erreur serveur'}`;
        this.cdr.detectChanges();
      }
    });
  }

  deleteComment(employee: EmployeePlanning, event: Event): void {
    event.stopPropagation();
    if (!this.planning) return;
    if (!confirm(`Supprimer le commentaire pour ${employee.fullName} ?`)) return;

    this.planningService.deleteComment(this.planning.id, employee.userId)
      .subscribe({
        next: () => {
          this.loadPlanning(this.planning!.id);
          this.cdr.detectChanges();
        },
        error: err => {
          this.error = `Erreur : ${err.error?.message ?? 'Erreur serveur'}`;
          this.cdr.detectChanges();
        }
      });
  }

  // ── Stats ─────────────────────────────────────────
  getShiftCount(shiftLabel: string): number {
    if (!this.planning) return 0;
    return this.planning.assignments.reduce((total, emp) =>
      total + emp.days.filter(d => d.shiftLabel === shiftLabel).length, 0);
  }

  getUniqueShiftLabels(): string[] {
    if (!this.planning) return [];
    return Object.keys(this.shiftColorMap);
  }

  // ── Navigation ────────────────────────────────────
  goBack(): void { this.router.navigate(['/planning']); }

  getStatusClass(status: string): string {
    return ({ Draft: 'st-draft', Published: 'st-published' } as any)[status] ?? '';
  }

  getStatusLabel(status: string): string {
    return ({ Draft: '📝 Brouillon', Published: '✅ Publié' } as any)[status] ?? status;
  }

  getDateForDay(weekStartDate: string, day: string): string {
    const offsets: Record<string, number> = {
      Monday: 0, Tuesday: 1, Wednesday: 2,
      Thursday: 3, Friday: 4, Saturday: 5
    };
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + (offsets[day] ?? 0));
    return d.getDate() + '/' + (d.getMonth() + 1);
  }
}