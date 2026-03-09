// dashboard-home.component.ts

import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationBellComponent } from '../../../contract/component/notification-bell/notification-bell.component';
// puis dans imports: [..., NotificationBellComponent]

@Component({
  selector: 'app-dashboard-home',
  standalone: true,                      // ← si vous utilisez standalone components
  imports: [CommonModule, RouterModule,NotificationBellComponent ], // ← si standalone
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],

  
  // ✅ CLEF DU PROBLÈME : désactive l'encapsulation CSS d'Angular
  // Sans cette ligne, Angular ajoute des attributs _ngcontent-xxx
  // qui cassent vos sélecteurs CSS (::before, ::after, hover, etc.)
  encapsulation: ViewEncapsulation.None,
})
export class DashboardHomeComponent {}