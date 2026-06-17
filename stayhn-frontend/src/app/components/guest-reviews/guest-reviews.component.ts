import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewRequest, Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-guest-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-reviews.component.html',
  styleUrls: ['./guest-reviews.component.css']
})
export class GuestReviewsComponent implements OnInit {
  accommodationsForReview: { id: string; name: string }[] = [];
  myReviews: Review[] = [];
  model: Partial<ReviewRequest> = { rating: 5, comment: '' };
  isSubmitting = false;
  message = '';

  constructor(
    private reservationService: ReservationService,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;
    this.reservationService.getReservationsByUser(user.id).subscribe(res => {
      const unique = new Map<string, string>();
      // Include any non-cancelled reservation for review eligibility.
      res.filter(r => r.status !== 'cancelled')
         .forEach(r => unique.set(r.accommodationId, r.accommodationName));
      this.accommodationsForReview = Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
      this.loadMyReviews(user.id);
    });
  }

  private loadMyReviews(userId: string): void {
    this.reviewService.getReviewsByUser(userId).subscribe({
      next: (reviews) => {
        this.myReviews = reviews;
      },
      error: () => {
        this.myReviews = [];
      }
    });
  }

  submit(): void {
    const user = this.authService.currentUserValue;
    if (!user || !this.model.accommodationId || !this.model.rating) {
      this.message = 'Completa el formulario antes de enviar.';
      return;
    }
    this.isSubmitting = true;
    const reviewReq: ReviewRequest = {
      userId: user.id,
      userName: (user as any).fullName || user.email,
      accommodationId: this.model.accommodationId!,
      rating: this.model.rating!,
      comment: this.model.comment || ''
    };
    this.reviewService.createReview(reviewReq).subscribe({
      next: (response) => {
        this.message = 'Reseña enviada. Gracias.';
        this.isSubmitting = false;
        this.model = { rating: 5, comment: '' };
        if (response?.review) {
          this.myReviews = [...this.myReviews, response.review];
        }
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al enviar reseña.';
        this.isSubmitting = false;
      }
    });
  }
}
