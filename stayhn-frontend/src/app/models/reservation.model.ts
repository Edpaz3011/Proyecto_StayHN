export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  accommodationId: string;
  accommodationName: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  subtotal: number;
  taxes: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  referenceNumber: string;
}

export interface ReservationRequest {
  userId: string;
  userName: string;
  accommodationId: string;
  accommodationName: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  subtotal: number;
  taxes: number;
  totalCost: number;
}
