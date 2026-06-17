using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using ProyectoClaseG4.Services;

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-secret-key-here-must-be-at-least-32-characters";
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Bearer";
    options.DefaultChallengeScheme = "Bearer";
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = ctx =>
        {
            Console.WriteLine("JWT Auth failed: " + ctx.Exception?.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = ctx =>
        {
            Console.WriteLine("JWT Token validated for: " + ctx.Principal?.Identity?.Name);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "admin"));
});

// Register Services
var firebaseProjectId = builder.Configuration["Firebase:ProjectId"] ?? "stayhn-project";
var firebaseCredentialPath = builder.Configuration["Firebase:CredentialPath"] ?? Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");

if (string.IsNullOrWhiteSpace(firebaseCredentialPath))
{
    var defaultCredentialPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "firebase-key.json"));
    if (File.Exists(defaultCredentialPath))
    {
        firebaseCredentialPath = defaultCredentialPath;
    }
}
else if (!Path.IsPathRooted(firebaseCredentialPath))
{
    firebaseCredentialPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, firebaseCredentialPath));
}

builder.Services.AddSingleton(new FirebaseService(firebaseProjectId, firebaseCredentialPath));
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AccommodationService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<QuestionService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<ReportService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();