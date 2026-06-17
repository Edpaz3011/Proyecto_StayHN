import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Accommodation } from '../../models/accommodation.model';
import { AccommodationService } from '../../services/accommodation.service';

@Component({
  selector: 'app-admin-accommodations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-accommodations.component.html',
  styleUrls: ['./admin-accommodations.component.css']
})
export class AdminAccommodationsComponent implements OnInit {
  accommodations: Accommodation[] = [];
  isLoading = false;
  error = '';
  successMessage = '';
  formTitle = 'Nuevo alojamiento';
  isEditMode = false;

  accommodationForm: Partial<Accommodation> = {
    id: '',
    name: '',
    type: '',
    location: '',
    capacity: 1,
    description: '',
    amenities: [],
    photoUrls: [],
    pricePerNight: 0,
    isActive: true,
    createdBy: 'admin'
  };

  constructor(private accommodationService: AccommodationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = '';
    this.successMessage = '';

    this.accommodationService.getAllAccommodations().subscribe({
      next: (res) => { this.accommodations = res; this.isLoading = false; },
      error: (err) => { this.error = err?.message || 'Error cargando alojamientos'; this.isLoading = false; }
    });
  }

  edit(accommodation: Accommodation): void {
    this.isEditMode = true;
    this.formTitle = 'Editar alojamiento';
    this.error = '';
    this.successMessage = '';
    this.accommodationForm = {
      ...accommodation,
      amenities: accommodation.amenities ?? [],
      photoUrls: accommodation.photoUrls ?? []
    };
  }

  cancelEdit(): void {
    this.resetForm();
  }

  save(): void {
    this.error = '';
    this.successMessage = '';

    const payload: Accommodation = {
      id: this.accommodationForm.id || '',
      name: this.accommodationForm.name?.trim() ?? '',
      type: this.accommodationForm.type?.trim() ?? '',
      location: this.accommodationForm.location?.trim() ?? '',
      capacity: this.accommodationForm.capacity ?? 1,
      description: this.accommodationForm.description?.trim() ?? '',
      amenities: this.parseCommaList(this.accommodationForm.amenities),
      photoUrls: this.parseCommaList(this.accommodationForm.photoUrls),
      pricePerNight: this.accommodationForm.pricePerNight ?? 0,
      isActive: this.accommodationForm.isActive ?? true,
      createdBy: this.accommodationForm.createdBy ?? 'admin',
      createdAt: this.accommodationForm.createdAt ?? new Date(),
      averageRating: this.accommodationForm.averageRating ?? 0,
      totalReviews: this.accommodationForm.totalReviews ?? 0
    };

    if (!payload.name || !payload.location || payload.pricePerNight <= 0) {
      this.error = 'Nombre, ubicación y precio por noche son obligatorios.';
      return;
    }

    if (this.isEditMode) {
      this.accommodationService.updateAccommodation(payload.id, payload).subscribe({
        next: () => {
          this.successMessage = 'Alojamiento actualizado correctamente.';
          this.resetForm();
          this.load();
        },
        error: (err) => { this.error = err?.message || 'Error al actualizar el alojamiento'; }
      });
    } else {
      this.accommodationService.createAccommodation(payload).subscribe({
        next: () => {
          this.successMessage = 'Alojamiento creado correctamente.';
          this.resetForm();
          this.load();
        },
        error: (err) => { this.error = err?.message || 'Error al crear el alojamiento'; }
      });
    }
  }

  delete(id: string): void {
    if (!confirm('¿Seguro que deseas desactivar este alojamiento?')) {
      return;
    }

    this.accommodationService.deleteAccommodation(id).subscribe({
      next: () => {
        this.successMessage = 'Alojamiento desactivado correctamente.';
        this.load();
      },
      error: (err) => { this.error = err?.message || 'Error al desactivar el alojamiento'; }
    });
  }

  private parseCommaList(value: string[] | string | undefined): string[] {
    if (Array.isArray(value)) {
      return value.filter((item) => item && item.toString().trim()).map((item) => item.toString().trim());
    }
    if (!value) {
      return [];
    }
    return value.toString().split(',').map((item) => item.trim()).filter(Boolean);
  }

  private resetForm(): void {
    this.isEditMode = false;
    this.formTitle = 'Nuevo alojamiento';
    this.error = '';
    this.successMessage = '';
    this.accommodationForm = {
      id: '',
      name: '',
      type: '',
      location: '',
      capacity: 1,
      description: '',
      amenities: [],
      photoUrls: [],
      pricePerNight: 0,
      isActive: true,
      createdBy: 'admin'
    };
  }
}
