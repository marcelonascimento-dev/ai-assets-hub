"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/session-provider";

const NAV_ITEMS = [
  { href: "/assets", label: "Catálogo" },
  { href: "/assets/new", label: "Publicar" },
];

function getInitials(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppHeader() {
  const pathname = usePathname();
  const { user, signOut, isReady } = useSession();

  return (
    <header className="app-header">
      <div className="app-shell header-content">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>AI</span>
          <span>Assets Hub</span>
        </Link>

        <nav className="nav" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                className={isActive ? "nav-link nav-link-active" : "nav-link"}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="session-box">
          {!isReady ? (
            <span className="skeleton-line w-60" style={{ width: 120 }} aria-label="Carregando sessão" />
          ) : user ? (
            <>
              <div className="session-meta">
                <span className="session-text">{user.email}</span>
                <span className="session-role">{user.role}</span>
              </div>
              <span className="avatar" aria-hidden>{getInitials(user.email)}</span>
              <button className="ghost-button" onClick={signOut} type="button" title="Sair">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" href="/login">
                Entrar
              </Link>
              <Link className="primary-button" href="/register">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
