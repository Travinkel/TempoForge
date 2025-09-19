using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TempoForge.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AllowMultipleQuestsPerType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Quests_Type",
                table: "Quests");

            migrationBuilder.CreateIndex(
                name: "IX_Quests_Type",
                table: "Quests",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Quests_Type",
                table: "Quests");

            migrationBuilder.CreateIndex(
                name: "IX_Quests_Type",
                table: "Quests",
                column: "Type",
                unique: true);
        }
    }
}
