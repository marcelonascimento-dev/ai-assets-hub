namespace AiAssetsHub.Application.Contracts.Catalog;

public sealed record AssetCreationResult(
    bool Succeeded,
    AssetCreationFailureReason FailureReason,
    string? ErrorMessage,
    AssetDetailResponse? Asset);
