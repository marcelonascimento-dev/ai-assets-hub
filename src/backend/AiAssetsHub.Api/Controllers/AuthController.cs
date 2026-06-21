using AiAssetsHub.Api.Models.Auth;
using AiAssetsHub.Application.Contracts.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AiAssetsHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType<RegistrationResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(RegisterUserRequestModel request, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(
            new RegisterUserRequest(request.FullName, request.Email, request.Password),
            cancellationToken);

        if (result.Succeeded && result.Response is not null)
        {
            return Created(string.Empty, result.Response);
        }

        return result.FailureReason switch
        {
            AuthFailureReason.EmailAlreadyRegistered => Conflict(new { message = result.ErrorMessage }),
            AuthFailureReason.EmailDomainNotAllowed => BadRequest(new { message = result.ErrorMessage }),
            _ => BadRequest(new { message = result.ErrorMessage ?? "Nao foi possivel criar a conta." })
        };
    }

    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Login(LoginRequestModel request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(
            new LoginRequest(request.Email, request.Password),
            cancellationToken);

        if (result.Succeeded && result.Response is not null)
        {
            return Ok(result.Response);
        }

        if (result.FailureReason == AuthFailureReason.EmailNotConfirmed)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = result.ErrorMessage });
        }

        return Unauthorized(new { message = result.ErrorMessage ?? "E-mail ou senha incorretos." });
    }

    [HttpPost("confirm-email")]
    [ProducesResponseType<OperationResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string token, CancellationToken cancellationToken)
    {
        var result = await authService.ConfirmEmailAsync(token, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(new { message = result.Message });
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType<OperationResult>(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword(RequestPasswordResetModel request, CancellationToken cancellationToken)
    {
        var result = await authService.RequestPasswordResetAsync(request.Email, cancellationToken);
        return Ok(result);
    }

    [HttpPost("reset-password")]
    [ProducesResponseType<OperationResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(ResetPasswordModel request, CancellationToken cancellationToken)
    {
        var result = await authService.ResetPasswordAsync(request.Token, request.NewPassword, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(new { message = result.Message });
    }
}
