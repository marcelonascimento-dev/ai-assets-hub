"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { MarkdownEditor } from "@/components/markdown-editor";
import { getAssetById, updateAsset } from "@/lib/api";
import type { Asset } from "@/types/api";

const CATEGORY_OPTIONS = [
  "Agent",
  "MCP Server",
  "Prompt",
  "Skill",
  "Plugin",
];

type CategoryConfig = {
  docLabel: string;
  docHint: string;
  docPlaceholder: string;
  showInstallNotes: boolean;
  installNotesLabel?: string;
  installNotesHint?: string;
  installNotesPlaceholder?: string;
};

function getCategoryConfig(category: string): CategoryConfig {
  switch (category) {
    case "Skill":
      return {
        docLabel: "Instruções da Skill",
        docHint:
          "Este conteudo vira o arquivo SKILL.md que o Claude Code le.",
        docPlaceholder: `# Nome da Skill\n\n...`,
        showInstallNotes: false,
      };
    case "MCP Server":
      return {
        docLabel: "Documentação",
        docHint: "Explique o que o servidor MCP faz e como configurá-lo.",
        docPlaceholder: `# O que faz\n\n...`,
        showInstallNotes: true,
        installNotesLabel: "Configuração MCP (JSON)",
        installNotesHint:
          "Bloco JSON para o claude_desktop_config.json.",
        installNotesPlaceholder: `{\n  "mcpServers": { ... }\n}`,
      };
    case "Prompt":
      return {
        docLabel: "Conteúdo do Prompt",
        docHint: "O conteudo completo do prompt.",
        docPlaceholder: `# Título do Prompt\n\n...`,
        showInstallNotes: false,
      };
    case "Agent":
      return {
        docLabel: "Documentação do Agent",
        docHint: "Descreva o que o agent faz, como configurá-lo e como usá-lo.",
        docPlaceholder: `# Nome do Agent\n\n...`,
        showInstallNotes: true,
        installNotesLabel: "Instruções de instalação",
        installNotesHint: "Passo a passo exibido no terminal do usuario.",
        installNotesPlaceholder: "1. Instale...\n2. Configure...",
      };
    case "Plugin":
      return {
        docLabel: "Documentação do Plugin",
        docHint: "Descreva o que o plugin faz e como usá-lo.",
        docPlaceholder: `# Nome do Plugin\n\n...`,
        showInstallNotes: true,
        installNotesLabel: "Instruções de instalação",
        installNotesHint: "Passo a passo exibido no terminal do usuario.",
        installNotesPlaceholder: "1. Instale...\n2. Configure...",
      };
    default:
      return {
        docLabel: "Descrição detalhada",
        docHint: "Explique o que o asset faz.",
        docPlaceholder: `# O que faz\n\n...`,
        showInstallNotes: true,
        installNotesLabel: "Instruções de instalação",
        installNotesHint: "Passo a passo exibido no terminal do usuario.",
        installNotesPlaceholder: "1. Instale...\n2. Configure...",
      };
  }
}

export function AssetEditClient({ assetId }: { assetId: string }) {
  const router = useRouter();
  const { isReady, token, user } = useSession();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [installNotes, setInstallNotes] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = getCategoryConfig(category);

  useEffect(() => {
    if (!token) return;
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        const data = await getAssetById(assetId, token!);
        if (!active) return;
        setAsset(data);
        setName(data.name);
        setShortDescription(data.shortDescription);
        setDetailedDescription(data.detailedDescription ?? "");
        setInstallNotes(data.installNotes ?? "");
        setCategory(data.category);
        setVersion(data.version);
      } catch (e) {
        if (active) setLoadError(e instanceof Error ? e.message : "Erro ao carregar asset.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [assetId, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError("");

    try {
      await updateAsset(
        assetId,
        {
          name,
          shortDescription,
          detailedDescription,
          category,
          tags: [],
          version: version.trim() || "1.0.0",
          installType: "Automatic",
          installNotes: installNotes.trim() || undefined,
        },
        token,
      );

      router.push(`/assets/${assetId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady || isLoading) {
    return (
      <div className="page-section">
        <div className="skeleton-card">
          <span className="skeleton-line w-40 sm" />
          <span className="skeleton-line lg w-60" />
          <span className="skeleton-line w-80" />
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="page-section">
        <section className="empty-state">
          <h1>Autenticação necessária</h1>
          <p>Entre para editar um asset.</p>
          <Link className="primary-button" href="/login">Entrar</Link>
        </section>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-section">
        <p className="error-banner">{loadError}</p>
        <Link className="text-link" href="/assets">← Voltar</Link>
      </div>
    );
  }

  if (!asset) return null;

  const isOwner = asset.authorUserId === user.id;
  const isAdmin = user.roles.includes("Admin");
  const canManage = isOwner || isAdmin;

  if (!canManage) {
    return (
      <div className="page-section">
        <section className="empty-state">
          <h1>Sem permissão</h1>
          <p>Você só pode editar assets que você publicou.</p>
          <Link className="text-link" href={`/assets/${assetId}`}>← Voltar ao detalhe</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page-section">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="section-heading">
          <p className="eyebrow">Editar</p>
          <h1>{asset.name}</h1>
        </div>

        <section className="form-section">
          <header className="form-section-header">
            <span className="form-section-title">
              <span className="form-section-step">1</span> Identidade
            </span>
          </header>

          <label className="field">
            <span>Nome</span>
            <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
          </label>

          <div className="form-grid-2">
            <label className="field">
              <span>Categoria</span>
              <select className="text-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Selecione</option>
                {CATEGORY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Versão</span>
              <input className="text-input" value={version} onChange={(e) => setVersion(e.target.value)} maxLength={32} required />
            </label>
          </div>

          <label className="field">
            <span>Descrição curta</span>
            <textarea className="text-area" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required rows={2} maxLength={500} />
          </label>
        </section>

        <section className="form-section">
          <header className="form-section-header">
            <span className="form-section-title">
              <span className="form-section-step">2</span> {config.docLabel}
            </span>
            <p className="field-hint">{config.docHint}</p>
          </header>

          <div className="field">
            <label htmlFor="edit-detailed">{config.docLabel}</label>
            <MarkdownEditor
              id="edit-detailed"
              value={detailedDescription}
              onChange={setDetailedDescription}
              placeholder={config.docPlaceholder}
              rows={category === "Skill" ? 20 : 14}
            />
          </div>

          {config.showInstallNotes && config.installNotesLabel && (
            <div className="field">
              <label htmlFor="edit-install-notes">{config.installNotesLabel}</label>
              {config.installNotesHint && (
                <p className="field-hint" style={{ marginTop: 0, marginBottom: 8 }}>{config.installNotesHint}</p>
              )}
              {category === "MCP Server" ? (
                <textarea
                  id="edit-install-notes"
                  className="text-area code-textarea"
                  value={installNotes}
                  onChange={(e) => setInstallNotes(e.target.value)}
                  placeholder={config.installNotesPlaceholder}
                  rows={8}
                  spellCheck={false}
                />
              ) : (
                <MarkdownEditor
                  id="edit-install-notes"
                  value={installNotes}
                  onChange={setInstallNotes}
                  placeholder={config.installNotesPlaceholder ?? ""}
                  rows={6}
                />
              )}
            </div>
          )}
        </section>

        {error ? <p className="error-banner">{error}</p> : null}

        <div className="spread">
          <Link className="ghost-button" href={`/assets/${assetId}`}>← Cancelar</Link>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
