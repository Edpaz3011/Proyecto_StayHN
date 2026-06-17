using Microsoft.AspNetCore.Mvc;
using ProyectoClaseG4.Models;
using ProyectoClaseG4.Services;

namespace ProyectoClaseG4.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccommodationController : ControllerBase
{
    private readonly AccommodationService _accommodationService;

    public AccommodationController(AccommodationService accommodationService)
    {
        _accommodationService = accommodationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAccommodation([FromBody] Accommodation accommodation)
    {
        if (string.IsNullOrWhiteSpace(accommodation.Name) || accommodation.PricePerNight <= 0)
            return BadRequest("Nombre y precio son requeridos.");

        var created = await _accommodationService.CreateAccommodationAsync(accommodation);
        return Ok(created);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAccommodation(string id)
    {
        var accommodation = await _accommodationService.GetAccommodationAsync(id);
        if (accommodation == null)
            return NotFound();

        return Ok(accommodation);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAccommodations()
    {
        var accommodations = await _accommodationService.GetAllAccommodationsAsync();
        return Ok(accommodations);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccommodation(string id, [FromBody] Accommodation accommodation)
    {
        accommodation.Id = id;
        await _accommodationService.UpdateAccommodationAsync(accommodation);
        return Ok(new { message = "Alojamiento actualizado exitosamente." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeactivateAccommodation(string id)
    {
        await _accommodationService.DeactivateAccommodationAsync(id);
        return Ok(new { message = "Alojamiento desactivado exitosamente." });
    }
}
