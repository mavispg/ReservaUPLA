using System.Text.RegularExpressions;

namespace ReservaUPLA.Application.Common;

public static class PasswordPolicy
{
    public static IReadOnlyList<string> GetErrors(string? password)
    {
        var value = password?.Trim() ?? string.Empty;
        var errors = new List<string>();

        if (value.Length < 8)
        {
            errors.Add("La contraseña debe tener al menos 8 caracteres.");
        }

        if (!value.Any(character => character is >= 'A' and <= 'Z'))
        {
            errors.Add("Incluye al menos una letra mayúscula (A-Z).");
        }

        if (!value.Any(character => character is >= 'a' and <= 'z'))
        {
            errors.Add("Incluye al menos una letra minúscula (a-z).");
        }

        if (!value.Any(character => character is >= '0' and <= '9'))
        {
            errors.Add("Incluye al menos un número (0-9).");
        }

        if (!Regex.IsMatch(value, @"[^\p{L}\p{N}\s]"))
        {
            errors.Add("Incluye al menos un símbolo (por ejemplo: ! @ # $ %).");
        }

        return errors;
    }
}
