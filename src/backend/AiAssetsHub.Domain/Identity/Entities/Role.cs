namespace AiAssetsHub.Domain.Identity.Entities;

public sealed class Role
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string NormalizedName { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
}
