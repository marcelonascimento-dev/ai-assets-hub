namespace AiAssetsHub.Infrastructure.Services;

public sealed class EmailDeliveryOptions
{
    public const string SectionName = "EmailDelivery";

    public string Provider { get; set; } = "DevelopmentLink";

    public AzureCommunicationEmailOptions AzureCommunicationServices { get; set; } = new();

    public bool IsAzureCommunicationServices =>
        string.Equals(Provider, "AzureCommunicationServices", StringComparison.OrdinalIgnoreCase);
}

public sealed class AzureCommunicationEmailOptions
{
    public string ConnectionString { get; set; } = string.Empty;

    public string SenderAddress { get; set; } = string.Empty;

    public string SenderDisplayName { get; set; } = "AI Assets Hub";
}
