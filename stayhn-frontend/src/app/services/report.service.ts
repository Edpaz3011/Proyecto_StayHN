import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:5042/api/report';

  constructor(private http: HttpClient) { }

  getStatistics(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.apiUrl}/statistics`;
    const params: string[] = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  getReservationsByType(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-type`);
  }

  getOccupancyPercentage(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/occupancy`);
  }

  getWeeklyTrends(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/weekly-trends`);
  }
}
