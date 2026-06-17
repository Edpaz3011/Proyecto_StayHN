using System.IO;
using System.Net;
using System.Net.Sockets;
using Google.Cloud.Firestore;
using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class FirebaseService
{
    private readonly FirestoreDb _firestoreDb;

    public FirebaseService(string projectId, string? credentialPath = null)
    {
        if (!string.IsNullOrWhiteSpace(credentialPath))
        {
            credentialPath = credentialPath.Replace("\\", "/");
        }
        
        Console.WriteLine($"FirebaseService initializing. projectId={projectId}, credentialPath={credentialPath}");
        Console.WriteLine($"Environment GOOGLE_APPLICATION_CREDENTIALS={Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")}");

        if (string.IsNullOrWhiteSpace(projectId))
        {
            throw new ArgumentException("Firebase project ID is required.", nameof(projectId));
        }

        var firestoreBuilder = new FirestoreDbBuilder
        {
            ProjectId = projectId
        };

        if (!string.IsNullOrWhiteSpace(credentialPath))
        {
            if (!File.Exists(credentialPath))
            {
                throw new FileNotFoundException($"Firebase credential file not found at '{credentialPath}'.", credentialPath);
            }

            firestoreBuilder.CredentialsPath = credentialPath;
        }

        try
        {
            var addresses = Dns.GetHostAddresses("firestore.googleapis.com");
            Console.WriteLine($"Resolved firestore.googleapis.com: {string.Join(",", addresses)}");
            using var tcp = new TcpClient();
            tcp.Connect("firestore.googleapis.com", 443);
            Console.WriteLine("TCP connection to firestore.googleapis.com:443 succeeded.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Firestore network test failed: {ex.Message}");
        }

        _firestoreDb = firestoreBuilder.Build();
    }

    // Users
    public async Task AddUserAsync(User user)
    {
        await _firestoreDb.Collection("Users").Document(user.Id).SetAsync(user);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        email = email?.Trim().ToLowerInvariant() ?? string.Empty;
        var query = await _firestoreDb.Collection("Users")
            .WhereEqualTo("Email", email)
            .GetSnapshotAsync();
        
        return query.Documents.FirstOrDefault()?.ConvertTo<User>();
    }

    public async Task<User?> GetUserByIdAsync(string userId)
    {
        var doc = await _firestoreDb.Collection("Users").Document(userId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<User>() : null;
    }

    public async Task UpdateUserAsync(User user)
    {
        await _firestoreDb.Collection("Users").Document(user.Id).SetAsync(user, SetOptions.MergeAll);
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        var query = await _firestoreDb.Collection("Users").GetSnapshotAsync();
        return query.Documents.Select(d => d.ConvertTo<User>()).ToList();
    }

    // Accommodations
    public async Task AddAccommodationAsync(Accommodation accommodation)
    {
        await _firestoreDb.Collection("Accommodations").Document(accommodation.Id).SetAsync(accommodation);
    }

    public async Task<List<Accommodation>> GetAllAccommodationsAsync()
    {
        var query = await _firestoreDb.Collection("Accommodations")
            .WhereEqualTo("IsActive", true)
            .GetSnapshotAsync();
        
        return query.Documents.Select(d => d.ConvertTo<Accommodation>()).ToList();
    }

    public async Task<Accommodation?> GetAccommodationByIdAsync(string accommodationId)
    {
        var doc = await _firestoreDb.Collection("Accommodations").Document(accommodationId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<Accommodation>() : null;
    }

    public async Task UpdateAccommodationAsync(Accommodation accommodation)
    {
        await _firestoreDb.Collection("Accommodations").Document(accommodation.Id).SetAsync(accommodation, SetOptions.MergeAll);
    }

    // Reservations
    public async Task AddReservationAsync(Reservation reservation)
    {
        await _firestoreDb.Collection("Reservations").Document(reservation.Id).SetAsync(reservation);
    }

    public async Task<List<Reservation>> GetReservationsByAccommodationAsync(string accommodationId)
    {
        var query = await _firestoreDb.Collection("Reservations")
            .WhereEqualTo("AccommodationId", accommodationId)
            .GetSnapshotAsync();
        
        return query.Documents.Select(d => d.ConvertTo<Reservation>()).ToList();
    }

    public async Task<List<Reservation>> GetReservationsByUserAsync(string userId)
    {
        var query = await _firestoreDb.Collection("Reservations")
            .WhereEqualTo("UserId", userId)
            .GetSnapshotAsync();
        
        return query.Documents.Select(d => d.ConvertTo<Reservation>()).ToList();
    }

    public async Task<Reservation?> GetReservationByIdAsync(string reservationId)
    {
        var doc = await _firestoreDb.Collection("Reservations").Document(reservationId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<Reservation>() : null;
    }

    public async Task<List<Reservation>> GetAllReservationsAsync()
    {
        var query = await _firestoreDb.Collection("Reservations").GetSnapshotAsync();
        return query.Documents.Select(d => d.ConvertTo<Reservation>()).ToList();
    }

    public async Task UpdateReservationAsync(Reservation reservation)
    {
        await _firestoreDb.Collection("Reservations").Document(reservation.Id).SetAsync(reservation, SetOptions.MergeAll);
    }

    // Reviews
    public async Task AddReviewAsync(Review review)
    {
        await _firestoreDb.Collection("Reviews").Document(review.Id).SetAsync(review);
    }

    public async Task<List<Review>> GetReviewsByAccommodationAsync(string accommodationId)
    {
        var query = await _firestoreDb.Collection("Reviews")
            .WhereEqualTo("AccommodationId", accommodationId)
            .WhereEqualTo("IsApproved", true)
            .GetSnapshotAsync();
        
        return query.Documents.Select(d => d.ConvertTo<Review>()).ToList();
    }

    public async Task<List<Review>> GetReviewsByUserAsync(string userId)
    {
        var query = await _firestoreDb.Collection("Reviews")
            .WhereEqualTo("UserId", userId)
            .GetSnapshotAsync();
        
        return query.Documents.Select(d => d.ConvertTo<Review>()).ToList();
    }

    public async Task<Review?> GetReviewByUserAndAccommodationAsync(string userId, string accommodationId)
    {
        var query = await _firestoreDb.Collection("Reviews")
            .WhereEqualTo("UserId", userId)
            .WhereEqualTo("AccommodationId", accommodationId)
            .GetSnapshotAsync();
        
        return query.Documents.FirstOrDefault()?.ConvertTo<Review>();
    }

    public async Task<Review?> GetReviewByIdAsync(string reviewId)
    {
        var doc = await _firestoreDb.Collection("Reviews").Document(reviewId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<Review>() : null;
    }

    public async Task UpdateReviewAsync(Review review)
    {
        await _firestoreDb.Collection("Reviews").Document(review.Id).SetAsync(review, SetOptions.MergeAll);
    }

    public async Task DeleteReviewAsync(string reviewId)
    {
        await _firestoreDb.Collection("Reviews").Document(reviewId).DeleteAsync();
    }

    // Questions
    public async Task AddQuestionAsync(Question question)
    {
        await _firestoreDb.Collection("Questions").Document(question.Id).SetAsync(question);
    }

    public async Task<List<Question>> GetQuestionsByAccommodationAsync(string accommodationId, bool onlyApproved = true)
    {
        var queryRef = _firestoreDb.Collection("Questions")
            .WhereEqualTo("AccommodationId", accommodationId);

        if (onlyApproved)
        {
            queryRef = queryRef.WhereEqualTo("IsApproved", true);
        }

        var query = await queryRef.GetSnapshotAsync();
        return query.Documents.Select(d => d.ConvertTo<Question>()).ToList();
    }

    public async Task<List<Question>> GetAllQuestionsAsync()
    {
        var query = await _firestoreDb.Collection("Questions").GetSnapshotAsync();
        return query.Documents.Select(d => d.ConvertTo<Question>()).ToList();
    }

    public async Task<Question?> GetQuestionByIdAsync(string questionId)
    {
        var doc = await _firestoreDb.Collection("Questions").Document(questionId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<Question>() : null;
    }

    public async Task UpdateQuestionAsync(Question question)
    {
        await _firestoreDb.Collection("Questions").Document(question.Id).SetAsync(question, SetOptions.MergeAll);
    }

    public async Task DeleteQuestionAsync(string questionId)
    {
        await _firestoreDb.Collection("Questions").Document(questionId).DeleteAsync();
    }

    // Payment Records
    public async Task AddPaymentRecordAsync(PaymentRecord payment)
    {
        await _firestoreDb.Collection("Payments").Document(payment.ReservationId).SetAsync(payment);
    }
}
