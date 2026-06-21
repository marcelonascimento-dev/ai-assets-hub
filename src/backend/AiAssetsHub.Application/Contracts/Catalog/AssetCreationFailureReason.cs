namespace AiAssetsHub.Application.Contracts.Catalog;

public enum AssetCreationFailureReason
{
    None = 0,
    DuplicateSlug,
    InvalidCategory,
    AuthorNotFound
}
