using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TempoForge.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AlignSprintRunningIndexFilter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sprints_Running",
                table: "Sprints");

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_Running",
                table: "Sprints",
                column: "Status",
                unique: true,
                filter: "\"Status\" = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sprints_Running",
                table: "Sprints");

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_Running",
                table: "Sprints",
                column: "Status",
                unique: true,
                filter: "\"Status\" = 0");
        }
    }
}
