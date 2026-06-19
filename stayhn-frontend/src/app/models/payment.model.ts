export interface PaymentRecord {
  reservationId: string;
  cardHolder: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  amount: number;
  status?: string;
  paymentDate?: Date;
}




