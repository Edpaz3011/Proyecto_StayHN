using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class ReportService
{
    private readonly FirebaseService _firebaseService;

    public ReportService(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    public async Task<ReservationStatistics> GetReservationStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var reservations = await _firebaseService.GetAllReservationsAsync();
        var accommodations = await _firebaseService.GetAllAccommodationsAsync();

        reservations = FilterReservationsByDate(reservations, startDate, endDate);

        var statistics = new ReservationStatistics
        {
            TotalAccommodations = accommodations.Count,
            TotalReservations = reservations.Count,
            ConfirmedReservations = reservations.Count(r => r.Status == "confirmed"),
            PendingReservations = reservations.Count(r => r.Status == "pending"),
            CancelledReservations = reservations.Count(r => r.Status == "cancelled"),
            TotalSimulatedIncome = reservations.Where(r => r.Status == "confirmed").Sum(r => r.TotalCost)
        };

        statistics.ReservationsByAccommodation = reservations
            .GroupBy(r => r.AccommodationName)
            .ToDictionary(g => g.Key, g => g.Count());

        statistics.ReservationsByType = accommodations
            .GroupBy(a => a.Type)
            .ToDictionary(g => g.Key, g => reservations.Count(r => g.Any(a => a.Name == r.AccommodationName && a.Type == g.Key)));

        statistics.OccupancyPercentageByAccommodation = accommodations
            .ToDictionary(
                a => a.Name,
                a => {
                    var totalNights = reservations
                        .Where(r => r.AccommodationName == a.Name && r.Status == "confirmed")
                        .Sum(r => r.Nights);
                    return totalNights > 0 ? Math.Min(100.0, totalNights / 365.0 * 100.0) : 0.0;
                }
            );

        statistics.WeeklyTrends = Enumerable.Range(0, 4)
            .Select(offset =>
            {
                var weekStart = DateTime.UtcNow.Date.AddDays(-7 * offset);
                var weekEnd = weekStart.AddDays(7);
                var weekReservations = reservations.Count(r => r.CreatedAt >= weekStart && r.CreatedAt < weekEnd);
                var income = reservations.Where(r => r.CreatedAt >= weekStart && r.CreatedAt < weekEnd).Sum(r => r.TotalCost);
                return new WeeklyTrend
                {
                    Week = $"Semana {4 - offset}",
                    ReservationCount = weekReservations,
                    Income = income
                };
            })
            .ToList();

        return statistics;
    }

    private List<Reservation> FilterReservationsByDate(List<Reservation> reservations, DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue)
        {
            reservations = reservations.Where(r => r.CreatedAt.Date >= startDate.Value.Date).ToList();
        }

        if (endDate.HasValue)
        {
            reservations = reservations.Where(r => r.CreatedAt.Date <= endDate.Value.Date).ToList();
        }

        return reservations;
    }

    public async Task<Dictionary<string, int>> GetReservationsByTypeAsync()
    {
        var reservations = await _firebaseService.GetAllReservationsAsync();
        var accommodations = await _firebaseService.GetAllAccommodationsAsync();

        return accommodations
            .GroupBy(a => a.Type)
            .ToDictionary(
                g => g.Key,
                g => reservations.Count(r => g.Any(a => a.Name == r.AccommodationName && a.Type == g.Key))
            );
    }

    public async Task<Dictionary<string, double>> GetOccupancyPercentageAsync()
    {
        var reservations = await _firebaseService.GetAllReservationsAsync();
        var accommodations = await _firebaseService.GetAllAccommodationsAsync();

        return accommodations.ToDictionary(
            a => a.Name,
            a => {
                var totalNights = reservations
                    .Where(r => r.AccommodationName == a.Name && r.Status == "confirmed")
                    .Sum(r => r.Nights);
                return totalNights > 0 ? Math.Min(100.0, totalNights / 365.0 * 100.0) : 0.0;
            }
        );
    }

    public async Task<List<WeeklyTrend>> GetWeeklyTrendsAsync()
    {
        var reservations = await _firebaseService.GetAllReservationsAsync();

        return Enumerable.Range(0, 4)
            .Select(offset =>
            {
                var weekStart = DateTime.UtcNow.Date.AddDays(-7 * offset);
                var weekEnd = weekStart.AddDays(7);
                var weekReservations = reservations.Count(r => r.CreatedAt >= weekStart && r.CreatedAt < weekEnd);
                var income = reservations.Where(r => r.CreatedAt >= weekStart && r.CreatedAt < weekEnd).Sum(r => r.TotalCost);
                return new WeeklyTrend
                {
                    Week = $"Semana {4 - offset}",
                    ReservationCount = weekReservations,
                    Income = income
                };
            })
            .ToList();
    }
}
