using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TempoForge.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestsAndSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sprints_Running",
                table: "Sprints");

            migrationBuilder.DropIndex(
                name: "IX_Projects_Track",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Pinned",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Track",
                table: "Projects");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUsedAt",
                table: "Projects",
                type: "timestamptz",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Quests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Goal = table.Column<int>(type: "integer", nullable: false),
                    Progress = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Reward = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    UserProfileId = table.Column<Guid>(type: "uuid", nullable: true),
                    RewardClaimed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quests", x => x.Id);
                    table.CheckConstraint("CK_Quests_Goal", "\"Goal\" >= 0");
                    table.CheckConstraint("CK_Quests_Progress", "\"Progress\" >= 0");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_Running",
                table: "Sprints",
                column: "Status",
                unique: true,
                filter: "\"Status\" = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_IsFavorite",
                table: "Projects",
                column: "IsFavorite");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_LastUsedAt",
                table: "Projects",
                column: "LastUsedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Quests_ExpiresAt",
                table: "Quests",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_Quests_Type",
                table: "Quests",
                column: "Type",
                unique: true);

            var now = DateTime.UtcNow;
            var dailyExpiry = DateTime.SpecifyKind(now.Date.AddDays(1), DateTimeKind.Utc);
            var daysUntilMonday = ((int)DayOfWeek.Monday - (int)now.DayOfWeek + 7) % 7;
            if (daysUntilMonday == 0)
            {
                daysUntilMonday = 7;
            }

            var weeklyExpiry = DateTime.SpecifyKind(now.Date.AddDays(daysUntilMonday), DateTimeKind.Utc);
            var epicExpiry = DateTime.SpecifyKind(DateTime.MaxValue, DateTimeKind.Utc);

            migrationBuilder.InsertData(
                table: "Quests",
                columns: new[] { "Id", "Name", "Type", "Goal", "Progress", "Reward", "ExpiresAt", "RewardClaimed", "CreatedAt" },
                values: new object[,]
                {
                    { Guid.Parse("E02A8019-59D3-4C2C-9CA3-71EE7FF5A715"), "Complete 3 sprints today", 0, 3, 0, "Daily momentum", dailyExpiry, false, now },
                    { Guid.Parse("B8936F1C-AC96-4B28-831F-C0CCF671E588"), "Complete 15 sprints this week", 1, 15, 0, "Weekly chest", weeklyExpiry, false, now },
                    { Guid.Parse("7A20E670-8CE9-4F5F-9675-0A1F6B65BF54"), "Reach 100 total sprints", 2, 100, 0, "Epic banner", epicExpiry, false, now }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Quests");

            migrationBuilder.DropIndex(
                name: "IX_Sprints_Running",
                table: "Sprints");

            migrationBuilder.DropIndex(
                name: "IX_Projects_IsFavorite",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_LastUsedAt",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LastUsedAt",
                table: "Projects");

            migrationBuilder.AddColumn<bool>(
                name: "Pinned",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Track",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_Running",
                table: "Sprints",
                column: "Status",
                unique: true,
                filter: "\"Status\" = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Track",
                table: "Projects",
                column: "Track");
        }
    }
}
