import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './guest-dashboard.component.html',
  styleUrls: ['./guest-dashboard.component.css']
})
export class GuestDashboardComponent implements OnInit, OnDestroy {

  private logoutTimer: any;

  recentReservations = [
    { id: '1', accommodation: 'Casa en la playa', date: 'Ago 15-20', status: 'Confirmada' },
    { id: '2', accommodation: 'Apartamento moderno', date: 'Jul 1-5', status: 'Completada' }
  ];

  menuItems = [
    { label: 'Buscar Alojamientos', icon: '🔍', link: '/guest/search' },
    { label: 'Mis Reservaciones', icon: '📅', link: '/guest/reservations' },
    { label: 'Mis Reseñas', icon: '⭐', link: '/guest/reviews' },
    { label: 'Mi Perfil', icon: '👤', link: '/guest/profile' }
  ];

  constructor(
      private authService: AuthService,
      private router: Router
  ) {}
//Para que cierre sesion despues de 2 min de inactivad
  ngOnInit(): void {
    // 1. Verificar sesión
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // 2. Iniciar monitor de inactividad
    this.resetInactivityTimer();

    // 3. Vincular eventos de actividad
    window.addEventListener('mousemove', this.boundActivityHandler);
    window.addEventListener('keypress', this.boundActivityHandler);
  }

  ngOnDestroy(): void {
    // 4. Limpiar temporizador y eventos al destruir el componente
    clearTimeout(this.logoutTimer);
    window.removeEventListener('mousemove', this.boundActivityHandler);
    window.removeEventListener('keypress', this.boundActivityHandler);
  }

  // Función para resetear el timer si movemos el mouse
  private boundActivityHandler = () => this.resetInactivityTimer();

  private resetInactivityTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    // 120,000 ms = 2 minutos
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, 120000);
  }

  logout(): void {
    this.authService.logout();
  }
}