using Google.Cloud.Firestore;

namespace ProyectoClaseG4.Models;

[FirestoreData]
public class Review
{
    [FirestoreProperty]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [FirestoreProperty]
    public string UserId { get; set; } = string.Empty;
    [FirestoreProperty]
    public string UserName { get; set; } = string.Empty;
    [FirestoreProperty]
    public string AccommodationId { get; set; } = string.Empty;
    [FirestoreProperty]
    public int Rating { get; set; } // 1-5
    [FirestoreProperty]
    public string Comment { get; set; } = string.Empty;
    [FirestoreProperty]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [FirestoreProperty]
    public bool IsApproved { get; set; } = true;
}
