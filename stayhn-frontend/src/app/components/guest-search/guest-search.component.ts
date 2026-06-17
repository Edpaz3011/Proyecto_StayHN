import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Accommodation, AccommodationFilter } from '../../models/accommodation.model';
import { AccommodationService } from '../../services/accommodation.service';

@Component({
  selector: 'app-guest-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './guest-search.component.html',
  styleUrls: ['./guest-search.component.css']
})
export class GuestSearchComponent implements OnInit {
  accommodations: Accommodation[] = [];
  filteredAccommodations: Accommodation[] = [];
  isLoading = false;
  errorMessage = '';
  filters: AccommodationFilter = {
    location: '',
    type: '',
    minPrice: undefined,
    maxPrice: undefined,
    capacity: undefined
  };

  constructor(private accommodationService: AccommodationService) {}

  ngOnInit(): void {
    this.loadAccommodations();
  }

  loadAccommodations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.accommodationService.getAllAccommodations().subscribe({
      next: (accommodations) => {
        this.accommodations = accommodations.filter(a => a.isActive);
        this.filteredAccommodations = this.accommodations;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'No se pudieron cargar los alojamientos.';
        this.isLoading = false;
      }
    });
  }

  search(): void {
    this.filteredAccommodations = this.accommodations.filter(a => {
      const matchesLocation = this.filters.location
        ? a.location.toLowerCase().includes(this.filters.location.toLowerCase())
        : true;
      const matchesType = this.filters.type
        ? a.type.toLowerCase().includes(this.filters.type.toLowerCase())
        : true;
      const matchesMinPrice = this.filters.minPrice ? a.pricePerNight >= this.filters.minPrice : true;
      const matchesMaxPrice = this.filters.maxPrice ? a.pricePerNight <= this.filters.maxPrice : true;
      const matchesCapacity = this.filters.capacity ? a.capacity >= this.filters.capacity : true;

      return matchesLocation && matchesType && matchesMinPrice && matchesMaxPrice && matchesCapacity;
    });
  }

  clearFilters(): void {
    this.filters = {
      location: '',
      type: '',
      minPrice: undefined,
      maxPrice: undefined,
      capacity: undefined
    };
    this.filteredAccommodations = this.accommodations;
  }
}
