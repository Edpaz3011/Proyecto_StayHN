export interface Accommodation {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  description: string;
  amenities: string[];
  photoUrls: string[];
  pricePerNight: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  averageRating: number;
  totalReviews: number;
}

export interface AccommodationFilter {
  location?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
}
