import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reservations.component.html',
  styleUrls: ['./admin-reservations.component.css']
})
export class AdminReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  isLoading = false;
  errorMessage = '';
  statusFilter: 'all' | 'pending' | 'confirmed' | 'cancelled' = 'all';

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reservationService.getAllReservations().subscribe({
      next: (res) => {
        this.reservations = res;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'No se pudieron cargar las reservaciones.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredReservations = this.statusFilter === 'all'
      ? this.reservations
      : this.reservations.filter(r => r.status === this.statusFilter);
  }

  confirm(reservationId: string): void {
    this.reservationService.confirmReservation(reservationId).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'No se pudo confirmar la reservación.')
    });
  }

  cancel(reservationId: string): void {
    this.reservationService.cancelReservation(reservationId).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message || 'No se pudo cancelar la reservación.')
    });
  }
}
