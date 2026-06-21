namespace AiAssetsHub.Domain.Catalog;

public static class AssetCategories
{
    public const string Agent = "Agent";
    public const string McpServer = "MCP Server";
    public const string Prompt = "Prompt";
    public const string Skill = "Skill";
    public const string Plugin = "Plugin";

    public static readonly string[] All =
    [
        Agent,
        McpServer,
        Prompt,
        Skill,
        Plugin
    ];
}
