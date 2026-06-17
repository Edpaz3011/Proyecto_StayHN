using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class AuthService
{
    private readonly FirebaseService _firebaseService;
    private readonly IConfiguration _configuration;

    public AuthService(FirebaseService firebaseService, IConfiguration configuration)
    {
        _firebaseService = firebaseService;
        _configuration = configuration;
    }

    public async Task<(bool success, string message, User? user, string? token)> RegisterAsync(string email, string fullName, string password)
    {
        var normalizedEmail = NormalizeEmail(email);
        var normalizedFullName = NormalizeFullName(fullName);

        var existingUser = await _firebaseService.GetUserByEmailAsync(normalizedEmail);
        if (existingUser != null)
            return (false, "El usuario ya existe.", null, null);

        var user = new User
        {
            Email = normalizedEmail,
            FullName = normalizedFullName,
            PasswordHash = HashPassword(password),
            Role = "guest"
        };

        await _firebaseService.AddUserAsync(user);
        var token = GenerateJwtToken(user);
        return (true, "Registro exitoso.", user, token);
    }

    public async Task<(bool success, string message, User? user, string? token)> LoginAsync(string email, string password)
    {
        var normalizedEmail = NormalizeEmail(email);
        var user = await _firebaseService.GetUserByEmailAsync(normalizedEmail);
        if (user == null || !VerifyPassword(password, user.PasswordHash))
            return (false, "Credenciales inválidas.", null, null);

        if (!user.IsActive)
            return (false, "La cuenta está desactivada.", null, null);

        var token = GenerateJwtToken(user);
        return (true, "Inicio de sesión exitoso.", user, token);
    }

    public string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    public bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput.Equals(hash);
    }

    private string NormalizeEmail(string email)
    {
        return email?.Trim().ToLowerInvariant() ?? string.Empty;
    }

    private string NormalizeFullName(string fullName)
    {
        return fullName?.Trim() ?? string.Empty;
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "your-secret-key-here"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new System.Security.Claims.Claim("id", user.Id),
            new System.Security.Claims.Claim("email", user.Email),
            new System.Security.Claims.Claim("role", user.Role),
            new System.Security.Claims.Claim("fullName", user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "StayHn",
            audience: _configuration["Jwt:Audience"] ?? "StayHnUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
