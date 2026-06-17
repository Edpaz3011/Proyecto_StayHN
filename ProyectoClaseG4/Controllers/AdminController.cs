using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProyectoClaseG4.Models;
using ProyectoClaseG4.Services;

namespace ProyectoClaseG4.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly FirebaseService _firebaseService;

    public AdminController(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    // Promote a user to admin. Caller must be authenticated and already an admin.
    [HttpPut("users/{id}/promote")]
    public async Task<IActionResult> PromoteUser(string id)
    {
        var user = await _firebaseService.GetUserByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado." });

        user.Role = "admin";
        await _firebaseService.UpdateUserAsync(user);
        return Ok(new { message = "Usuario promovido a admin correctamente.", user });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _firebaseService.GetAllUsersAsync();
        return Ok(users);
    }
}
