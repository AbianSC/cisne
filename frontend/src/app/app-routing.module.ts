import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {

    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'centre/courses',
    loadChildren: () => import('./centre-courses/centre-courses.module').then(m => m.CentreCoursesPageModule),
    canActivate: [AuthGuard],
  },

  {
    path: 'centre/therapists',
    loadChildren: () => import('./centre-therapists/centre-therapists.module').then(m => m.CentreTherapistsPageModule),
    canActivate: [AuthGuard],
  },

  {
    path: 'therapist/courses',
    loadChildren: () => import('./therapist-courses/therapist-courses.module').then(m => m.TherapistCoursesPageModule),
    canActivate: [AuthGuard],
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
