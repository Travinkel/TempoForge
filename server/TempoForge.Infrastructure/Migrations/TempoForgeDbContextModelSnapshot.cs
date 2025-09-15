using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TempoForge.Infrastructure.Data;

#nullable disable

namespace TempoForge.Infrastructure.Migrations
{
    [DbContext(typeof(TempoForgeDbContext))]
    partial class TempoForgeDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.8");

            modelBuilder.Entity("TempoForge.Domain.Entities.Project", b =>
            {
                b.Property<Guid>("Id")
                    .HasColumnType("uuid");

                b.Property<DateTime>("CreatedAt")
                    .HasColumnType("timestamptz");

                b.Property<string>("Name")
                    .IsRequired()
                    .HasMaxLength(80)
                    .HasColumnType("text");

                b.Property<bool>("Pinned")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("boolean")
                    .HasDefaultValue(false);

                b.Property<int>("Track")
                    .HasColumnType("integer");

                b.HasKey("Id");

                b.HasIndex("Track");

                b.ToTable("Projects");
            });
#pragma warning restore 612, 618
        }
    }
}
