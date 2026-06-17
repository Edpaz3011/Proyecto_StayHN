using Google.Cloud.Firestore;

namespace ProyectoClaseG4.Models;

[FirestoreData]
public class Accommodation
{
    [FirestoreProperty]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [FirestoreProperty]
    public string Name { get; set; } = string.Empty;
    [FirestoreProperty]
    public string Type { get; set; } = string.Empty; // "house", "apartment", "hotel", etc.
    [FirestoreProperty]
    public string Location { get; set; } = string.Empty;
    [FirestoreProperty]
    public int Capacity { get; set; }
    [FirestoreProperty]
    public string Description { get; set; } = string.Empty;
    [FirestoreProperty]
    public List<string> Amenities { get; set; } = new();
    [FirestoreProperty]
    public List<string> PhotoUrls { get; set; } = new();
    [FirestoreProperty]
    public double PricePerNight { get; set; }
    [FirestoreProperty]
    public bool IsActive { get; set; } = true;
    [FirestoreProperty]
    public string CreatedBy { get; set; } = string.Empty;
    [FirestoreProperty]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [FirestoreProperty]
    public double AverageRating { get; set; } = 0;
    [FirestoreProperty]
    public int TotalReviews { get; set; } = 0;
}
