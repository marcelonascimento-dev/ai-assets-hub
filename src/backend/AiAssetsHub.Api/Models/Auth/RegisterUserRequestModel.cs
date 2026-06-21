using System.ComponentModel.DataAnnotations;

namespace AiAssetsHub.Api.Models.Auth;

public sealed class RegisterUserRequestModel
{
    [Required]
    [StringLength(160, MinimumLength = 3)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(320)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(Password), ErrorMessage = "As senhas informadas nao conferem.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
