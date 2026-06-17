using Google.Cloud.Firestore;

namespace ProyectoClaseG4.Models;

[FirestoreData]
public class Question
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
    public string QuestionText { get; set; } = string.Empty;
    [FirestoreProperty]
    public string AnswerText { get; set; } = string.Empty;
    [FirestoreProperty]
    public string AnsweredBy { get; set; } = string.Empty;
    [FirestoreProperty]
    public DateTime QuestionDate { get; set; } = DateTime.UtcNow;
    [FirestoreProperty]
    public DateTime? AnswerDate { get; set; }
    [FirestoreProperty]
    public bool IsApproved { get; set; } = false;
}
