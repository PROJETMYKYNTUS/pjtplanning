import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');

    if (!token) {
      // Pas de token → aller vers Auth Frontend
      window.location.href = 'http://localhost:4201/login';
      return false;
    }
    return true;
  }
}