using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class ReservationService
{
    private readonly FirebaseService _firebaseService;

    public ReservationService(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    public async Task<(bool success, string message, Reservation? reservation)> CreateReservationAsync(Reservation reservation)
    {
        // Verificar disponibilidad
        var existingReservations = await _firebaseService.GetReservationsByAccommodationAsync(reservation.AccommodationId);
        var isAvailable = IsDateAvailable(existingReservations, reservation.CheckInDate, reservation.CheckOutDate);

        if (!isAvailable)
            return (false, "El alojamiento no está disponible en estas fechas.", null);

        reservation.Id = Guid.NewGuid().ToString();
        reservation.ReferenceNumber = GenerateReferenceNumber();
        reservation.CreatedAt = DateTime.UtcNow;
        reservation.Status = "pending";

        await _firebaseService.AddReservationAsync(reservation);
        return (true, "Reserva creada exitosamente.", reservation);
    }

    public async Task<Reservation?> GetReservationAsync(string reservationId)
    {
        return await _firebaseService.GetReservationByIdAsync(reservationId);
    }

    public async Task<List<Reservation>> GetAllReservationsAsync()
    {
        return await _firebaseService.GetAllReservationsAsync();
    }

    public async Task<List<Reservation>> GetReservationsByUserAsync(string userId)
    {
        return await _firebaseService.GetReservationsByUserAsync(userId);
    }

    public async Task<List<Reservation>> GetReservationsByAccommodationAsync(string accommodationId)
    {
        return await _firebaseService.GetReservationsByAccommodationAsync(accommodationId);
    }

    public async Task ConfirmReservationAsync(string reservationId)
    {
        var reservation = await GetReservationAsync(reservationId);
        if (reservation != null)
        {
            reservation.Status = "confirmed";
            await _firebaseService.UpdateReservationAsync(reservation);
        }
    }

    public async Task CancelReservationAsync(string reservationId)
    {
        var reservation = await GetReservationAsync(reservationId);
        if (reservation != null)
        {
            reservation.Status = "cancelled";
            await _firebaseService.UpdateReservationAsync(reservation);
        }
    }

    public bool IsDateAvailable(List<Reservation> reservations, DateTime checkIn, DateTime checkOut)
    {
        return !reservations.Any(r => 
            r.Status != "cancelled" &&
            !(checkOut <= r.CheckInDate || checkIn >= r.CheckOutDate)
        );
    }

    public string GenerateReferenceNumber()
    {
        return $"RES-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
    }

    public int CalculateNights(DateTime checkIn, DateTime checkOut)
    {
        return (int)(checkOut - checkIn).TotalDays;
    }

    public double CalculateTotalCost(double pricePerNight, int nights, double taxRate = 0.15)
    {
        var subtotal = pricePerNight * nights;
        var taxes = subtotal * taxRate;
        return subtotal + taxes;
    }
}
