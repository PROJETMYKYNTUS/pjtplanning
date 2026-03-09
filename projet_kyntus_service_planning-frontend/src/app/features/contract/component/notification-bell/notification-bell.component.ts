// features/contract/components/notification-bell/notification-bell.component.ts

import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ContractService, ContractNotification } from '../../services/contract.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  notifications: ContractNotification[] = [];
  unreadCount = 0;
  isOpen      = false;
  loading     = false;   // ← false par défaut

  private pollSub?: Subscription;

  constructor(
    private contractService: ContractService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← injecter
  ) {}

  ngOnInit(): void {
    this.loadCount();
    this.pollSub = interval(30_000).subscribe(() => this.loadCount());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // ── Compteur badge ──
  loadCount(): void {
    this.contractService.getNotificationsCount().subscribe({
      next: res => {
        this.unreadCount = res.count;
        this.cdr.detectChanges();  // ← forcer mise à jour du badge
      },
      error: () => {}
    });
  }

  // ── Charger les notifs à l'ouverture ──
  loadNotifications(): void {
    this.loading = true;
    this.cdr.detectChanges();  // ← forcer affichage spinner

    this.contractService.getNotifications().subscribe({
      next: data => {
        this.notifications = data.slice(0, 8);
        this.unreadCount   = data.length;
        this.loading       = false;
        this.cdr.detectChanges();  // ← forcer affichage liste
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.loadNotifications();
  }

  closePanel(): void { this.isOpen = false; }

  onNotifClick(n: ContractNotification): void {
    this.router.navigate(['/contracts', n.contractId]);
    this.closePanel();
  }

  goToNotificationList(): void {
    this.router.navigate(['/contracts/notifications']);
    this.closePanel();
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      MiParcoursCDD: '⏳', MiParcoursPeriodeEssai: '📋',
      AvantFinCDD: '⚠️',  AvantFinPeriodeEssai: '⚠️',
      AvantFinStage: '🎓', AvantFinInterim: '🔄',
    };
    return icons[type] ?? '🔔';
  }

  getIconClass(type: string): string {
    if (type.startsWith('AvantFin'))    return 'ic-warn';
    if (type.startsWith('MiParcours')) return 'ic-info';
    return 'ic-default';
  }
}