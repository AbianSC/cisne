import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ResourceService, Resource } from '../services/resource.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-therapist-resources',
  templateUrl: './therapist-resources.page.html',
  styleUrls: ['./therapist-resources.page.scss'],
  standalone: false,
})
export class TherapistResourcesPage implements OnInit, OnDestroy {
  resources: Resource[] = [];

  form: Partial<Resource> = {
    Name: '',
    Resource_type: '',
    Resource_description: '',
  };

  editingId: number | null = null;
  loading = false;

  private subSesion?: Subscription;

  constructor(
    private resourceService: ResourceService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // carga inicial
    this.loadResources();

    // ✅ si cambias de sesión sin destruir la vista, recargamos
    this.subSesion = this.auth.isLoggedIn$.subscribe(() => {
      this.resetForm();
      this.resources = [];
      this.loadResources();
    });
  }

  ngOnDestroy(): void {
    this.subSesion?.unsubscribe();
  }

  // ✅ Ionic lifecycle: se ejecuta siempre al entrar/volver a la página
  ionViewWillEnter() {
    this.resetForm();
    this.resources = [];
    this.loadResources();
  }

  volver() {
    this.router.navigateByUrl('/dashboard', { replaceUrl: true });
  }

  loadResources() {
    this.loading = true;
    this.resourceService.getMine().subscribe({
      next: (res) => {
        this.resources = res.data || [];
        this.loading = false;
      },
      error: async () => {
        this.loading = false;
        await this.toast('No se pudieron cargar tus recursos.');
      },
    });
  }

  submit() {
    if (!this.form.Name) return;

    if (this.editingId) {
      this.resourceService.update(this.editingId, this.form).subscribe({
        next: async () => {
          await this.toast('Recurso actualizado.');
          this.resetForm();
          this.loadResources();
        },
        error: async () => this.toast('No se pudo actualizar el recurso.'),
      });
    } else {
      this.resourceService.create(this.form).subscribe({
        next: async () => {
          await this.toast('Recurso publicado.');
          this.resetForm();
          this.loadResources();
        },
        error: async () => this.toast('No se pudo publicar el recurso.'),
      });
    }
  }

  edit(resource: Resource) {
    this.editingId = resource.Id_resource;
    this.form = {
      Name: resource.Name,
      Resource_type: resource.Resource_type ?? '',
      Resource_description: resource.Resource_description ?? '',
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async confirmDelete(resource: Resource) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar recurso',
      message: `¿Seguro que quieres eliminar <strong>${resource.Name}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.remove(resource),
        },
      ],
    });

    await alert.present();
  }

  private remove(resource: Resource) {
    this.resourceService.delete(resource.Id_resource).subscribe({
      next: async () => {
        await this.toast('Recurso eliminado.');
        this.loadResources();
      },
      error: async () => this.toast('No se pudo eliminar el recurso.'),
    });
  }

  resetForm() {
    this.editingId = null;
    this.form = { Name: '', Resource_type: '', Resource_description: '' };
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1400,
      position: 'bottom',
    });
    await t.present();
  }
}