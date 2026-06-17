using Google.Cloud.Firestore;

namespace ProyectoClaseG4.Models;

[FirestoreData]
public class User
{
    [FirestoreProperty]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [FirestoreProperty]
    public string Email { get; set; } = string.Empty;
    [FirestoreProperty]
    public string FullName { get; set; } = string.Empty;
    [FirestoreProperty]
    public string PasswordHash { get; set; } = string.Empty;
    [FirestoreProperty]
    public string Role { get; set; } = "guest"; // "admin" o "guest"
    [FirestoreProperty]
    public string ProfilePhotoUrl { get; set; } = string.Empty;
    [FirestoreProperty]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [FirestoreProperty]
    public bool IsActive { get; set; } = true;
    [FirestoreProperty]
    public string? ResetToken { get; set; } = null;
}
