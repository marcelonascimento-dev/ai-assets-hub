using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiAssetsHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCatalogMvpAuthAndCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                schema: "catalog",
                table: "assets",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_assets_Category",
                schema: "catalog",
                table: "assets",
                column: "Category");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_assets_Category",
                schema: "catalog",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "Category",
                schema: "catalog",
                table: "assets");
        }
    }
}
