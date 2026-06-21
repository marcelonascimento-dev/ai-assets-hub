using System.ComponentModel.DataAnnotations;

namespace AiAssetsHub.Api.Models.Auth;

public sealed class LoginRequestModel
{
    [Required]
    [EmailAddress]
    [StringLength(320)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;
}
