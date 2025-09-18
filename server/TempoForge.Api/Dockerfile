# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy all the project files
COPY server/TempoForge.Api ./TempoForge.Api
COPY server/TempoForge.Application ./TempoForge.Application
COPY server/TempoForge.Domain ./TempoForge.Domain
COPY server/TempoForge.Infrastructure ./TempoForge.Infrastructure
COPY server/TempoForge.Tests ./TempoForge.Tests
COPY TempoForge.sln ./

# Restore & publish API project
RUN dotnet restore ./TempoForge.Api/TempoForge.Api.csproj
RUN dotnet publish ./TempoForge.Api/TempoForge.Api.csproj -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TempoForge.Api.dll"]
