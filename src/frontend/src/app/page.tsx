"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { listAssets } from "@/lib/api";
import type { Asset } from "@/types/api";

const CATEGORIES = ["Agent", "MCP Server", "Prompt", "Skill", "Plugin"];

function getCategoryIcon(category: string) {
  switch (category) {
    case "Agent": return "🤖";
    case "MCP Server": return "🔌";
    case "Prompt": return "💬";
    case "Skill": return "✨";
    case "Plugin": return "🧩";
    default: return "📦";
  }
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}m`;
}

export default function HomePage() {
  const { token } = useSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    listAssets(undefined, token ?? undefined)
      .then(setAssets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = activeCategory
    ? assets.filter((a) => a.category === activeCategory)
    : assets;

  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: assets.filter((a) => a.category === cat).length,
  }));

  return (
    <main className="app-shell page-section">
      <section className="home-header">
        <div>
          <h1 className="home-title">AI Assets Hub</h1>
          <p className="home-subtitle">
            Catálogo corporativo de agentes, prompts, skills e ferramentas de IA
          </p>
        </div>
        <div className="inline-actions">
          {token ? (
            <Link className="primary-button" href="/assets/new">Publicar asset</Link>
          ) : (
            <>
              <Link className="primary-button" href="/login">Entrar</Link>
              <Link className="secondary-button" href="/register">Criar conta</Link>
            </>
          )}
        </div>
      </section>

      <section className="home-stats">
        {categoryCounts.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className={`home-stat-card ${activeCategory === cat.name ? "home-stat-active" : ""}`}
            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
          >
            <span className="home-stat-icon">{getCategoryIcon(cat.name)}</span>
            <span className="home-stat-count">{cat.count}</span>
            <span className="home-stat-label">{cat.name}s</span>
          </button>
        ))}
      </section>

      <section className="home-section">
        <div className="spread">
          <h2>
            {activeCategory
              ? `${activeCategory}s`
              : "Publicados recentemente"}
          </h2>
          <Link className="text-link" href="/assets">Ver catálogo completo →</Link>
        </div>

        {loading ? (
          <div className="home-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <span className="skeleton-line w-40 sm" />
                <span className="skeleton-line lg w-80" />
                <span className="skeleton-line w-60" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <p className="muted-text">
              {activeCategory
                ? `Nenhum ${activeCategory} publicado ainda.`
                : "Nenhum asset publicado ainda."}
            </p>
            <Link className="primary-button" href="/assets/new" style={{ marginTop: 16 }}>
              Publicar o primeiro
            </Link>
          </div>
        ) : (
          <div className="home-grid">
            {filtered.slice(0, 12).map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`} className="home-asset-card">
                <div className="home-asset-top">
                  <span className="category-pill">{asset.category}</span>
                  <span className="home-asset-time">{timeAgo(asset.updatedAt ?? asset.createdAt ?? "")}</span>
                </div>
                <h3 className="home-asset-name">{asset.name}</h3>
                <p className="home-asset-desc">{asset.shortDescription}</p>
                <div className="home-asset-footer">
                  <span className="home-asset-author">{asset.authorName}</span>
                  <span className="home-asset-version">v{asset.version}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
