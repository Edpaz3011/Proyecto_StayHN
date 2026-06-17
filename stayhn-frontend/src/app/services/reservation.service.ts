import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:5042/api/reservation';

  constructor(private http: HttpClient) { }

  createReservation(reservation: ReservationRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, reservation);
  }

  getReservationsByUser(userId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationsByAccommodation(accommodationId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/accommodation/${accommodationId}`);
  }

  confirmReservation(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancelReservation(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
  }
}
