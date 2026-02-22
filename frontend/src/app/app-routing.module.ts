import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },  {
    path: 'login-centre',
    loadChildren: () => import('./login-centre/login-centre.module').then( m => m.LoginCentrePageModule)
  },
  {
    path: 'login-therapist',
    loadChildren: () => import('./login-therapist/login-therapist.module').then( m => m.LoginTherapistPageModule)
  },
  {
    path: 'login-patient',
    loadChildren: () => import('./login-patient/login-patient.module').then( m => m.LoginPatientPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
