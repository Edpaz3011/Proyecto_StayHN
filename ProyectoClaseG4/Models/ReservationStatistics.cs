namespace ProyectoClaseG4.Models;

public class ReservationStatistics
{
    public int TotalAccommodations { get; set; }
    public int TotalReservations { get; set; }
    public int ConfirmedReservations { get; set; }
    public int PendingReservations { get; set; }
    public int CancelledReservations { get; set; }
    public double TotalSimulatedIncome { get; set; }
    public Dictionary<string, int> ReservationsByAccommodation { get; set; } = new();
    public Dictionary<string, double> OccupancyPercentageByAccommodation { get; set; } = new();
    public Dictionary<string, int> ReservationsByType { get; set; } = new();
    public List<WeeklyTrend> WeeklyTrends { get; set; } = new();
}

public class WeeklyTrend
{
    public string Week { get; set; } = string.Empty;
    public int ReservationCount { get; set; }
    public double Income { get; set; }
}
