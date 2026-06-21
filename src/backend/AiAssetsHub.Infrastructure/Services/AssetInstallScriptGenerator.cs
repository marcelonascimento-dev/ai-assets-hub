using System.Text;
using AiAssetsHub.Application.Contracts.Catalog;
using AiAssetsHub.Domain.Catalog;

namespace AiAssetsHub.Infrastructure.Services;

public enum InstallShell
{
    PowerShell,
    Bash
}

public static class AssetInstallScriptGenerator
{
    public static string Generate(AssetDetailResponse asset, InstallShell shell)
    {
        return shell switch
        {
            InstallShell.PowerShell => GeneratePowerShell(asset),
            InstallShell.Bash => GenerateBash(asset),
            _ => throw new ArgumentOutOfRangeException(nameof(shell))
        };
    }

    private static string GeneratePowerShell(AssetDetailResponse asset)
    {
        var sb = new StringBuilder();
        sb.AppendLine("# AI Assets Hub installer");
        sb.AppendLine($"# Asset: {Ascii(asset.Name)} (v{Ascii(asset.Version)})");
        sb.AppendLine($"# Categoria: {Ascii(asset.Category)}");
        sb.AppendLine();
        sb.AppendLine("$ErrorActionPreference = 'Stop'");
        sb.AppendLine();

        // Banner — ASCII apenas
        sb.AppendLine("Write-Host ''");
        sb.AppendLine("Write-Host '  +---------------------------------------------+' -ForegroundColor DarkCyan");
        sb.AppendLine("Write-Host '  |          AI Assets Hub  -  Installer        |' -ForegroundColor Cyan");
        sb.AppendLine("Write-Host '  +---------------------------------------------+' -ForegroundColor DarkCyan");
        sb.AppendLine("Write-Host ''");
        sb.AppendLine($"Write-Host '   Asset      ' -NoNewline -ForegroundColor DarkGray; Write-Host '{EscapePs(Ascii(asset.Name))}' -ForegroundColor White");
        sb.AppendLine($"Write-Host '   Versao     ' -NoNewline -ForegroundColor DarkGray; Write-Host '{EscapePs(Ascii(asset.Version))}' -ForegroundColor White");
        sb.AppendLine($"Write-Host '   Categoria  ' -NoNewline -ForegroundColor DarkGray; Write-Host '{EscapePs(Ascii(asset.Category))}' -ForegroundColor White");
        sb.AppendLine("Write-Host ''");
        sb.AppendLine("Write-Host '   >> Instalando...' -ForegroundColor DarkCyan");
        sb.AppendLine("Write-Host ''");

        switch (asset.Category)
        {
            case AssetCategories.Skill:
                EmitSkillInstall(sb, asset, InstallShell.PowerShell);
                break;
            case AssetCategories.McpServer:
                EmitMcpHint(sb, asset, InstallShell.PowerShell);
                break;
            case AssetCategories.Prompt:
                EmitDocFile(sb, asset, InstallShell.PowerShell);
                break;
            default:
                EmitGenericNotes(sb, asset, InstallShell.PowerShell);
                break;
        }

        sb.AppendLine();
        sb.AppendLine("Write-Host ''");
        sb.AppendLine("Write-Host '   [OK] Instalacao concluida com sucesso.' -ForegroundColor Green");
        sb.AppendLine("Write-Host ''");

        if (asset.Category == AssetCategories.Skill)
        {
            sb.AppendLine("Write-Host '  +---------------------------------------------+' -ForegroundColor DarkYellow");
            sb.AppendLine("Write-Host '  |  Atencao  -  passo final                    |' -ForegroundColor Yellow");
            sb.AppendLine("Write-Host '  +---------------------------------------------+' -ForegroundColor DarkYellow");
            sb.AppendLine("Write-Host ''");
            sb.AppendLine("Write-Host '   O Claude Code so carrega skills no boot.' -ForegroundColor Gray");
            sb.AppendLine("Write-Host '   Reinicie ele para a skill aparecer:' -ForegroundColor Gray");
            sb.AppendLine("Write-Host ''");
            sb.AppendLine("Write-Host '     1. ' -NoNewline -ForegroundColor DarkGray; Write-Host 'Feche todas as janelas do Claude Code.' -ForegroundColor White");
            sb.AppendLine("Write-Host '     2. ' -NoNewline -ForegroundColor DarkGray; Write-Host 'Clique com o botao direito no icone da BANDEJA' -ForegroundColor White");
            sb.AppendLine("Write-Host '        ' -NoNewline; Write-Host '(canto inferior direito) e selecione Sair.' -ForegroundColor White");
            sb.AppendLine("Write-Host '     3. ' -NoNewline -ForegroundColor DarkGray; Write-Host 'Abra o Claude Code novamente.' -ForegroundColor White");
            sb.AppendLine("Write-Host ''");
            sb.AppendLine("Write-Host '   Fechar a janela ' -NoNewline -ForegroundColor Gray; Write-Host 'NAO eh suficiente' -NoNewline -ForegroundColor Red; Write-Host ' - o app fica' -ForegroundColor Gray");
            sb.AppendLine("Write-Host '   rodando minimizado na bandeja do Windows.' -ForegroundColor Gray");
            sb.AppendLine("Write-Host ''");
        }

        return sb.ToString();
    }

    private static string GenerateBash(AssetDetailResponse asset)
    {
        var sb = new StringBuilder();
        sb.AppendLine("#!/usr/bin/env bash");
        sb.AppendLine("# AI Assets Hub installer");
        sb.AppendLine($"# Asset: {asset.Name} (v{asset.Version})");
        sb.AppendLine($"# Categoria: {asset.Category}");
        sb.AppendLine("set -euo pipefail");
        sb.AppendLine();
        sb.AppendLine("c_cyan=$'\\033[36m'; c_dim=$'\\033[2m'; c_green=$'\\033[32m'; c_yellow=$'\\033[33m'; c_red=$'\\033[31m'; c_white=$'\\033[97m'; c_reset=$'\\033[0m';");
        sb.AppendLine();
        sb.AppendLine("printf '\\n'");
        sb.AppendLine("printf '  %s+---------------------------------------------+%s\\n' \"$c_cyan\" \"$c_reset\"");
        sb.AppendLine("printf '  %s|%s          AI Assets Hub  -  Installer        %s|%s\\n' \"$c_cyan\" \"$c_white\" \"$c_cyan\" \"$c_reset\"");
        sb.AppendLine("printf '  %s+---------------------------------------------+%s\\n' \"$c_cyan\" \"$c_reset\"");
        sb.AppendLine("printf '\\n'");
        sb.AppendLine($"printf '   %sAsset      %s%s\\n' \"$c_dim\" \"$c_reset\" \"{EscapeBash(asset.Name)}\"");
        sb.AppendLine($"printf '   %sVersao     %s%s\\n' \"$c_dim\" \"$c_reset\" \"{EscapeBash(asset.Version)}\"");
        sb.AppendLine($"printf '   %sCategoria  %s%s\\n' \"$c_dim\" \"$c_reset\" \"{EscapeBash(asset.Category)}\"");
        sb.AppendLine("printf '\\n'");
        sb.AppendLine("printf '   %s>> Instalando...%s\\n\\n' \"$c_cyan\" \"$c_reset\"");

        switch (asset.Category)
        {
            case AssetCategories.Skill:
                EmitSkillInstall(sb, asset, InstallShell.Bash);
                break;
            case AssetCategories.McpServer:
                EmitMcpHint(sb, asset, InstallShell.Bash);
                break;
            case AssetCategories.Prompt:
                EmitDocFile(sb, asset, InstallShell.Bash);
                break;
            default:
                EmitGenericNotes(sb, asset, InstallShell.Bash);
                break;
        }

        sb.AppendLine();
        sb.AppendLine("printf '\\n   %s[OK] Instalacao concluida com sucesso.%s\\n\\n' \"$c_green\" \"$c_reset\"");

        if (asset.Category == AssetCategories.Skill)
        {
            sb.AppendLine("printf '  %s+---------------------------------------------+%s\\n' \"$c_yellow\" \"$c_reset\"");
            sb.AppendLine("printf '  %s|  Atencao  -  passo final                    |%s\\n' \"$c_yellow\" \"$c_reset\"");
            sb.AppendLine("printf '  %s+---------------------------------------------+%s\\n\\n' \"$c_yellow\" \"$c_reset\"");
            sb.AppendLine("printf '   O Claude Code so carrega skills no boot.\\n'");
            sb.AppendLine("printf '   Reinicie ele para a skill aparecer.\\n\\n'");
        }

        return sb.ToString();
    }

    private static void EmitSkillInstall(StringBuilder sb, AssetDetailResponse asset, InstallShell shell)
    {
        // O conteúdo do SKILL.md PODE ter UTF-8 — o gravamos via File.WriteAllText com UTF8 sem BOM,
        // que escreve bytes corretos no disco. O Claude Code lê como UTF-8.
        var content = BuildSkillMarkdown(asset);
        if (shell == InstallShell.PowerShell)
        {
            sb.AppendLine($"$dir = Join-Path $HOME '.claude\\skills\\{asset.Slug}'");
            sb.AppendLine("New-Item -ItemType Directory -Force -Path $dir | Out-Null");
            // Conteúdo em base64 para preservar UTF-8 sem depender de encoding do iwr/iex.
            var contentBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(content));
            sb.AppendLine($"$contentBytes = [System.Convert]::FromBase64String('{contentBase64}')");
            sb.AppendLine("$contentUtf8 = [System.Text.Encoding]::UTF8.GetString($contentBytes)");
            sb.AppendLine("$skillPath = Join-Path $dir 'SKILL.md'");
            sb.AppendLine("[System.IO.File]::WriteAllText($skillPath, $contentUtf8, [System.Text.UTF8Encoding]::new($false))");
            sb.AppendLine("Write-Host '   [+] ' -NoNewline -ForegroundColor DarkGray; Write-Host \"SKILL.md gravado em $skillPath\" -ForegroundColor Gray");
        }
        else
        {
            // Bash em macOS/Linux geralmente trata UTF-8 ok. Usamos heredoc.
            sb.AppendLine($"dir=\"$HOME/.claude/skills/{asset.Slug}\"");
            sb.AppendLine("mkdir -p \"$dir\"");
            sb.AppendLine("cat > \"$dir/SKILL.md\" <<'__LGHUB_EOF__'");
            sb.Append(content);
            if (!content.EndsWith('\n')) sb.AppendLine();
            sb.AppendLine("__LGHUB_EOF__");
            sb.AppendLine("printf '   %s[+] %sSKILL.md gravado em %s\\n' \"$c_dim\" \"$c_reset\" \"$dir/SKILL.md\"");
        }
    }

    private static void EmitDocFile(StringBuilder sb, AssetDetailResponse asset, InstallShell shell)
    {
        var content = $"# {asset.Name}\n\n{asset.DetailedDescription ?? string.Empty}\n";
        if (shell == InstallShell.PowerShell)
        {
            sb.AppendLine($"$dir = Join-Path $HOME 'lg-assets\\{asset.Slug}'");
            sb.AppendLine("New-Item -ItemType Directory -Force -Path $dir | Out-Null");
            var contentBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(content));
            sb.AppendLine($"$contentBytes = [System.Convert]::FromBase64String('{contentBase64}')");
            sb.AppendLine("$contentUtf8 = [System.Text.Encoding]::UTF8.GetString($contentBytes)");
            sb.AppendLine("$docPath = Join-Path $dir 'README.md'");
            sb.AppendLine("[System.IO.File]::WriteAllText($docPath, $contentUtf8, [System.Text.UTF8Encoding]::new($false))");
            sb.AppendLine("Write-Host '   [+] ' -NoNewline -ForegroundColor DarkGray; Write-Host \"README.md gravado em $docPath\" -ForegroundColor Gray");
        }
        else
        {
            sb.AppendLine($"dir=\"$HOME/lg-assets/{asset.Slug}\"");
            sb.AppendLine("mkdir -p \"$dir\"");
            sb.AppendLine("cat > \"$dir/README.md\" <<'__LGHUB_EOF__'");
            sb.Append(content);
            sb.AppendLine("__LGHUB_EOF__");
            sb.AppendLine("printf '   %s[+] %sREADME.md gravado em %s\\n' \"$c_dim\" \"$c_reset\" \"$dir/README.md\"");
        }
    }

    private static void EmitMcpHint(StringBuilder sb, AssetDetailResponse asset, InstallShell shell)
    {
        if (shell == InstallShell.PowerShell)
        {
            sb.AppendLine("Write-Host '   [i] ' -NoNewline -ForegroundColor DarkGray; Write-Host 'Servidor MCP - adicione ao claude_desktop_config.json:' -ForegroundColor Gray");
            sb.AppendLine("Write-Host ''");
            if (!string.IsNullOrWhiteSpace(asset.InstallNotes))
            {
                foreach (var line in asset.InstallNotes.Split('\n'))
                {
                    sb.AppendLine($"Write-Host '   {EscapePs(Ascii(line.TrimEnd('\r')))}' -ForegroundColor White");
                }
            }
        }
        else
        {
            sb.AppendLine("printf '   %s[i] %sServidor MCP - adicione ao claude_desktop_config.json:%s\\n\\n' \"$c_dim\" \"$c_white\" \"$c_reset\"");
            if (!string.IsNullOrWhiteSpace(asset.InstallNotes))
            {
                foreach (var line in asset.InstallNotes.Split('\n'))
                {
                    sb.AppendLine($"printf '   %s\\n' \"{EscapeBash(line.TrimEnd('\r'))}\"");
                }
            }
        }
    }

    private static void EmitGenericNotes(StringBuilder sb, AssetDetailResponse asset, InstallShell shell)
    {
        if (string.IsNullOrWhiteSpace(asset.InstallNotes))
        {
            if (shell == InstallShell.PowerShell)
            {
                sb.AppendLine("Write-Host '   [i] Este asset nao possui instalador automatico.' -ForegroundColor Yellow");
                sb.AppendLine("Write-Host '       Consulte a descricao na plataforma.' -ForegroundColor Gray");
            }
            else
            {
                sb.AppendLine("printf '   %s[i] Este asset nao possui instalador automatico.%s\\n' \"$c_yellow\" \"$c_reset\"");
            }
            return;
        }

        if (shell == InstallShell.PowerShell)
        {
            sb.AppendLine("Write-Host '   [i] Instrucoes:' -ForegroundColor Gray");
            foreach (var line in asset.InstallNotes.Split('\n'))
            {
                sb.AppendLine($"Write-Host '     {EscapePs(Ascii(line.TrimEnd('\r')))}' -ForegroundColor White");
            }
        }
        else
        {
            sb.AppendLine("printf '   %s[i] Instrucoes:%s\\n' \"$c_dim\" \"$c_reset\"");
            foreach (var line in asset.InstallNotes.Split('\n'))
            {
                sb.AppendLine($"printf '     %s\\n' \"{EscapeBash(line.TrimEnd('\r'))}\"");
            }
        }
    }

    private static string BuildSkillMarkdown(AssetDetailResponse asset)
    {
        var skillName = asset.Slug;
        var description = asset.ShortDescription.Replace("\n", " ").Replace("\r", "").Trim();

        var sb = new StringBuilder();
        sb.AppendLine("---");
        sb.AppendLine($"name: {skillName}");
        sb.AppendLine($"description: {description}");
        sb.AppendLine("---");
        sb.AppendLine();
        sb.AppendLine($"# {asset.Name}");
        sb.AppendLine();
        sb.Append(asset.DetailedDescription ?? string.Empty);
        return sb.ToString();
    }

    private static string EscapePs(string value)
    {
        return value.Replace("'", "''");
    }

    private static string EscapeBash(string value)
    {
        return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
    }

    /// <summary>
    /// Remove acentos e caracteres não-ASCII de uma string. Usado apenas em mensagens do script
    /// para evitar problemas de encoding em iwr | iex no Windows PowerShell. O conteúdo gravado
    /// no disco (SKILL.md) é UTF-8 puro via base64.
    /// </summary>
    private static string Ascii(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        var normalized = value.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var ch in normalized)
        {
            var cat = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch);
            if (cat == System.Globalization.UnicodeCategory.NonSpacingMark) continue;
            if (ch <= 0x7E) sb.Append(ch);
            else sb.Append('?');
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
