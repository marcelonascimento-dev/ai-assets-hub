namespace AiAssetsHub.Application.Contracts.Catalog;

public sealed record AssetDeleteResult(
    bool Succeeded,
    AssetDeleteFailureReason FailureReason,
    string? ErrorMessage);

public enum AssetDeleteFailureReason
{
    None,
    NotFound,
    Forbidden
}
