# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ./TempoForge.Api ./TempoForge.Api
COPY ./TempoForge.Application ./TempoForge.Application
COPY ./TempoForge.Domain ./TempoForge.Domain
COPY ./TempoForge.Infrastructure ./TempoForge.Infrastructure
COPY ./TempoForge.Tests ./TempoForge.Tests
COPY ../TempoForge.sln .
RUN dotnet restore ./TempoForge.Api/TempoForge.Api.csproj
RUN dotnet publish ./TempoForge.Api/TempoForge.Api.csproj -c Release -o /app/publish

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TempoForge.Api.dll"]
