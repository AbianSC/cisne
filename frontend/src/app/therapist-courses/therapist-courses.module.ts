import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TherapistCoursesPageRoutingModule } from './therapist-courses-routing.module';
import { TherapistCoursesPage } from './therapist-courses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TherapistCoursesPageRoutingModule
  ],
  declarations: [TherapistCoursesPage]
})
export class TherapistCoursesPageModule {}