import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Accommodation } from '../../models/accommodation.model';
import { AccommodationService } from '../../services/accommodation.service';

@Component({
  selector: 'app-accommodation-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="accommodation-list">
      <h2>Alojamientos</h2>
      <div *ngIf="loading">Cargando alojamientos...</div>
      <div *ngIf="!loading && accommodations.length === 0">No hay alojamientos disponibles.</div>
      <div class="cards" *ngIf="!loading">
        <div class="card" *ngFor="let a of accommodations">
          <img [src]="a.photoUrls?.[0] || '/assets/placeholder.png'" alt="{{a.name}}"/>
          <div class="info">
            <h3><a [routerLink]="['/accommodation', a.id]">{{a.name}}</a></h3>
            <p>{{a.location}} • {{a.type}}</p>
            <p>Capacidad: {{a.capacity}} • Precio: {{ a.pricePerNight | currency:'USD' }} / noche</p>
            <button (click)="view(a.id)">Ver detalles</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cards { display:flex; flex-wrap:wrap; gap:12px }
    .card { width:260px; border:1px solid #ddd; border-radius:6px; overflow:hidden }
    .card img{ width:100%; height:140px; object-fit:cover }
    .info{ padding:8px }
    h3{ margin:0 0 6px }
  `]
})
export class AccommodationListComponent implements OnInit {
  accommodations: Accommodation[] = [];
  loading = false;

  constructor(private service: AccommodationService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getAllAccommodations().subscribe({ next: (r) => { this.accommodations = r; this.loading = false; }, error: () => this.loading = false });
  }

  view(id: string) {
    this.router.navigate(['/accommodation', id]);
  }
}
