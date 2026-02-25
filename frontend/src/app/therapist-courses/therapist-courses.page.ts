import { Component } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CourseService } from '../services/course.service';

type Curso = {
  Id_course: number;
  Name: string;
  Teacher?: string;
  Price?: number;
  Course_type?: string;
  Course_description?: string;
  Course_Date?: string | null;
  centres?: any[]; // por si viene include centres
};

@Component({
  selector: 'app-therapist-courses',
  templateUrl: './therapist-courses.page.html',
  styleUrls: ['./therapist-courses.page.scss'],
  standalone: false,
})
export class TherapistCoursesPage {
  segment: 'disponibles' | 'mios' = 'disponibles';

  disponibles: Curso[] = [];
  mios: Curso[] = [];

  cargando = false;

  constructor(
    private courseService: CourseService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.cargar();
  }

  async cargar() {
    this.cargando = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando cursos...' });
    await loading.present();

    try {
      const [disp, mios] = await Promise.all([
        this.courseService.getAvailableForMe().toPromise(),
        this.courseService.getMyCourses().toPromise(),
      ]);

      this.disponibles = disp?.data || [];
      this.mios = mios?.data || [];
    } catch (e: any) {
      await this.presentAlert('Cursos', e?.error?.message || 'No se pudieron cargar los cursos.');
    } finally {
      this.cargando = false;
      await loading.dismiss();
    }
  }

  volver() {
    this.router.navigateByUrl('/dashboard');
  }

  async adquirir(curso: Curso) {
    const confirm = await this.alertCtrl.create({
      header: 'Adquirir curso',
      message: `¿Quieres adquirir el curso <b>${curso.Name}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Adquirir',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Adquiriendo...' });
            await loading.present();

            try {
              await this.courseService.acquireCourse(curso.Id_course).toPromise();
              await this.presentAlert('Cursos', 'Curso adquirido correctamente ✅');
              await this.cargar(); // refresca listas
              this.segment = 'mios';
            } catch (e: any) {
              await this.presentAlert('Cursos', e?.error?.message || 'No se pudo adquirir el curso.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await confirm.present();
  }

  private async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}