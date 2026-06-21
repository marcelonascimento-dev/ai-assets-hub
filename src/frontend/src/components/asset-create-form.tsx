"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSession } from "@/components/session-provider";
import { MarkdownEditor } from "@/components/markdown-editor";
import { createAsset } from "@/lib/api";

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
  installBanner: string;
};

function getCategoryConfig(category: string): CategoryConfig {
  switch (category) {
    case "Skill":
      return {
        docLabel: "Instruções da Skill",
        docHint:
          "Este conteudo vira o arquivo SKILL.md que o Claude Code le. Inclua: o que a skill faz, quando usar, quando nao usar, passo a passo e exemplos.",
        docPlaceholder: `# Nome da Skill\n\nDescrição do que ela faz.\n\n## Quando usar\n\n- \"faz tal coisa\"\n- \"executa tal ação\"\n\n## Quando NÃO usar\n\n- Cenários que não se aplicam\n\n## Passo a passo\n\n1. Primeiro passo\n2. Segundo passo\n\n## Exemplos\n\nExemplo de entrada e saída esperada.`,
        showInstallNotes: false,
        installBanner:
          "O conteudo acima sera gravado como SKILL.md em ~/.claude/skills/<slug>/. O usuario precisara reiniciar o Claude Code apos instalar.",
      };
    case "MCP Server":
      return {
        docLabel: "Documentação",
        docHint: "Explique o que o servidor MCP faz e como configurá-lo.",
        docPlaceholder: `# O que faz\n\nDescrição do servidor MCP.\n\n# Ferramentas disponíveis\n\n- ferramenta_1: descrição\n- ferramenta_2: descrição\n\n# Pré-requisitos\n\n- Node.js 18+`,
        showInstallNotes: true,
        installNotesLabel: "Configuração MCP (JSON)",
        installNotesHint:
          "Cole o bloco JSON que sera adicionado ao claude_desktop_config.json do usuario.",
        installNotesPlaceholder: `{\n  "mcpServers": {\n    "nome-do-servidor": {\n      "command": "npx",\n      "args": ["-y", "nome-do-pacote"]\n    }\n  }\n}`,
        installBanner:
          "O instalador exibira a configuracao JSON para o usuario adicionar ao claude_desktop_config.json.",
      };
    case "Prompt":
      return {
        docLabel: "Conteúdo do Prompt",
        docHint:
          "O conteudo completo do prompt. Sera salvo como README.md na maquina do usuario.",
        docPlaceholder: `# Título do Prompt\n\nDescrição do que ele faz.\n\n## Prompt\n\nConteúdo do prompt aqui.\n\n## Exemplos de uso\n\n...`,
        showInstallNotes: false,
        installBanner:
          "O conteudo acima sera salvo como README.md em ~/lg-assets/<slug>/.",
      };
    case "Agent":
      return {
        docLabel: "Documentação do Agent",
        docHint: "Descreva o que o agent faz, como configurá-lo e como usá-lo.",
        docPlaceholder: `# Nome do Agent\n\nDescrição do que ele faz.\n\n## Capacidades\n\n- Capacidade 1\n- Capacidade 2\n\n## Como usar\n\n1. Passo 1\n2. Passo 2\n\n## Configuração\n\n...`,
        showInstallNotes: true,
        installNotesLabel: "Instruções de instalação",
        installNotesHint:
          "Passo a passo que sera exibido no terminal do usuario durante a instalacao.",
        installNotesPlaceholder:
          "1. Instale a dependência X\n2. Configure o arquivo Y\n3. Execute o agent",
        installBanner:
          "O instalador exibira essas instrucoes no terminal do usuario.",
      };
    case "Plugin":
      return {
        docLabel: "Documentação do Plugin",
        docHint: "Descreva o que o plugin faz, como instalá-lo e como usá-lo.",
        docPlaceholder: `# Nome do Plugin\n\nDescrição do que ele faz.\n\n## Funcionalidades\n\n- Funcionalidade 1\n- Funcionalidade 2\n\n## Como usar\n\n...`,
        showInstallNotes: true,
        installNotesLabel: "Instruções de instalação",
        installNotesHint:
          "Passo a passo que sera exibido no terminal do usuario durante a instalacao.",
        installNotesPlaceholder:
          "1. Instale o plugin via npm/pip\n2. Configure no settings\n3. Reinicie a aplicação",
        installBanner:
          "O instalador exibira essas instrucoes no terminal do usuario.",
      };
    default:
      return {
        docLabel: "Descrição detalhada",
        docHint: "Explique o que o asset faz, para quem é e como usar.",
        docPlaceholder: `# O que faz\n\n# Quando usar\n\n# Como usar\n\n- passo 1\n- passo 2`,
        showInstallNotes: true,
        installNotesLabel: "Instruções de instalação",
        installNotesHint:
          "Passo a passo que sera exibido no terminal do usuario durante a instalacao. Deixe em branco se nao houver instrucoes especificas.",
        installNotesPlaceholder:
          "1. Instale a dependência X\n2. Configure o arquivo Y\n3. Reinicie o serviço Z",
        installBanner:
          "O instalador exibira essas instrucoes no terminal do usuario.",
      };
  }
}

export function AssetCreateForm() {
  const router = useRouter();
  const { isReady, token, user } = useSession();
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [installNotes, setInstallNotes] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = Boolean(user);
  const config = getCategoryConfig(category);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Você precisa estar autenticado para criar assets.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const createdAsset = await createAsset(
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

      router.push(`/assets/${createdAsset.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível criar o asset.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <p className="muted-text">Carregando sessão...</p>;
  }

  if (!user) {
    return (
      <section className="empty-state">
        <div className="empty-icon" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1>Autenticação necessária</h1>
        <p>Entre para publicar um asset no catálogo.</p>
        <div className="inline-actions">
          <Link className="primary-button" href="/login">Entrar</Link>
          <Link className="secondary-button" href="/register">Criar conta</Link>
        </div>
      </section>
    );
  }

  if (!canCreate) {
    return null;
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="section-heading">
        <p className="eyebrow">Catálogo</p>
        <h1>Publicar novo asset</h1>
        <p className="muted-text">
          Preencha as informações abaixo para que outros colaboradores possam encontrar e instalar seu asset.
        </p>
      </div>

      {/* SEÇÃO 1 — Identidade */}
      <section className="form-section">
        <header className="form-section-header">
          <span className="form-section-title">
            <span className="form-section-step">1</span> Identidade
          </span>
          <p className="field-hint">Como o asset aparece no catálogo.</p>
        </header>

        <label className="field">
          <span>Nome</span>
          <input
            className="text-input"
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Assistente de onboarding"
            required
            type="text"
            value={name}
            maxLength={200}
          />
        </label>

        <div className="form-grid-2">
          <label className="field">
            <span>Categoria</span>
            <select
              className="text-input"
              onChange={(e) => setCategory(e.target.value)}
              required
              value={category}
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Versão</span>
            <input
              className="text-input"
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              type="text"
              value={version}
              maxLength={32}
              required
            />
          </label>
        </div>

        <label className="field">
          <span>Descrição curta</span>
          <textarea
            className="text-area"
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Resumo de uma linha que aparece nos cards do catálogo"
            required
            rows={2}
            value={shortDescription}
            maxLength={500}
          />
        </label>
      </section>

      {/* SEÇÃO 2 — Conteúdo (dinâmico por categoria) */}
      <section className="form-section">
        <header className="form-section-header">
          <span className="form-section-title">
            <span className="form-section-step">2</span> {config.docLabel}
          </span>
          <p className="field-hint">{config.docHint}</p>
        </header>

        <div className="field">
          <label htmlFor="asset-detailed">{config.docLabel}</label>
          <MarkdownEditor
            id="asset-detailed"
            value={detailedDescription}
            onChange={setDetailedDescription}
            placeholder={config.docPlaceholder}
            rows={category === "Skill" ? 20 : 14}
          />
        </div>

        {config.showInstallNotes && config.installNotesLabel && (
          <div className="field">
            <label htmlFor="asset-install-notes">{config.installNotesLabel}</label>
            {config.installNotesHint && (
              <p className="field-hint" style={{ marginTop: 0, marginBottom: 8 }}>{config.installNotesHint}</p>
            )}
            {category === "MCP Server" ? (
              <textarea
                id="asset-install-notes"
                className="text-area code-textarea"
                value={installNotes}
                onChange={(e) => setInstallNotes(e.target.value)}
                placeholder={config.installNotesPlaceholder}
                rows={8}
                spellCheck={false}
              />
            ) : (
              <MarkdownEditor
                id="asset-install-notes"
                value={installNotes}
                onChange={setInstallNotes}
                placeholder={config.installNotesPlaceholder ?? ""}
                rows={6}
              />
            )}
          </div>
        )}
      </section>

      {/* SEÇÃO 3 — Resumo da instalação */}
      <section className="form-section">
        <header className="form-section-header">
          <span className="form-section-title">
            <span className="form-section-step">3</span> Instalação
          </span>
          <p className="field-hint">
            O hub gera o instalador automaticamente. O usuario final clica em <strong>Instalar</strong> e o script roda direto no terminal dele.
          </p>
        </header>

        <div className="info-banner">
          {config.installBanner}
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <div className="spread">
        <Link className="ghost-button" href="/assets">
          ← Cancelar
        </Link>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Publicando..." : "Publicar asset"}
        </button>
      </div>
    </form>
  );
}
