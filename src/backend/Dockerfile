FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

COPY AiAssetsHub.Domain/AiAssetsHub.Domain.csproj AiAssetsHub.Domain/
COPY AiAssetsHub.Application/AiAssetsHub.Application.csproj AiAssetsHub.Application/
COPY AiAssetsHub.Infrastructure/AiAssetsHub.Infrastructure.csproj AiAssetsHub.Infrastructure/
COPY AiAssetsHub.Api/AiAssetsHub.Api.csproj AiAssetsHub.Api/
RUN dotnet restore AiAssetsHub.Api/AiAssetsHub.Api.csproj

COPY . .
RUN dotnet publish AiAssetsHub.Api/AiAssetsHub.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "AiAssetsHub.Api.dll"]
