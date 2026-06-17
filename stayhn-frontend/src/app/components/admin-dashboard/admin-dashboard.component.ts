import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = [
    { label: 'Total Alojamientos', value: '...', color: '#667eea' },
    { label: 'Reservas', value: '...', color: '#764ba2' },
    { label: 'Ingresos Simulados', value: '...', color: '#4caf50' },
    { label: 'Ocupación', value: '...', color: '#ff9800' }
  ];

  menuItems = [
    { label: 'Alojamientos', icon: '🏠', link: '/admin/accommodations' },
    { label: 'Reservaciones', icon: '📅', link: '/admin/reservations' },
    { label: 'Preguntas', icon: '❓', link: '/admin/questions' },
    { label: 'Huéspedes', icon: '👥', link: '/admin/guests' },
    { label: 'Reportes', icon: '📊', link: '/admin/reports' }
  ];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getStatistics().subscribe({
      next: (statistics: any) => {
        const occupancyData = statistics?.occupancyPercentageByAccommodation as Record<string, number> | undefined;
        const occupancyValues = occupancyData ? (Object.values(occupancyData) as number[]) : [];
        const occupancyAverage = occupancyValues.length
          ? Math.round(occupancyValues.reduce((sum, value) => sum + value, 0) / occupancyValues.length)
          : 0;

        this.stats = [
          { label: 'Total Alojamientos', value: statistics?.totalAccommodations ?? 0, color: '#667eea' },
          { label: 'Reservas', value: statistics?.totalReservations ?? 0, color: '#764ba2' },
          { label: 'Ingresos Simulados', value: statistics?.totalSimulatedIncome ? `$${statistics.totalSimulatedIncome}` : '$0', color: '#4caf50' },
          { label: 'Ocupación', value: `${occupancyAverage}%`, color: '#ff9800' }
        ];
      },
      error: () => {
        // keep defaults if report data cannot be loaded
      }
    });
  }
}
