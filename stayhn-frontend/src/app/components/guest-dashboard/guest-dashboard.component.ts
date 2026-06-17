import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './guest-dashboard.component.html',
  styleUrls: ['./guest-dashboard.component.css']
})
export class GuestDashboardComponent {
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
}
