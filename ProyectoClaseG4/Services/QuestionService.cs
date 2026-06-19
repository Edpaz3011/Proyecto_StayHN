using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class QuestionService
{
    private readonly FirebaseService _firebaseService;

    public QuestionService(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    public async Task<Question> CreateQuestionAsync(Question question)
    {
        question.Id = Guid.NewGuid().ToString();
        question.QuestionDate = DateTime.UtcNow;
        question.IsApproved = false;
        await _firebaseService.AddQuestionAsync(question);
        return question;
    }

    public async Task<List<Question>> GetQuestionsByAccommodationAsync(string accommodationId)
    {
        return await _firebaseService.GetQuestionsByAccommodationAsync(accommodationId, onlyApproved: true);
    }

    public async Task<List<Question>> GetAllQuestionsAsync()
    {
        return await _firebaseService.GetAllQuestionsAsync();
    }

    public async Task<(bool success, string message)> AnswerQuestionAsync(string questionId, string answerText, string answeredBy)
    {
        var question = await _firebaseService.GetQuestionByIdAsync(questionId);
        if (question == null)
            return (false, "Pregunta no encontrada.");

        question.AnswerText = answerText;
        question.AnsweredBy = answeredBy;
        question.AnswerDate = DateTime.UtcNow;
        await _firebaseService.UpdateQuestionAsync(question);

        return (true, "Respuesta publicada exitosamente.");
    }

    public async Task ApproveQuestionAsync(string questionId)
    {
        var question = await _firebaseService.GetQuestionByIdAsync(questionId);
        if (question == null)
            return;

        question.IsApproved = true;
        await _firebaseService.UpdateQuestionAsync(question);
    }

    public async Task DeleteQuestionAsync(string questionId)
    {
        await _firebaseService.DeleteQuestionAsync(questionId);
    }
}




