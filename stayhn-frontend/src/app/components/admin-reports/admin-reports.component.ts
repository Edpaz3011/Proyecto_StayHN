import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-reports">
      <h2>Reportes</h2>
      <div class="report-filters">
        <label>
          Fecha de inicio
          <input type="date" [(ngModel)]="startDate" />
        </label>
        <label>
          Fecha de fin
          <input type="date" [(ngModel)]="endDate" />
        </label>
        <button class="btn-primary" (click)="applyDateFilter()">Aplicar filtros</button>
      </div>
      <div *ngIf="isLoading">Cargando reportes...</div>
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

      <div *ngIf="statistics && !isLoading">
        <div class="report-grid">
          <div class="report-card">
            <h3>Total Alojamientos</h3>
            <p>{{ statistics.totalAccommodations }}</p>
          </div>
          <div class="report-card">
            <h3>Total Reservaciones</h3>
            <p>{{ statistics.totalReservations }}</p>
          </div>
          <div class="report-card">
            <h3>Reservas Confirmadas</h3>
            <p>{{ statistics.confirmedReservations }}</p>
          </div>
          <div class="report-card">
            <h3>Ingresos Simulados</h3>
            <p>{{ statistics.totalSimulatedIncome | currency:'USD' }}</p>
          </div>
        </div>

        <section class="report-section">
          <h3>Reservas por Tipo</h3>
          <div class="report-list">
            <div *ngFor="let type of reservationTypes" class="report-item">
              <span>{{ type.key }}</span>
              <strong>{{ type.value }}</strong>
            </div>
          </div>
        </section>

        <section class="report-section">
          <h3>Ocupación por Alojamiento</h3>
          <div class="report-list">
            <div *ngFor="let occupancy of occupancyRates" class="report-item">
              <span>{{ occupancy.key }}</span>
              <strong>{{ occupancy.value | number:'1.0-2' }}%</strong>
            </div>
          </div>
        </section>

        <section class="report-section">
          <h3>Tendencias Semanales</h3>
          <div class="trend-table">
            <div class="trend-header">
              <span>Semana</span>
              <span>Reservas</span>
              <span>Ingresos</span>
            </div>
            <div *ngFor="let trend of weeklyTrends" class="trend-row">
              <span>{{ trend.week }}</span>
              <span>{{ trend.reservationCount }}</span>
              <span>{{ trend.income | currency:'USD' }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AdminReportsComponent implements OnInit {
  statistics: any = null;
  reservationTypes: Array<{ key: string; value: number }> = [];
  occupancyRates: Array<{ key: string; value: number }> = [];
  weeklyTrends: Array<{ week: string; reservationCount: number; income: number }> = [];
  isLoading = false;
  errorMessage = '';
  startDate = '';
  endDate = '';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportService.getStatistics(this.startDate, this.endDate).subscribe({
      next: (statistics: any) => {
        this.statistics = statistics;
        const reservationTypeEntries = Object.entries(statistics?.reservationsByType || {}) as [string, number][];
        const occupancyEntries = Object.entries(statistics?.occupancyPercentageByAccommodation || {}) as [string, number][];

        this.reservationTypes = reservationTypeEntries.map(([key, value]) => ({ key, value }));
        this.occupancyRates = occupancyEntries.map(([key, value]) => ({ key, value }));
        this.weeklyTrends = statistics?.weeklyTrends ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'No se pudieron cargar los reportes.';
        this.isLoading = false;
      }
    });
  }

  applyDateFilter(): void {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.errorMessage = 'La fecha de inicio debe ser anterior o igual a la fecha de fin.';
      return;
    }
    this.errorMessage = '';
    this.loadReports();
  }
}
