using System.ComponentModel.DataAnnotations;

namespace AiAssetsHub.Api.Models.Auth;

public sealed class ResetPasswordModel
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
