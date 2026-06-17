import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:5042/api/review';

  constructor(private http: HttpClient) { }

  createReview(review: ReviewRequest): Observable<{ message: string; review: Review }> {
    return this.http.post<{ message: string; review: Review }>(this.apiUrl, review);
  }

  getReviewsByAccommodation(accommodationId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/accommodation/${accommodationId}`);
  }

  getReviewsByUser(userId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/${userId}`);
  }
}
