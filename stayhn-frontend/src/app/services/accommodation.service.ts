import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Accommodation, AccommodationFilter } from '../models/accommodation.model';

@Injectable({
  providedIn: 'root'
})
export class AccommodationService {
  private apiUrl = 'http://localhost:5042/api/accommodation';

  constructor(private http: HttpClient) { }

  createAccommodation(accommodation: Accommodation): Observable<Accommodation> {
    return this.http.post<Accommodation>(this.apiUrl, accommodation);
  }

  getAccommodation(id: string): Observable<Accommodation> {
    return this.http.get<Accommodation>(`${this.apiUrl}/${id}`);
  }

  getAllAccommodations(): Observable<Accommodation[]> {
    return this.http.get<Accommodation[]>(this.apiUrl);
  }

  updateAccommodation(id: string, accommodation: Accommodation): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, accommodation);
  }

  deleteAccommodation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  filterAccommodations(filters: AccommodationFilter): Observable<Accommodation[]> {
    let url = this.apiUrl + '?';
    if (filters.location) url += `location=${filters.location}&`;
    if (filters.type) url += `type=${filters.type}&`;
    if (filters.minPrice) url += `minPrice=${filters.minPrice}&`;
    if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`;
    if (filters.capacity) url += `capacity=${filters.capacity}&`;
    return this.http.get<Accommodation[]>(url);
  }
}
