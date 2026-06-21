using System.ComponentModel.DataAnnotations;

namespace AiAssetsHub.Api.Models.Auth;

public sealed class RequestPasswordResetModel
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
