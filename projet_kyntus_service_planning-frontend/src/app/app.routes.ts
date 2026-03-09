import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-home/dashboard-home.component')
        .then(m => m.DashboardHomeComponent)
  },
  // ─── Floors ───────────────────────────────────────────
  {
    path: 'floors',
    loadComponent: () =>
      import('./features/floors/pages/floor-list/floor-list.component')
        .then(m => m.FloorListComponent)
  },
  {
    path: 'floors/create',
    loadComponent: () =>
      import('./features/floors/pages/floor-form/floor-form.component')
        .then(m => m.FloorFormComponent)
  },
  {
    path: 'floors/edit/:id',
    loadComponent: () =>
      import('./features/floors/pages/floor-form/floor-form.component')
        .then(m => m.FloorFormComponent)
  },
  {
    path: 'floors/:id',
    loadComponent: () =>
      import('./features/floors/pages/floor-detail/floor-detail.component')
        .then(m => m.FloorDetailComponent)
  },
  // ─── Services ─────────────────────────────────────────
  {
    path: 'services',
    loadChildren: () =>
      import('./features/services/services-routing-modules').then(m => m.ServicesRoutingModule)
  },
  {
    path: 'sub-services',
    loadChildren: () =>
      import('./features/sub-services/sub-services-routing-module').then(m => m.SubServicesRoutingModule)
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users-routing-module').then(m => m.UsersRoutingModule)
  },
  {
    path: 'contracts',
    loadChildren: () =>
      import('./features/contract/contract-routing-module')
        .then(m => m.ContractRoutingModule)
  },
  {
    path: 'import',
    loadComponent: () =>
      import('./features/users/pages/user-import/user-import.component')
        .then(m => m.UserImportComponent)
  },
  {
    path: 'planning',
    loadChildren: () =>
      import('./features/planning/planning-routing-module').then(m => m.PlanningRoutingModule)
  },
  // ✅ conge AVANT le wildcard **
  {
    path: 'conge',
    loadComponent: () =>
      import('./features/planning/pages/conge-manager/conge-manager.component')
        .then(m => m.CongeManagerComponent)
  },
  {
  path: "new-employees",
  loadComponent: () =>
    import("./features/planning/pages/new-employee-manager/new-employee-manager.component")
      .then(m => m.NewEmployeeManagerComponent)
},

  // ✅ Wildcard TOUJOURS EN DERNIER
  { path: '**', redirectTo: 'dashboard' },
];