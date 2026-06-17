using Microsoft.AspNetCore.Mvc;
using ProyectoClaseG4.Services;

namespace ProyectoClaseG4.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly ReportService _reportService;

    public ReportController(ReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var statistics = await _reportService.GetReservationStatisticsAsync(startDate, endDate);
        return Ok(statistics);
    }

    [HttpGet("by-type")]
    public async Task<IActionResult> GetReservationsByType()
    {
        var data = await _reportService.GetReservationsByTypeAsync();
        return Ok(data);
    }

    [HttpGet("occupancy")]
    public async Task<IActionResult> GetOccupancyPercentage()
    {
        var data = await _reportService.GetOccupancyPercentageAsync();
        return Ok(data);
    }

    [HttpGet("weekly-trends")]
    public async Task<IActionResult> GetWeeklyTrends()
    {
        var data = await _reportService.GetWeeklyTrendsAsync();
        return Ok(data);
    }
}
