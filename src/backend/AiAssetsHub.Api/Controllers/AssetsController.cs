using System.Security.Claims;
using AiAssetsHub.Api.Models.Catalog;
using AiAssetsHub.Application.Contracts.Catalog;
using AiAssetsHub.Infrastructure.Persistence.Seeding;
using AiAssetsHub.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiAssetsHub.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/assets")]
public sealed class AssetsController(IAssetService assetService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType<IReadOnlyList<AssetSummaryResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> List([FromQuery(Name = "q")] string? query, CancellationToken cancellationToken)
    {
        var assets = await assetService.ListAsync(query, cancellationToken);
        return Ok(assets);
    }

    [HttpGet("search")]
    [AllowAnonymous]
    [ProducesResponseType<IReadOnlyList<AssetSummaryResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery(Name = "q")] string? query, CancellationToken cancellationToken)
    {
        var assets = await assetService.ListAsync(query, cancellationToken);
        return Ok(assets);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType<AssetDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var asset = await assetService.GetByIdAsync(id, cancellationToken);
        return asset is null ? NotFound() : Ok(asset);
    }

    [HttpGet("{id:guid}/install.ps1")]
    [AllowAnonymous]
    [Produces("text/plain")]
    public async Task<IActionResult> GetInstallPowerShell(Guid id, CancellationToken cancellationToken)
    {
        var asset = await assetService.GetByIdAsync(id, cancellationToken);
        if (asset is null) return NotFound();
        var script = AssetInstallScriptGenerator.Generate(asset, InstallShell.PowerShell);
        return Content(script, "text/plain; charset=utf-8");
    }

    [HttpGet("{id:guid}/install.sh")]
    [AllowAnonymous]
    [Produces("text/plain")]
    public async Task<IActionResult> GetInstallBash(Guid id, CancellationToken cancellationToken)
    {
        var asset = await assetService.GetByIdAsync(id, cancellationToken);
        if (asset is null) return NotFound();
        var script = AssetInstallScriptGenerator.Generate(asset, InstallShell.Bash);
        return Content(script, "text/plain; charset=utf-8");
    }

    [HttpPost]
    [ProducesResponseType<AssetDetailResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(CreateAssetRequestModel request, CancellationToken cancellationToken)
    {
        var authorUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(authorUserIdValue, out var authorUserId))
        {
            return Unauthorized();
        }

        var result = await assetService.CreateAsync(
            authorUserId,
            new CreateAssetRequest(
                request.Name,
                request.ShortDescription,
                request.DetailedDescription,
                request.Category,
                request.Tags ?? new List<string>(),
                request.TeamName,
                request.Version,
                request.InstallType,
                request.InstallNotes),
            cancellationToken);

        if (result.Succeeded && result.Asset is not null)
        {
            return CreatedAtAction(nameof(GetById), new { id = result.Asset.Id }, result.Asset);
        }

        return result.FailureReason switch
        {
            AssetCreationFailureReason.DuplicateSlug => Conflict(new { message = result.ErrorMessage }),
            AssetCreationFailureReason.InvalidCategory => BadRequest(new { message = result.ErrorMessage }),
            AssetCreationFailureReason.AuthorNotFound => Unauthorized(),
            _ => BadRequest(new { message = result.ErrorMessage ?? "Asset creation failed." })
        };
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<AssetDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, UpdateAssetRequestModel request, CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var isAdmin = User.IsInRole("Admin");
        var result = await assetService.UpdateAsync(
            id,
            userId,
            isAdmin,
            new UpdateAssetRequest(
                request.Name,
                request.ShortDescription,
                request.DetailedDescription,
                request.Category,
                request.Version,
                request.InstallType,
                request.InstallNotes),
            cancellationToken);

        if (result.Succeeded && result.Asset is not null)
            return Ok(result.Asset);

        return result.FailureReason switch
        {
            AssetUpdateFailureReason.NotFound => NotFound(new { message = result.ErrorMessage }),
            AssetUpdateFailureReason.Forbidden => StatusCode(403, new { message = result.ErrorMessage }),
            AssetUpdateFailureReason.DuplicateSlug => Conflict(new { message = result.ErrorMessage }),
            AssetUpdateFailureReason.InvalidCategory => BadRequest(new { message = result.ErrorMessage }),
            _ => BadRequest(new { message = result.ErrorMessage ?? "Update failed." })
        };
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
            return Unauthorized();

        var isAdmin = User.IsInRole("Admin");
        var result = await assetService.DeleteAsync(id, userId, isAdmin, cancellationToken);

        if (result.Succeeded)
            return NoContent();

        return result.FailureReason switch
        {
            AssetDeleteFailureReason.NotFound => NotFound(new { message = result.ErrorMessage }),
            AssetDeleteFailureReason.Forbidden => StatusCode(403, new { message = result.ErrorMessage }),
            _ => BadRequest(new { message = result.ErrorMessage ?? "Delete failed." })
        };
    }
}
