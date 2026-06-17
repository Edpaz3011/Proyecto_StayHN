import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  features = [
    { icon: '🏠', title: 'Alojamientos', description: 'Encuentra el alojamiento perfecto para tu estadía' },
    { icon: '📅', title: 'Reservas Fáciles', description: 'Reserva de forma sencilla y rápida' },
    { icon: '⭐', title: 'Reseñas', description: 'Lee opiniones de otros huéspedes' },
    { icon: '💳', title: 'Pago Seguro', description: 'Pago simulado seguro y confiable' }
  ];
}
