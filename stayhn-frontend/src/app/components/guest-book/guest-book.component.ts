import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Accommodation } from '../../models/accommodation.model';
import { Reservation, ReservationRequest } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { AccommodationService } from '../../services/accommodation.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { PaymentRecord } from '../../models/payment.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-guest-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-book.component.html',
  styleUrls: ['./guest-book.component.css']
})
export class GuestBookComponent implements OnInit {
  accommodation: Accommodation | null = null;
  existingReservations: Reservation[] = [];
  blockedRanges: { checkIn: string; checkOut: string }[] = [];
  minCheckInDate = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  availabilityMessage = '';
  lastReference = '';
  checkInDate = '';
  checkOutDate = '';
  cardHolder = '';
  cardNumber = '';
  expirationDate = '';
  cvv = '';
  selectedNights = 0;
  selectedSubtotal = 0;
  selectedTaxes = 0;
  selectedTotal = 0;
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accommodationService: AccommodationService,
    private reservationService: ReservationService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.minCheckInDate = new Date().toISOString().slice(0, 10);
    const accommodationId = this.route.snapshot.paramMap.get('id');
    if (accommodationId) {
      this.loadAccommodation(accommodationId);
    } else {
      this.errorMessage = 'Alojamiento no encontrado.';
    }
  }

  private loadAccommodation(id: string): void {
    this.isLoading = true;
    this.accommodationService.getAccommodation(id).subscribe({
      next: (accommodation) => {
        this.accommodation = accommodation;
        this.loadExistingReservations(id);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'No se pudo cargar el alojamiento.';
        this.isLoading = false;
      }
    });
  }

  private loadExistingReservations(accommodationId: string): void {
    this.reservationService.getReservationsByAccommodation(accommodationId).subscribe({
      next: (reservations) => {
        this.existingReservations = reservations.filter(r => r.status !== 'cancelled');
        this.blockedRanges = this.existingReservations.map(r => ({
          checkIn: new Date(r.checkInDate).toISOString().slice(0, 10),
          checkOut: new Date(r.checkOutDate).toISOString().slice(0, 10)
        }));
      },
      error: () => {
        this.existingReservations = [];
        this.blockedRanges = [];
      }
    });
  }

  book(): void {
    if (!this.user || !this.accommodation) {
      this.errorMessage = 'Debes iniciar sesión para reservar.';
      return;
    }

    if (!this.checkInDate || !this.checkOutDate) {
      this.errorMessage = 'Selecciona fecha de entrada y salida.';
      return;
    }

    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    if (checkIn >= checkOut) {
      this.errorMessage = 'La fecha de salida debe ser posterior a la fecha de entrada.';
      return;
    }

    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = this.accommodation.pricePerNight * nights;
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;
    const totalCost = Math.round((subtotal + taxes) * 100) / 100;

    if (!this.cardHolder || !this.cardNumber || !this.expirationDate || !this.cvv) {
      this.errorMessage = 'Completa los datos de pago.';
      return;
    }

    if (!this.isDateAvailable(checkIn, checkOut)) {
      this.errorMessage = 'El alojamiento no está disponible para las fechas seleccionadas.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const reservationRequest: ReservationRequest = {
      userId: this.user.id,
      userName: this.user.fullName,
      accommodationId: this.accommodation.id,
      accommodationName: this.accommodation.name,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights,
      subtotal,
      taxes,
      totalCost
    };

    this.reservationService.createReservation(reservationRequest).subscribe({
      next: (response) => {
        const reservationId = response?.reservation?.id;
        if (!reservationId) {
          this.errorMessage = 'No se pudo crear la reserva.';
          this.isLoading = false;
          return;
        }

        this.lastReference = response?.reservation?.referenceNumber || '';

        const payment: PaymentRecord = {
          reservationId,
          cardHolder: this.cardHolder,
          cardNumber: this.cardNumber,
          expirationDate: this.expirationDate,
          cvv: this.cvv,
          amount: totalCost
        };

        this.paymentService.processPayment(payment).subscribe({
          next: (paymentResponse) => {
            this.successMessage = paymentResponse?.message || 'Pago procesado correctamente.';
            this.lastReference = this.lastReference || '';
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/guest/reservations']), 1200);
          },
          error: (paymentError) => {
            this.errorMessage = paymentError.error?.message || 'Error al procesar el pago.';
            this.isLoading = false;
          }
        });
      },
      error: (reservationError) => {
        this.errorMessage = reservationError.error?.message || 'Error al crear la reserva.';
        this.isLoading = false;
      }
    });
  }

  onDatesChange(): void {
    this.calculateSummary();
    this.availabilityMessage = '';
    if (this.checkInDate && this.checkOutDate) {
      const checkIn = new Date(this.checkInDate);
      const checkOut = new Date(this.checkOutDate);
      if (!this.isDateAvailable(checkIn, checkOut)) {
        this.availabilityMessage = 'Las fechas seleccionadas no están disponibles.';
      }
    }
  }

  private calculateSummary(): void {
    if (!this.accommodation || !this.checkInDate || !this.checkOutDate) {
      this.selectedNights = 0;
      this.selectedSubtotal = 0;
      this.selectedTaxes = 0;
      this.selectedTotal = 0;
      return;
    }

    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    if (checkIn >= checkOut) {
      this.selectedNights = 0;
      this.selectedSubtotal = 0;
      this.selectedTaxes = 0;
      this.selectedTotal = 0;
      return;
    }

    this.selectedNights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    this.selectedSubtotal = Math.round(this.accommodation.pricePerNight * this.selectedNights * 100) / 100;
    this.selectedTaxes = Math.round(this.selectedSubtotal * 0.12 * 100) / 100;
    this.selectedTotal = Math.round((this.selectedSubtotal + this.selectedTaxes) * 100) / 100;
  }

  private isDateAvailable(checkIn: Date, checkOut: Date): boolean {
    return !this.existingReservations.some(r => {
      const reservedCheckIn = new Date(r.checkInDate);
      const reservedCheckOut = new Date(r.checkOutDate);
      return !(checkOut <= reservedCheckIn || checkIn >= reservedCheckOut);
    });
  }
}
