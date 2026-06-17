using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class AccommodationService
{
    private readonly FirebaseService _firebaseService;

    public AccommodationService(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    public async Task<Accommodation> CreateAccommodationAsync(Accommodation accommodation)
    {
        accommodation.Id = Guid.NewGuid().ToString();
        accommodation.CreatedAt = DateTime.UtcNow;
        await _firebaseService.AddAccommodationAsync(accommodation);
        return accommodation;
    }

    public async Task<Accommodation?> GetAccommodationAsync(string id)
    {
        return await _firebaseService.GetAccommodationByIdAsync(id);
    }

    public async Task<List<Accommodation>> GetAllAccommodationsAsync()
    {
        return await _firebaseService.GetAllAccommodationsAsync();
    }

    public async Task UpdateAccommodationAsync(Accommodation accommodation)
    {
        accommodation.CreatedAt = DateTime.UtcNow;
        await _firebaseService.UpdateAccommodationAsync(accommodation);
    }

    public async Task DeactivateAccommodationAsync(string accommodationId)
    {
        var accommodation = await _firebaseService.GetAccommodationByIdAsync(accommodationId);
        if (accommodation != null)
        {
            accommodation.IsActive = false;
            await _firebaseService.UpdateAccommodationAsync(accommodation);
        }
    }

    public async Task UpdateAccommodationRatingAsync(string accommodationId)
    {
        var accommodation = await _firebaseService.GetAccommodationByIdAsync(accommodationId);
        if (accommodation != null)
        {
            var reviews = await _firebaseService.GetReviewsByAccommodationAsync(accommodationId);
            if (reviews.Count > 0)
            {
                accommodation.AverageRating = reviews.Average(r => r.Rating);
                accommodation.TotalReviews = reviews.Count;
                await _firebaseService.UpdateAccommodationAsync(accommodation);
            }
        }
    }
}
