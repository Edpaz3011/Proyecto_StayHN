using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class ReviewService
{
    private readonly FirebaseService _firebaseService;

    public ReviewService(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    public async Task<(bool success, string message, Review? review)> CreateReviewAsync(Review review)
    {
        // Verificar que el usuario haya tenido una reserva en este alojamiento.
        // Permitimos reseñas aunque el pago no se haya validado (simulación),
        // siempre y cuando exista una reserva válida y no cancelada.
        var userReservations = await _firebaseService.GetReservationsByUserAsync(review.UserId);
        var hasReservation = userReservations.Any(r =>
            r.AccommodationId == review.AccommodationId &&
            r.Status != "cancelled"
        );

        if (!hasReservation)
            return (false, "Solo puedes dejar una reseña si tienes una reserva en este alojamiento.", null);

        // Verificar que no tenga una reseña previa
        var existingReview = await _firebaseService.GetReviewByUserAndAccommodationAsync(review.UserId, review.AccommodationId);
        if (existingReview != null)
            return (false, "Ya tienes una reseña en este alojamiento.", null);

        review.Id = Guid.NewGuid().ToString();
        review.CreatedAt = DateTime.UtcNow;
        await _firebaseService.AddReviewAsync(review);
        return (true, "Reseña creada exitosamente.", review);
    }

    public async Task<List<Review>> GetReviewsByAccommodationAsync(string accommodationId)
    {
        return await _firebaseService.GetReviewsByAccommodationAsync(accommodationId);
    }

    public async Task<List<Review>> GetReviewsByUserAsync(string userId)
    {
        return await _firebaseService.GetReviewsByUserAsync(userId);
    }

    public async Task ApproveReviewAsync(string reviewId)
    {
        var review = await _firebaseService.GetReviewByIdAsync(reviewId);
        if (review == null)
            return;

        review.IsApproved = true;
        await _firebaseService.UpdateReviewAsync(review);
    }

    public async Task DeleteReviewAsync(string reviewId)
    {
        await _firebaseService.DeleteReviewAsync(reviewId);
    }
}
