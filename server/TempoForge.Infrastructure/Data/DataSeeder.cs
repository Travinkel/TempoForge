using TempoForge.Domain.Entities;

namespace TempoForge.Infrastructure.Data;

public static class DataSeeder
{
    public static readonly Guid AlgorithmsAndDataStructuresProjectId = Guid.Parse("A3BE47A7-2D90-41F0-AACE-E6C8DDC688A2");
    public static readonly Guid OperatingSystemsStudyProjectId = Guid.Parse("818660AC-3170-4AF5-A4F2-EF8981219641");
    public static readonly Guid DatabaseCourseworkProjectId = Guid.Parse("BCFFEA2E-1F16-47DF-B32C-F5E15DE1A3FF");
    public static readonly Guid SoftwareEngineeringGroupProjectId = Guid.Parse("4F1485E4-F275-41BE-BAB8-D4B9384A8F29");
    public static readonly Guid TempoForgeDevelopmentProjectId = Guid.Parse("C39CDCF2-4F63-479D-9E39-3CA1E56B8627");

    public static readonly Guid DailyCodeTwoHoursQuestId = Guid.Parse("821EAA51-4DF7-4E87-8210-E3AD338C5525");
    public static readonly Guid DailyLeetCodeQuestId = Guid.Parse("686BD800-12DB-4BC3-98A2-D5D83D546223");
    public static readonly Guid DailyReadTwentyPagesQuestId = Guid.Parse("5BF55AE9-A893-43DE-B38F-55981E785C3A");
    public static readonly Guid WeeklyLabAssignmentQuestId = Guid.Parse("C8C0E955-8F81-4FEC-B676-ECBB14F1C950");
    public static readonly Guid WeeklyPushCommitsQuestId = Guid.Parse("E0B065D2-16F8-42F2-BA67-95B23ACDF58C");
    public static readonly Guid EpicMasterSortingQuestId = Guid.Parse("4C34537C-C8BA-4EA0-A182-7AF68C9486AE");
    public static readonly Guid EpicDeployDemoQuestId = Guid.Parse("991DD330-9976-43E5-BF3C-F7E7FED5E210");

    public static void Seed(TempoForgeDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var referenceUtc = DateTime.UtcNow;
        var hasChanges = false;
        var moments = BuildSeedMoments(referenceUtc);

        if (!context.Projects.Any())
        {
            context.Projects.AddRange(BuildProjectSeeds(moments));
            hasChanges = true;
        }

        if (!context.Sprints.Any())
        {
            context.Sprints.AddRange(BuildSprintSeeds(moments));
            hasChanges = true;
        }

        if (!context.Quests.Any())
        {
            context.Quests.AddRange(BuildQuestSeeds(moments));
            hasChanges = true;
        }

        if (hasChanges)
        {
            context.SaveChanges();
        }
    }

    public static IReadOnlyList<Project> CreateProjects(DateTime referenceUtc)
        => BuildProjectSeeds(BuildSeedMoments(referenceUtc));

    public static IReadOnlyList<Sprint> CreateSprints(DateTime referenceUtc)
        => BuildSprintSeeds(BuildSeedMoments(referenceUtc));

    public static IReadOnlyList<Quest> CreateQuests(DateTime referenceUtc)
        => BuildQuestSeeds(BuildSeedMoments(referenceUtc));

    private static IReadOnlyList<Project> BuildProjectSeeds(SeedMoments moments)
    {
        return new List<Project>
        {
            new()
            {
                Id = AlgorithmsAndDataStructuresProjectId,
                Name = "Algorithms & Data Structures",
                IsFavorite = true,
                CreatedAt = moments.StartOfToday.AddDays(-45).AddHours(8),
                LastUsedAt = moments.MorningFocus
            },
            new()
            {
                Id = OperatingSystemsStudyProjectId,
                Name = "Operating Systems Study",
                CreatedAt = moments.StartOfToday.AddDays(-35).AddHours(13),
                LastUsedAt = moments.YesterdayMorning.AddHours(-1)
            },
            new()
            {
                Id = DatabaseCourseworkProjectId,
                Name = "Database Coursework",
                CreatedAt = moments.StartOfToday.AddDays(-28).AddHours(9),
                LastUsedAt = moments.WeekendSession
            },
            new()
            {
                Id = SoftwareEngineeringGroupProjectId,
                Name = "Software Engineering Group Project",
                CreatedAt = moments.StartOfToday.AddDays(-52).AddHours(10),
                LastUsedAt = moments.LastWeekSession
            },
            new()
            {
                Id = TempoForgeDevelopmentProjectId,
                Name = "TempoForge Development",
                CreatedAt = moments.StartOfToday.AddDays(-14).AddHours(8),
                LastUsedAt = moments.AfternoonFocus
            }
        };
    }

    private static IReadOnlyList<Sprint> BuildSprintSeeds(SeedMoments moments)
    {
        return new List<Sprint>
        {
            new()
            {
                Id = Guid.Parse("AEF35B98-37C8-4A61-AE3D-B80CDA376855"),
                ProjectId = AlgorithmsAndDataStructuresProjectId,
                DurationMinutes = 55,
                StartedAt = moments.MorningFocus.AddMinutes(-55),
                CompletedAt = moments.MorningFocus,
                Status = SprintStatus.Completed
            },
            new()
            {
                Id = Guid.Parse("7D3900E6-E9CD-48FE-86E4-1393A148A273"),
                ProjectId = AlgorithmsAndDataStructuresProjectId,
                DurationMinutes = 35,
                StartedAt = moments.YesterdayMorning.AddHours(-1),
                CompletedAt = moments.YesterdayMorning.AddHours(-1).AddMinutes(35),
                Status = SprintStatus.Completed
            },
            new()
            {
                Id = Guid.Parse("FEBCCB5D-B79E-4335-B177-AAB87CC5D921"),
                ProjectId = OperatingSystemsStudyProjectId,
                DurationMinutes = 40,
                StartedAt = moments.YesterdayMorning.AddHours(2),
                CompletedAt = moments.YesterdayMorning.AddHours(2).AddMinutes(40),
                Status = SprintStatus.Completed
            },
            new()
            {
                Id = Guid.Parse("0C448EDB-58D8-4499-9210-A306CEC58DCD"),
                ProjectId = DatabaseCourseworkProjectId,
                DurationMinutes = 50,
                StartedAt = moments.WeekendSession.AddMinutes(-50),
                CompletedAt = moments.WeekendSession,
                Status = SprintStatus.Completed
            },
            new()
            {
                Id = Guid.Parse("C68319FC-7281-4C20-87B1-F4359E64C802"),
                ProjectId = SoftwareEngineeringGroupProjectId,
                DurationMinutes = 45,
                StartedAt = moments.LastWeekSession.AddMinutes(-45),
                CompletedAt = moments.LastWeekSession,
                Status = SprintStatus.Completed
            },
            new()
            {
                Id = Guid.Parse("FF44E82B-61DA-45BC-A221-7EBDD777CC0C"),
                ProjectId = SoftwareEngineeringGroupProjectId,
                DurationMinutes = 30,
                StartedAt = moments.LastWeekSession.AddHours(3),
                AbortedAt = moments.LastWeekSession.AddHours(3).AddMinutes(20),
                Status = SprintStatus.Aborted
            },
            new()
            {
                Id = Guid.Parse("81912F56-A809-41C6-AAC6-A6B5841C044F"),
                ProjectId = TempoForgeDevelopmentProjectId,
                DurationMinutes = 45,
                StartedAt = moments.AfternoonFocus.AddMinutes(-45),
                CompletedAt = moments.AfternoonFocus,
                Status = SprintStatus.Completed
            }
        };
    }

    private static IReadOnlyList<Quest> BuildQuestSeeds(SeedMoments moments)
    {
        var dailyExpiry = moments.StartOfToday.AddDays(1);
        var weeklyExpiry = GetNextWeeklyReset(moments.StartOfToday);
        var epicExpiry = moments.Now.AddMonths(2);

        return new List<Quest>
        {
            new()
            {
                Id = DailyCodeTwoHoursQuestId,
                Name = "Code 2 Hours Today",
                Type = QuestType.Daily,
                Goal = 120,
                Progress = 45,
                Reward = "Focus XP +200",
                ExpiresAt = dailyExpiry.AddHours(4),
                RewardClaimed = false,
                CreatedAt = moments.Now.AddDays(-1)
            },
            new()
            {
                Id = DailyLeetCodeQuestId,
                Name = "Solve 3 LeetCode Problems",
                Type = QuestType.Daily,
                Goal = 180,
                Progress = 0,
                Reward = "Problem Solving Token",
                ExpiresAt = dailyExpiry.AddHours(5),
                RewardClaimed = false,
                CreatedAt = moments.Now
            },
            new()
            {
                Id = DailyReadTwentyPagesQuestId,
                Name = "Read 20 Pages of CS Book",
                Type = QuestType.Daily,
                Goal = 60,
                Progress = 20,
                Reward = "Study Streak Bonus",
                ExpiresAt = dailyExpiry.AddHours(6),
                RewardClaimed = false,
                CreatedAt = moments.Now.AddHours(-6)
            },
            new()
            {
                Id = WeeklyLabAssignmentQuestId,
                Name = "Finish Lab Assignment",
                Type = QuestType.Weekly,
                Goal = 300,
                Progress = 90,
                Reward = "Lab Completion Badge",
                ExpiresAt = weeklyExpiry.AddHours(12),
                RewardClaimed = false,
                CreatedAt = moments.Now.AddDays(-3)
            },
            new()
            {
                Id = WeeklyPushCommitsQuestId,
                Name = "Push 5 Commits to GitHub",
                Type = QuestType.Weekly,
                Goal = 150,
                Progress = 60,
                Reward = "Version Control Cache",
                ExpiresAt = weeklyExpiry.AddHours(14),
                RewardClaimed = false,
                CreatedAt = moments.Now.AddDays(-2)
            },
            new()
            {
                Id = EpicMasterSortingQuestId,
                Name = "Master Sorting Algorithms",
                Type = QuestType.Epic,
                Goal = 1000,
                Progress = 320,
                Reward = "Algorithmic Laurels",
                ExpiresAt = epicExpiry,
                RewardClaimed = false,
                CreatedAt = moments.Now.AddDays(-20)
            },
            new()
            {
                Id = EpicDeployDemoQuestId,
                Name = "Deploy Demo App",
                Type = QuestType.Epic,
                Goal = 600,
                Progress = 210,
                Reward = "Deployment Artifact",
                ExpiresAt = moments.Now.AddMonths(3),
                RewardClaimed = false,
                CreatedAt = moments.Now.AddDays(-10)
            }
        };
    }

    private static SeedMoments BuildSeedMoments(DateTime referenceUtc)
    {
        var now = EnsureUtc(referenceUtc);
        var startOfToday = StartOfDayUtc(now);
        var morningFocus = startOfToday.AddHours(9);
        var afternoonFocus = startOfToday.AddHours(14);
        var yesterdayMorning = morningFocus.AddDays(-1);
        var weekendSession = startOfToday.AddDays(-2).AddHours(11);
        var lastWeekSession = startOfToday.AddDays(-6).AddHours(10);

        return new SeedMoments(now, startOfToday, morningFocus, afternoonFocus, yesterdayMorning, weekendSession, lastWeekSession);
    }

    private static DateTime StartOfDayUtc(DateTime value)
    {
        var utc = EnsureUtc(value);
        return new DateTime(utc.Year, utc.Month, utc.Day, 0, 0, 0, DateTimeKind.Utc);
    }

    private static DateTime GetNextWeeklyReset(DateTime referenceUtc)
    {
        var startOfToday = StartOfDayUtc(referenceUtc);
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)startOfToday.DayOfWeek + 7) % 7;
        if (daysUntilMonday == 0)
        {
            daysUntilMonday                                                                              = 7;
        }

        return startOfToday.AddDays(daysUntilMonday);
    }

    private static DateTime EnsureUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }

    private sealed record SeedMoments(
        DateTime Now,
        DateTime StartOfToday,
        DateTime MorningFocus,
        DateTime AfternoonFocus,
        DateTime YesterdayMorning,
        DateTime WeekendSession,
        DateTime LastWeekSession);
}
