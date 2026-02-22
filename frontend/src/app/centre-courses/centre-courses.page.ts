import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Course, CourseService } from '../services/course.service';

@Component({
  selector: 'app-centre-courses',
  templateUrl: './centre-courses.page.html',
  styleUrls: ['./centre-courses.page.scss'],
  standalone: false,
})
export class CentreCoursesPage implements OnInit {
  cursos: Course[] = [];

  form!: FormGroup;
  editingId: number | null = null;

  constructor(
    private courseApi: CourseService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(2)]],
      Teacher: [''],
      Course_type: [''],
      Price: [null],
      Course_Date: [''],
      Course_description: [''],
    });

    this.loadMine();
  }

  async loadMine(event?: any) {
    const loading = await this.loadingCtrl.create({ message: 'Cargando cursos...' });
    await loading.present();

    this.courseApi.getMine().subscribe({
      next: async (res) => {
        this.cursos = res.data || [];
        await loading.dismiss();
        if (event) event.target.complete();
      },
      error: async (err) => {
        await loading.dismiss();
        if (event) event.target.complete();
        const msg = err?.error?.message || 'No se pudieron cargar los cursos.';
        this.toast(msg);
      },
    });
  }

  startCreate() {
    this.editingId = null;
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  startEdit(c: Course) {
    this.editingId = c.Id_course;
    this.form.patchValue({
      Name: c.Name ?? '',
      Teacher: c.Teacher ?? '',
      Course_type: c.Course_type ?? '',
      Price: c.Price ?? null,
      Course_Date: c.Course_Date ?? '',
      Course_description: c.Course_description ?? '',
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    const loading = await this.loadingCtrl.create({ message: this.editingId ? 'Actualizando...' : 'Creando...' });
    await loading.present();

    const obs = this.editingId
      ? this.courseApi.update(this.editingId, payload)
      : this.courseApi.create(payload);

    obs.subscribe({
      next: async () => {
        await loading.dismiss();
        this.toast(this.editingId ? 'Curso actualizado.' : 'Curso creado.');
        this.startCreate();
        this.loadMine();
      },
      error: async (err) => {
        await loading.dismiss();
        const msg = err?.error?.message || 'Error guardando curso.';
        this.toast(msg);
      },
    });
  }

  async confirmDelete(c: Course) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar curso',
      message: `¿Seguro que quieres eliminar <strong>${c.Name}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.delete(c) },
      ],
    });
    await alert.present();
  }

  async delete(c: Course) {
    const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
    await loading.present();

    this.courseApi.delete(c.Id_course).subscribe({
      next: async () => {
        await loading.dismiss();
        this.toast('Curso eliminado.');
        this.loadMine();
      },
      error: async (err) => {
        await loading.dismiss();
        const msg = err?.error?.message || 'Error eliminando curso.';
        this.toast(msg);
      },
    });
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}