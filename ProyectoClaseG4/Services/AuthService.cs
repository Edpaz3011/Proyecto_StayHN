using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using ProyectoClaseG4.Models;
using MailKit.Net.Smtp;
using MimeKit;

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
    //Nuevo agregado por recuperacion de contraseña
    public async Task<(bool success, string message)> SendPasswordResetEmailAsync(string email)
{
    var normalizedEmail = NormalizeEmail(email);
    var user = await _firebaseService.GetUserByEmailAsync(normalizedEmail);

    if (user == null)
        return (false, "El correo electrónico no está registrado.");

    // Generar código de 6 dígitos único
    var resetToken = new Random().Next(100000, 999999).ToString();
    user.ResetToken = resetToken; 
    await _firebaseService.UpdateUserAsync(user);

    try
    {
        var message = new MimeMessage();
        // REEMPLAZA: Pon tu correo real de Gmail aquí
        message.From.Add(new MailboxAddress("StayHN Support", "tu-correo@gmail.com"));
        message.To.Add(new MailboxAddress(user.FullName, user.Email));
        message.Subject = "Código de recuperación de contraseña - StayHN";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <h3>Hola, {user.FullName}</h3>
                <p>Has solicitado restablecer tu contraseña en StayHN.</p>
                <p>Tu código de verificación es: <strong style='font-size: 18px; color: #2c3e50;'>{resetToken}</strong></p>
                <p>Este código es de un solo uso. Si no solicitaste esto, puedes ignorar este correo.</p>"
        };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);

        // REEMPLAZA: Coloca tu correo y tu Contraseña de Aplicación de 16 letras
        await client.AuthenticateAsync("tu-correo@gmail.com", "tu-contraseña-de-aplicacion");

        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        return (true, "Se ha enviado el código de verificación a tu correo.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR SMTP] No se pudo enviar el correo: {ex.Message}");
        Console.WriteLine($"[DEBUG] Código alternativo en consola: {resetToken}");
        return (true, "Código generado (Revisa la consola del servidor local ya que falló el envío SMTP).");
    }
}

public async Task<(bool success, string message)> ResetPasswordAsync(string email, string token, string newPassword)
{
    var normalizedEmail = NormalizeEmail(email);
    var user = await _firebaseService.GetUserByEmailAsync(normalizedEmail);

    if (user == null || string.IsNullOrEmpty(user.ResetToken) || user.ResetToken != token.Trim())
        return (false, "El código de verificación es incorrecto o ya expiró.");

    user.PasswordHash = HashPassword(newPassword);
    user.ResetToken = null; // Limpiar token usado

    await _firebaseService.UpdateUserAsync(user);
    return (true, "Contraseña actualizada con éxito.");
}
}
