using Microsoft.AspNetCore.Mvc;
using ProyectoClaseG4.Models;
using ProyectoClaseG4.Services;

namespace ProyectoClaseG4.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly ReservationService _reservationService;

    public ReservationController(ReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] Reservation reservation)
    {
        if (string.IsNullOrWhiteSpace(reservation.UserId) || string.IsNullOrWhiteSpace(reservation.AccommodationId))
            return BadRequest("UserId y AccommodationId son requeridos.");

        var (success, message, created) = await _reservationService.CreateReservationAsync(reservation);
        
        if (!success)
            return BadRequest(new { message });

        return Ok(new { message, reservation = created });
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetReservationsByUser(string userId)
    {
        var reservations = await _reservationService.GetReservationsByUserAsync(userId);
        return Ok(reservations);
    }

    [HttpGet("accommodation/{accommodationId}")]
    public async Task<IActionResult> GetReservationsByAccommodation(string accommodationId)
    {
        var reservations = await _reservationService.GetReservationsByAccommodationAsync(accommodationId);
        return Ok(reservations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetReservation(string id)
    {
        var reservation = await _reservationService.GetReservationAsync(id);
        if (reservation == null)
            return NotFound();

        return Ok(reservation);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllReservations()
    {
        var reservations = await _reservationService.GetAllReservationsAsync();
        return Ok(reservations);
    }

    [HttpPut("{id}/confirm")]
    public async Task<IActionResult> ConfirmReservation(string id)
    {
        await _reservationService.ConfirmReservationAsync(id);
        return Ok(new { message = "Reserva confirmada exitosamente." });
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelReservation(string id)
    {
        await _reservationService.CancelReservationAsync(id);
        return Ok(new { message = "Reserva cancelada exitosamente." });
    }
}
