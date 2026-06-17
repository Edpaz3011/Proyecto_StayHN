using Microsoft.AspNetCore.Mvc;
using ProyectoClaseG4.Models;
using ProyectoClaseG4.Services;

namespace ProyectoClaseG4.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] Review review)
    {
        if (string.IsNullOrWhiteSpace(review.UserId) || string.IsNullOrWhiteSpace(review.AccommodationId))
            return BadRequest("UserId y AccommodationId son requeridos.");

        if (review.Rating < 1 || review.Rating > 5)
            return BadRequest("La calificación debe estar entre 1 y 5.");

        var (success, message, created) = await _reviewService.CreateReviewAsync(review);
        
        if (!success)
            return BadRequest(new { message });

        return Ok(new { message, review = created });
    }

    [HttpGet("accommodation/{accommodationId}")]
    public async Task<IActionResult> GetReviewsByAccommodation(string accommodationId)
    {
        var reviews = await _reviewService.GetReviewsByAccommodationAsync(accommodationId);
        return Ok(reviews);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetReviewsByUser(string userId)
    {
        var reviews = await _reviewService.GetReviewsByUserAsync(userId);
        return Ok(reviews);
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveReview(string id)
    {
        await _reviewService.ApproveReviewAsync(id);
        return Ok(new { message = "Reseña aprobada exitosamente." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        await _reviewService.DeleteReviewAsync(id);
        return Ok(new { message = "Reseña eliminada exitosamente." });
    }
}
