"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "@/components/session-provider";
import { listAssets } from "@/lib/api";
import type { Asset } from "@/types/api";

const CATEGORY_ICONS: Record<string, string> = {
  Prompt: "💬",
  Template: "📄",
  Assistant: "🤖",
  Agente: "🤖",
  Workflow: "🔄",
  Integration: "🧩",
  Integração: "🧩",
  Skill: "✨",
  Plugin: "🔌",
  "MCP Server": "🔌",
  Automação: "⚙️",
};

function getInitials(value?: string) {
  if (!value) return "?";
  const parts = value.trim().split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SkeletonGrid() {
  return (
    <section className="asset-grid" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span className="skeleton-line w-40 sm" />
          <span className="skeleton-line lg w-80" />
          <span className="skeleton-line w-60" />
          <span className="skeleton-line w-40 sm" />
        </div>
      ))}
    </section>
  );
}

export function AssetListClient() {
  const { isReady, token } = useSession();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      startTransition(() => setDebouncedQuery(query));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const sessionToken = token ?? undefined;
    let isActive = true;

    async function loadAssets() {
      try {
        setError("");
        const response = await listAssets(debouncedQuery, sessionToken);

        if (isActive) {
          setAssets(response);
          setHasLoaded(true);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os assets.",
          );
          setHasLoaded(true);
        }
      }
    }

    loadAssets();

    return () => {
      isActive = false;
    };
  }, [debouncedQuery, token]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of assets) {
      const key = asset.category || "Sem categoria";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [assets]);

  const visibleAssets = useMemo(() => {
    const filtered =
      activeCategory === "Todas"
        ? assets
        : assets.filter((a) => (a.category || "Sem categoria") === activeCategory);

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return sorted;
  }, [assets, activeCategory, sortBy]);

  if (!isReady) {
    return (
      <div className="page-section">
        <SkeletonGrid />
      </div>
    );
  }

  const isLoadingResults = !hasLoaded;

  return (
    <div className="page-section">
      <section className="toolbar">
        <div className="toolbar-meta">
          <p className="eyebrow">Catálogo</p>
          <h1>Assets do hub</h1>
          <p className="muted-text">
            {visibleAssets.length} {visibleAssets.length === 1 ? "asset encontrado" : "assets encontrados"}
            {activeCategory !== "Todas" ? ` em ${activeCategory}` : ""}.
          </p>
        </div>

        <div className="stack">
          <label className="search-box">
            <span className="sr-only">Buscar assets</span>
            <input
              className="text-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, descrição..."
              type="search"
              value={query}
            />
          </label>
          <label className="field">
            <span className="sr-only">Ordenar</span>
            <select
              className="text-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
            >
              <option value="recent">Mais recentes primeiro</option>
              <option value="name">Ordem alfabética</option>
            </select>
          </label>
        </div>
      </section>

      {categories.length > 0 ? (
        <div className="chip-row" role="tablist" aria-label="Filtrar por categoria">
          <button
            type="button"
            className={activeCategory === "Todas" ? "chip chip-active" : "chip"}
            onClick={() => setActiveCategory("Todas")}
          >
            Todas <span className="chip-count">{assets.length}</span>
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.label}
              className={activeCategory === category.label ? "chip chip-active" : "chip"}
              onClick={() => setActiveCategory(category.label)}
            >
              {CATEGORY_ICONS[category.label] ? <span aria-hidden>{CATEGORY_ICONS[category.label]}</span> : null}
              {category.label} <span className="chip-count">{category.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="error-banner">{error}</p> : null}

      {isLoadingResults ? (
        <SkeletonGrid />
      ) : visibleAssets.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2>Nenhum asset encontrado</h2>
          <p>Tente ajustar a busca, mudar a categoria ou publicar o primeiro asset.</p>
          <div className="inline-actions">
            {query ? (
              <button className="secondary-button" type="button" onClick={() => setQuery("")}>
                Limpar busca
              </button>
            ) : null}
            <Link className="primary-button" href="/assets/new">Publicar asset</Link>
          </div>
        </section>
      ) : (
        <section className="asset-grid">
          {visibleAssets.map((asset) => (
            <article className="asset-card" key={asset.id}>
              <Link className="asset-card-link" href={`/assets/${asset.id}`} aria-label={`Abrir ${asset.name}`} />
              <div className="asset-card-header">
                <span className="category-pill">
                  {CATEGORY_ICONS[asset.category || ""] ? (
                    <span aria-hidden>{CATEGORY_ICONS[asset.category || ""]}</span>
                  ) : null}
                  {asset.category || "Sem categoria"}
                </span>
                <span className="muted-text" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  v{asset.version}
                </span>
              </div>
              <div className="asset-card-body">
                <h2>{asset.name}</h2>
                <p>{asset.shortDescription}</p>
              </div>
              <div className="asset-card-footer">
                <span className="author-chip">
                  <span className="avatar" aria-hidden>
                    {getInitials(asset.authorName || asset.authorUserId)}
                  </span>
                  {asset.authorName || asset.authorUserId || "Anônimo"}
                </span>
                <span title={asset.updatedAt || asset.createdAt}>
                  {formatDate(asset.updatedAt || asset.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay < 1) return "hoje";
  if (diffDay === 1) return "ontem";
  if (diffDay < 7) return `há ${diffDay} dias`;
  if (diffDay < 30) return `há ${Math.floor(diffDay / 7)} sem.`;

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}
