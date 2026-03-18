import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './component/pages/auth-callback.component';
import { AuthGuard } from './guard/guards/auth';

export const routes: Routes = [
  {
    path: 'auth-callback',
    component: AuthCallbackComponent
    // ← Pas de guard ici !
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-home/dashboard-home.component')
        .then(m => m.DashboardHomeComponent)
  },
  {
    path: 'floors',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/floors/pages/floor-list/floor-list.component')
        .then(m => m.FloorListComponent)
  },
  {
    path: 'floors/create',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/floors/pages/floor-form/floor-form.component')
        .then(m => m.FloorFormComponent)
  },
  {
    path: 'floors/edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/floors/pages/floor-form/floor-form.component')
        .then(m => m.FloorFormComponent)
  },
  {
    path: 'floors/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/floors/pages/floor-detail/floor-detail.component')
        .then(m => m.FloorDetailComponent)
  },
  {
    path: 'services',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/services/services-routing-modules').then(m => m.ServicesRoutingModule)
  },
  {
    path: 'sub-services',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/sub-services/sub-services-routing-module').then(m => m.SubServicesRoutingModule)
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/users/users-routing-module').then(m => m.UsersRoutingModule)
  },
  {
    path: 'contracts',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/contract/contract-routing-module')
        .then(m => m.ContractRoutingModule)
  },
  {
    path: 'import',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/users/pages/user-import/user-import.component')
        .then(m => m.UserImportComponent)
  },
  {
    path: 'planning',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/planning/planning-routing-module').then(m => m.PlanningRoutingModule)
  },
  {
    path: 'conge',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/planning/pages/conge-manager/conge-manager.component')
        .then(m => m.CongeManagerComponent)
  },
  {
    path: 'new-employees',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/planning/pages/new-employee-manager/new-employee-manager.component')
        .then(m => m.NewEmployeeManagerComponent)
  },
  { path: '**', redirectTo: 'dashboard' },
];