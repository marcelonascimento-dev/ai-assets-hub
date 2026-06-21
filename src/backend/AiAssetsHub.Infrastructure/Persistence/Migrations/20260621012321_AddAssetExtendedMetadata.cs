using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiAssetsHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAssetExtendedMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InstallNotes",
                schema: "catalog",
                table: "assets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstallType",
                schema: "catalog",
                table: "assets",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Manual");

            migrationBuilder.AddColumn<List<string>>(
                name: "Tags",
                schema: "catalog",
                table: "assets",
                type: "text[]",
                nullable: false,
                defaultValueSql: "ARRAY[]::text[]");

            migrationBuilder.AddColumn<string>(
                name: "TeamName",
                schema: "catalog",
                table: "assets",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Version",
                schema: "catalog",
                table: "assets",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "1.0.0");

            migrationBuilder.CreateIndex(
                name: "IX_assets_Tags",
                schema: "catalog",
                table: "assets",
                column: "Tags")
                .Annotation("Npgsql:IndexMethod", "GIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_assets_Tags",
                schema: "catalog",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "InstallNotes",
                schema: "catalog",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "InstallType",
                schema: "catalog",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "Tags",
                schema: "catalog",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "TeamName",
                schema: "catalog",
                table: "assets");

            migrationBuilder.DropColumn(
                name: "Version",
                schema: "catalog",
                table: "assets");
        }
    }
}
