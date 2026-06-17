import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-guest-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './guest-reservations.component.html',
  styleUrls: ['./guest-reservations.component.css']
})
export class GuestReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      this.errorMessage = 'Necesitas iniciar sesión para ver tus reservaciones.';
      return;
    }

    this.isLoading = true;
    this.reservationService.getReservationsByUser(user.id).subscribe({
      next: (res) => {
        this.reservations = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al cargar reservaciones.';
        this.isLoading = false;
      }
    });
  }

  cancel(reservationId: string): void {
    if (!confirm('¿Cancelar esta reservación?')) return;
    this.reservationService.cancelReservation(reservationId).subscribe({
      next: () => this.loadReservations(),
      error: (err) => alert(err.error?.message || 'No se pudo cancelar la reservación.')
    });
  }
}
