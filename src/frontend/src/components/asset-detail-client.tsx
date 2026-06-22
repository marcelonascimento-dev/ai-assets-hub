"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "@/components/session-provider";
import { InstallModal } from "@/components/install-modal";
import { getAssetById, deleteAsset } from "@/lib/api";
import { buildPublicAppUrl } from "@/lib/public-url";
import type { Asset } from "@/types/api";

function getInitials(value?: string) {
  if (!value) return "?";
  const parts = value.trim().split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AssetDetailClient({ assetId }: { assetId: string }) {
  const router = useRouter();
  const { isReady, token, user } = useSession();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [installOpen, setInstallOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const sessionToken = token ?? undefined;
    let isActive = true;

    async function loadAsset() {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAssetById(assetId, sessionToken);
        if (isActive) setAsset(response);
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar o asset.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadAsset();
    return () => {
      isActive = false;
    };
  }, [assetId, token]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(buildPublicAppUrl(`/assets/${assetId}`));
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // ignore
    }
  }

  async function handleDelete() {
    if (!token) return;
    setIsDeleting(true);
    try {
      await deleteAsset(assetId, token);
      router.push("/assets");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir.");
      setDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isReady || isLoading) {
    return (
      <div className="page-section">
        <div className="skeleton-card">
          <span className="skeleton-line w-40 sm" />
          <span className="skeleton-line lg w-60" />
          <span className="skeleton-line w-80" />
          <span className="skeleton-line w-60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-section">
        <p className="error-banner">{error}</p>
        <Link className="text-link" href="/assets">← Voltar para a listagem</Link>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="page-section">
        <p className="error-banner">Asset não encontrado.</p>
        <Link className="text-link" href="/assets">← Voltar para a listagem</Link>
      </div>
    );
  }

  const isOwner = user != null && asset.authorUserId === user.id;
  const isAdmin = user != null && user.roles.includes("Admin");
  const canManage = isOwner || isAdmin;

  return (
    <div className="page-section">
      <div className="detail-actions">
        <Link className="text-link" href="/assets">← Voltar para o catálogo</Link>
        {canManage && (
          <div className="inline-actions">
            <Link className="ghost-button" href={`/assets/${assetId}/edit`}>
              Editar
            </Link>
            <button
              className="ghost-button danger-ghost"
              type="button"
              onClick={() => setDeleteConfirm(true)}
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      <section className="detail-hero">
        <div className="detail-copy">
          <div className="row">
            <span className="category-pill">{asset.category || "Sem categoria"}</span>
            <span className="muted-text" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              v{asset.version}
            </span>
          </div>
          <h1>{asset.name}</h1>
          <p>{asset.shortDescription}</p>

          <div className="inline-actions" style={{ marginTop: 8 }}>
            <button
              className="primary-button install-cta"
              type="button"
              onClick={() => setInstallOpen(true)}
            >
              Instalar
            </button>
            <button className="secondary-button" type="button" onClick={handleCopyLink}>
              {copyState === "copied" ? "Link copiado" : "Copiar link"}
            </button>
          </div>
        </div>

        <dl className="detail-meta">
          <div>
            <dt>Autor</dt>
            <dd>
              <span className="author-chip">
                <span className="avatar" aria-hidden>
                  {getInitials(asset.authorName || asset.authorUserId)}
                </span>
                {asset.authorName || asset.authorUserId || "Não informado"}
              </span>
            </dd>
          </div>
          <div>
            <dt>Instalação</dt>
            <dd>{installLabel(asset.installType)}</dd>
          </div>
          <div>
            <dt>Publicado</dt>
            <dd>{formatDate(asset.createdAt)}</dd>
          </div>
          <div>
            <dt>Última atualização</dt>
            <dd>{formatDate(asset.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <div className="stack">
          <p className="eyebrow">Documentação</p>
          <h2>Descrição detalhada</h2>
        </div>
        {asset.detailedDescription ? (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {asset.detailedDescription}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="muted-text">Sem descrição detalhada.</p>
        )}
      </section>

      {installOpen ? (
        <InstallModal
          assetId={asset.id}
          assetName={asset.name}
          category={asset.category}
          onClose={() => setInstallOpen(false)}
        />
      ) : null}

      {deleteConfirm ? (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(false)}>
          <div className="modal modal-sm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Excluir asset</h2>
              <p>Tem certeza que deseja excluir <strong>{asset.name}</strong>? Esta ação não pode ser desfeita.</p>
            </header>
            <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
              <button className="ghost-button" type="button" onClick={() => setDeleteConfirm(false)} disabled={isDeleting}>
                Cancelar
              </button>
              <button className="danger-button" type="button" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function installLabel(installType?: string) {
  switch (installType) {
    case "Automatic":
      return "Instalação automática";
    case "Assisted":
      return "Instalação assistida";
    case "Manual":
    default:
      return "Instalação manual";
  }
}

function formatDate(value?: string) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
