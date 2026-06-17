using Google.Cloud.Firestore;

namespace ProyectoClaseG4.Models;

[FirestoreData]
public class Reservation
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
    public string AccommodationName { get; set; } = string.Empty;
    [FirestoreProperty]
    public DateTime CheckInDate { get; set; }
    [FirestoreProperty]
    public DateTime CheckOutDate { get; set; }
    [FirestoreProperty]
    public int Nights { get; set; }
    [FirestoreProperty]
    public double Subtotal { get; set; }
    [FirestoreProperty]
    public double Taxes { get; set; }
    [FirestoreProperty]
    public double TotalCost { get; set; }
    [FirestoreProperty]
    public string Status { get; set; } = "pending"; // "pending", "confirmed", "cancelled"
    [FirestoreProperty]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [FirestoreProperty]
    public string ReferenceNumber { get; set; } = string.Empty;
}
