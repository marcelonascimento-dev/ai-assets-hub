namespace AiAssetsHub.Application.Contracts.Catalog;

public sealed record AssetUpdateResult(
    bool Succeeded,
    AssetUpdateFailureReason FailureReason,
    string? ErrorMessage,
    AssetDetailResponse? Asset);

public enum AssetUpdateFailureReason
{
    None,
    NotFound,
    Forbidden,
    InvalidCategory,
    DuplicateSlug
}
