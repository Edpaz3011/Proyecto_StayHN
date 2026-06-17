export interface Review {
  id: string;
  userId: string;
  userName: string;
  accommodationId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isApproved: boolean;
}

export interface ReviewRequest {
  userId: string;
  userName: string;
  accommodationId: string;
  rating: number;
  comment: string;
}
