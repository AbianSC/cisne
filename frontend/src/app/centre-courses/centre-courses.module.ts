import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CentreCoursesPageRoutingModule } from './centre-courses-routing.module';
import { CentreCoursesPage } from './centre-courses.page';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, CentreCoursesPageRoutingModule],
  declarations: [CentreCoursesPage],
})
export class CentreCoursesPageModule {}