import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, Role } from '../services/auth';

type TarjetaDashboard = {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta?: string; // para futuro (cuando crees rutas internas)
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  user: { id: number; email: string; role: Role } | null = null;
  tarjetas: TarjetaDashboard[] = [];

  private subSesion?: Subscription;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    // carga inicial
    this.cargarDashboard();

    // recarga automática cuando login/register actualiza la sesión
    this.subSesion = this.auth.isLoggedIn$.subscribe(() => {
      this.cargarDashboard();
    });
  }

  ngOnDestroy(): void {
    this.subSesion?.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }

  irA(tarjeta: TarjetaDashboard): void {
    if (tarjeta.ruta) this.router.navigateByUrl(tarjeta.ruta);
  }

  private cargarDashboard(): void {
    this.user = this.auth.getUser();
    this.tarjetas = this.getTarjetasPorRol(this.user?.role);
  }

  private getTarjetasPorRol(role?: Role): TarjetaDashboard[] {
    switch (role) {
      case 'PATIENT':
        return [
          { titulo: 'Mis citas', descripcion: 'Gestiona tus próximas citas y solicitudes.', icono: 'calendar-outline' },
          { titulo: 'Mis tratamientos', descripcion: 'Sigue tu progreso y planes asignados.', icono: 'fitness-outline' },
          { titulo: 'Recursos', descripcion: 'Material recomendado para tu recuperación.', icono: 'book-outline', ruta: '/patient/resources' },
          { titulo: 'Mi perfil', descripcion: 'Actualiza tus datos personales.', icono: 'person-outline' },
        ];

      case 'THERAPIST':
        return [
          { titulo: 'Agenda', descripcion: 'Revisa tu calendario y disponibilidad.', icono: 'time-outline' },
          { titulo: 'Pacientes', descripcion: 'Accede a pacientes asignados y notas.', icono: 'people-outline', ruta: '/therapist/assign-patient' },
          { titulo: 'Recursos', descripcion: 'Publica y gestiona recursos para pacientes.', icono: 'book-outline', ruta: '/therapist/resources'  },
          { titulo: 'Cursos', descripcion: 'Consulta cursos adquiridos y aprendizaje.', icono: 'school-outline', ruta: '/therapist/courses' },
        ];

      case 'CENTRE':
        return [
          { titulo: 'Mis cursos', descripcion: 'Crea y gestiona los cursos de tu centro.', icono: 'library-outline', ruta: '/centre/courses' },
          { titulo: 'Terapeutas', descripcion: 'Gestiona terapeutas y contratos.', icono: 'people-circle-outline', ruta: '/centre/therapists' },
          { titulo: 'Estadísticas', descripcion: 'Resumen de actividad y rendimiento.', icono: 'stats-chart-outline' },
          { titulo: 'Perfil del centro', descripcion: 'Actualiza datos del centro y contacto.', icono: 'business-outline' },
        ];

      case 'ADMIN':
        return [
          { titulo: 'Usuarios', descripcion: 'Gestiona usuarios y roles del sistema.', icono: 'people-outline' },
          { titulo: 'Centros', descripcion: 'Revisa y administra centros.', icono: 'business-outline' },
          { titulo: 'Moderación', descripcion: 'Audita actividad y gestiona reportes.', icono: 'shield-checkmark-outline' },
          { titulo: 'Estadísticas globales', descripcion: 'Visión general y métricas del sistema.', icono: 'analytics-outline' },
        ];

      default:
        return [
          { titulo: 'Mi perfil', descripcion: 'Actualiza tu información.', icono: 'person-outline' },
        ];
    }
  }
}