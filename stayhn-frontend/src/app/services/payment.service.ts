import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRecord } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5042/api/payment';

  constructor(private http: HttpClient) { }

  processPayment(payment: PaymentRecord): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/process`, payment);
  }
}
