import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex; justify-content:center; align-items:center; height:100vh;">
      <p>Chargement en cours...</p>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    const refresh = this.route.snapshot.queryParams['refresh'];

    if (token) {
      // Stocker les tokens
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refresh);

      // Rediriger vers la page principale Planning
      this.router.navigate(['/dashboard']);
    } else {
      // Pas de token → retour vers Auth
      window.location.href = 'http://localhost:4201/login';
    }
  }
}