// features/planning/pages/conge-manager/conge-manager.component.ts
// VERSION SIMPLIFIÉE — seulement les congés

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { CongeService, CongeItem } from "../../services/conge.service";
import { PlanningService, SubServiceSimple, EmployeeItem } from "../../services/planning.service";

@Component({
  selector: "app-conge-manager",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./conge-manager.component.html",
  styleUrls: ["./conge-manager.component.css"]
})
export class CongeManagerComponent implements OnInit {

  subServices:  SubServiceSimple[] = [];
  conges:       CongeItem[]        = [];
  employees:    EmployeeItem[]     = [];
  subServiceId  = 0;
  loading       = false;
  error         = "";
  successMsg    = "";

  showForm      = false;
  formUserId    = 0;
  formStartDate = "";
  formEndDate   = "";
  formReason    = "";
  saving        = false;

  constructor(
    private congeService:    CongeService,
    private planningService: PlanningService,
    private router:          Router,
    private cdr:             ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.planningService.getSubServices().subscribe({
      next: (data: SubServiceSimple[]) => {
        this.subServices = data;
        if (data.length > 0) {
          this.subServiceId = data[0].id;
          this.loadConges();
          this.loadEmployees();
        }
        this.cdr.detectChanges();
      }
    });
  }

  onSubServiceChange(): void {
    this.loadConges();
    this.loadEmployees();
  }

  loadConges(): void {
    if (!this.subServiceId) return;
    this.loading = true;
    this.congeService.getBySubService(this.subServiceId).subscribe({
      next: (data: CongeItem[]) => {
        this.conges  = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadEmployees(): void {
    this.planningService.getSubServiceEmployees(this.subServiceId).subscribe({
      next: (data: EmployeeItem[]) => { this.employees = data; this.cdr.detectChanges(); }
    });
  }

  openForm(): void {
    this.showForm = true; this.formUserId = 0;
    this.formStartDate = ""; this.formEndDate = "";
    this.formReason = ""; this.error = "";
  }

  closeForm(): void { this.showForm = false; }

  saveConge(): void {


     console.log('formUserId:', this.formUserId, typeof this.formUserId);
  console.log('employees:', this.employees);
  // ✅ Forcer la conversion en number
  const userId = Number(this.formUserId);
  
  if (!userId || !this.formStartDate || !this.formEndDate) {
    this.error = "Veuillez remplir tous les champs obligatoires."; return;
  }
  if (this.formStartDate > this.formEndDate) {
    this.error = "La date de fin doit être après la date de début."; return;
  }
  this.saving = true; this.error = "";
  this.congeService.create({
    userId: userId,  // ✅ number garanti
    startDate: this.formStartDate,
    endDate: this.formEndDate,
    reason: this.formReason
  }).subscribe({
    next: () => {
      this.saving = false; this.showForm = false;
      this.successMsg = "Congé enregistré avec succès !";
      this.loadConges();
      setTimeout(() => { this.successMsg = ""; this.cdr.detectChanges(); }, 3000);
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      this.saving = false;
      this.error = err.error?.message ?? "Erreur lors de la création.";
      this.cdr.detectChanges();
    }
  });
}

  deleteConge(id: number): void {
    if (!confirm("Supprimer ce congé ?")) return;
    this.congeService.delete(id).subscribe({
      next: () => { this.conges = this.conges.filter(c => c.id !== id); this.cdr.detectChanges(); }
    });
  }

  getDaysCount(start: string, end: string): number {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  goBack(): void { this.router.navigate(["/planning"]); }
}