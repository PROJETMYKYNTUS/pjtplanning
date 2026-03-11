namespace PlanningService.DTOs.Planning;

// ── Créer un planning ──
public class CreateWeeklyPlanningDto
{
    public int SubServiceId { get; set; }
    public string WeekCode { get; set; } = string.Empty; // ex: "2026-W10"
    public DateOnly WeekStartDate { get; set; }
    public int TotalEffectif { get; set; } // nombre total d'employés voulus
}

// ── Générer le planning automatiquement ──
public class GeneratePlanningDto
{
    public int WeeklyPlanningId { get; set; }
    public int TotalEffectif { get; set; }
}

// ── Override manuel d'un shift par le manager ──
public class OverrideShiftDto
{
    public int ShiftAssignmentId { get; set; }
    public int NewShiftId { get; set; }
}

// ── Configurer groupe samedi ──
public class SetSaturdayGroupDto
{
    public int UserId { get; set; }
    public int GroupNumber { get; set; } // 1 ou 2
    public bool IsNewEmployee { get; set; } = false;
}

// ── Réponse planning complet ──
public class WeeklyPlanningResponseDto
{
    public int Id { get; set; }
    public string WeekCode { get; set; } = string.Empty;
    public DateOnly WeekStartDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalEffectif { get; set; }
    public int SaturdayGroupId { get; set; }
    public string SubServiceName { get; set; } = string.Empty;
    public List<ShiftConfigResponseDto> ShiftConfigs { get; set; } = new();
    public List<EmployeePlanningDto> Assignments { get; set; } = new();
}

// ── Config shift (% et count) ──
public class ShiftConfigResponseDto
{
    public int ShiftId { get; set; }
    public string ShiftLabel { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public int RequiredCount { get; set; }
    public decimal Percentage { get; set; }
}

// ── Planning d'un employé ──


// ── Shift d'un jour ──
public class DayAssignmentDto
{
    public int AssignmentId { get; set; }
    public string Day { get; set; } = string.Empty; // "Monday"
    public DateOnly AssignedDate { get; set; }
    public string ShiftLabel { get; set; } = string.Empty; // "8h"
    public string StartTime { get; set; } = string.Empty;
    public bool IsSaturday { get; set; }
    public bool IsManagerOverride { get; set; }
    public string EndTime { get; set; } = string.Empty;
    public string? BreakTime { get; set; }  // ex: "12:00"
     public bool   IsOnLeave         { get; set; }
    public bool   IsHalfDaySaturday { get; set; }
    public int    SaturdaySlot      { get; set; }
    public string SlotLabel         { get; set; } = string.Empty;
}

// ── Vue employé (son propre planning) ──
public class MyPlanningDto
{
    public string WeekCode { get; set; } = string.Empty;
    public DateOnly WeekStartDate { get; set; }
    public string SubServiceName { get; set; } = string.Empty;
    public List<DayAssignmentDto> Days { get; set; } = new();
}


// ── Sauvegarder la config shifts d'une semaine ──
public class SaveShiftConfigDto
{
    public int SubServiceId { get; set; }
    public string WeekCode { get; set; } = string.Empty;     // "2026-W10"
    public DateOnly WeekStartDate { get; set; }
    public List<ShiftConfigItemDto> Shifts { get; set; } = new();
}

// ── Un shift dans la config ──
public class ShiftConfigItemDto
{
    public string Label { get; set; } = string.Empty;        // "Matin", "Tardif"
    public string StartTime { get; set; } = string.Empty;    // "08:00"
    public int WorkHours { get; set; } = 8;                  // 8h par défaut
    public int BreakDurationMinutes { get; set; } = 60;      // 1h par défaut

    // Plage pause — par défaut calculée auto (début + 3h → fin - 1h)
    // Le responsable peut modifier
    public string? BreakRangeStart { get; set; }             // "11:00" (nullable = auto)
    public string? BreakRangeEnd { get; set; }               // "14:00" (nullable = auto)

    public int RequiredCount { get; set; }                   // nb employés
    public int MinPresencePercent { get; set; } = 70;        // 70% présents min
    public int DisplayOrder { get; set; }                    // ordre affichage
}

// ── Réponse après sauvegarde config ──
public class ShiftConfigResponseNewDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;      // calculé : début + WorkHours + pause
    public int WorkHours { get; set; }
    public string BreakRangeStart { get; set; } = string.Empty;
    public string BreakRangeEnd { get; set; } = string.Empty;
    public int BreakDurationMinutes { get; set; }
    public int RequiredCount { get; set; }
    public decimal Percentage { get; set; }                  // calculé auto
    public int MinPresencePercent { get; set; }
    public int DisplayOrder { get; set; }
}

// ── Réponse config complète d'une semaine ──
public class WeekShiftConfigResponseDto
{
    public int SubServiceId { get; set; }
    public string SubServiceName { get; set; } = string.Empty;
    public string WeekCode { get; set; } = string.Empty;
    public DateOnly WeekStartDate { get; set; }
    public int TotalEffectif { get; set; }                   // somme des RequiredCount
    public List<ShiftConfigResponseNewDto> Shifts { get; set; } = new();
}

// ── Générer le planning depuis la config ──
public class GeneratePlanningFromConfigDto
{
    public int SubServiceId { get; set; }
    public string WeekCode { get; set; } = string.Empty;
    public int WeeklyPlanningId { get; set; }
}
public class OverrideBreakDto
{
    public int ShiftAssignmentId { get; set; }
    public string NewBreakTime { get; set; } = string.Empty; // "12:30"
}
// ── Sauvegarder un commentaire ──
public class SavePlanningCommentDto
{
    public int WeeklyPlanningId { get; set; }
    public int UserId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int CreatedBy { get; set; }
}

// ── Réponse commentaire ──
public class PlanningCommentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// ── Ajouter dans EmployeePlanningDto ──
// (ajouter cette propriété à la classe existante)
public class EmployeePlanningDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public bool IsNewEmployee { get; set; }
    public int Level { get; set; }
    public List<DayAssignmentDto> Days { get; set; } = new();
    public string? ManagerComment { get; set; }  // ✅ AJOUTER
}
