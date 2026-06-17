using ProyectoClaseG4.Models;

namespace ProyectoClaseG4.Services;

public class PaymentService
{
    
    private readonly FirebaseService _firebaseService;

    public PaymentService(FirebaseService firebaseService)
    {
        _firebaseService = firebaseService;
    }

    public async Task<(bool success, string message)> ProcessPaymentAsync(PaymentRecord payment)
    {
        if (!ValidateCardNumber(payment.CardNumber))
            return (false, "Número de tarjeta inválido.");

        if (!ValidateExpirationDate(payment.ExpirationDate))
            return (false, "Fecha de vencimiento inválida.");

        if (!ValidateCVV(payment.CVV))
            return (false, "CVV inválido.");

        // Simular procesamiento de pago
        payment.Status = "successful";
        payment.PaymentDate = DateTime.UtcNow;

        await _firebaseService.AddPaymentRecordAsync(payment);
        return (true, "Pago procesado exitosamente.");
    }

    public bool ValidateCardNumber(string cardNumber)
    {
        if (string.IsNullOrWhiteSpace(cardNumber))
            return false;

        return cardNumber.Length == 16 && cardNumber.All(char.IsDigit);
    }

    public bool ValidateExpirationDate(string expirationDate)
    {
        if (!DateTime.TryParseExact(expirationDate, "MM/yy", null, System.Globalization.DateTimeStyles.None, out var date))
            return false;

        var year = date.Year < 100 ? date.Year + 2000 : date.Year;
        var expirationDateUtc = new DateTime(year, date.Month, DateTime.DaysInMonth(year, date.Month), 23, 59, 59, DateTimeKind.Utc);
        return expirationDateUtc >= DateTime.UtcNow;
    }

    public bool ValidateCVV(string cvv)
    {
        return !string.IsNullOrWhiteSpace(cvv) && cvv.Length == 3 && cvv.All(char.IsDigit);
    }
}









