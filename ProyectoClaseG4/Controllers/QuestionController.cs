using Microsoft.AspNetCore.Mvc;
using ProyectoClaseG4.Models;
using ProyectoClaseG4.Services;

namespace ProyectoClaseG4.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionController : ControllerBase
{
    private readonly QuestionService _questionService;

    public QuestionController(QuestionService questionService)
    {
        _questionService = questionService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuestion([FromBody] Question question)
    {
        if (string.IsNullOrWhiteSpace(question.UserId) || string.IsNullOrWhiteSpace(question.AccommodationId))
            return BadRequest("UserId y AccommodationId son requeridos.");

        if (string.IsNullOrWhiteSpace(question.QuestionText))
            return BadRequest("Texto de la pregunta es requerido.");

        var created = await _questionService.CreateQuestionAsync(question);
        return Ok(new { message = "Pregunta creada exitosamente.", question = created });
    }

    [HttpGet("accommodation/{accommodationId}")]
    public async Task<IActionResult> GetQuestionsByAccommodation(string accommodationId)
    {
        var questions = await _questionService.GetQuestionsByAccommodationAsync(accommodationId);
        return Ok(questions);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllQuestions()
    {
        var questions = await _questionService.GetAllQuestionsAsync();
        return Ok(questions);
    }

    [HttpPut("{id}/answer")]
    public async Task<IActionResult> AnswerQuestion(string id, [FromBody] AnswerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.AnswerText))
            return BadRequest("Texto de respuesta es requerido.");

        var (success, message) = await _questionService.AnswerQuestionAsync(id, request.AnswerText, request.AnsweredBy);
        
        if (!success)
            return BadRequest(new { message });

        return Ok(new { message });
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveQuestion(string id)
    {
        await _questionService.ApproveQuestionAsync(id);
        return Ok(new { message = "Pregunta aprobada exitosamente." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuestion(string id)
    {
        await _questionService.DeleteQuestionAsync(id);
        return Ok(new { message = "Pregunta eliminada exitosamente." });
    }
}

public class AnswerRequest
{
    public string AnswerText { get; set; } = string.Empty;
    public string AnsweredBy { get; set; } = string.Empty;
}
