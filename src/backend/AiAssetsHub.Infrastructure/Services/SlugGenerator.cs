using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace AiAssetsHub.Infrastructure.Services;

internal static partial class SlugGenerator
{
    public static string Generate(string value)
    {
        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var character in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(character);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        var withoutAccents = builder.ToString().Normalize(NormalizationForm.FormC);
        var cleaned = NonAlphaNumeric().Replace(withoutAccents, "-").Trim('-');

        return string.IsNullOrWhiteSpace(cleaned) ? Guid.NewGuid().ToString("N") : cleaned;
    }

    [GeneratedRegex("[^a-z0-9]+", RegexOptions.Compiled)]
    private static partial Regex NonAlphaNumeric();
}
