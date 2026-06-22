"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPublicAppUrl } from "@/lib/public-url";

type Shell = "powershell" | "bash";

type Props = {
  assetId: string;
  assetName: string;
  category: string;
  onClose: () => void;
};

function buildOneLiner(assetId: string, shell: Shell) {
  const scriptPath = `/api/assets/${assetId}/install.${shell === "powershell" ? "ps1" : "sh"}`;
  const scriptUrl = buildPublicAppUrl(scriptPath);

  if (shell === "powershell") {
    return `iwr -useb ${scriptUrl} | iex`;
  }
  return `curl -fsSL ${scriptUrl} | bash`;
}

function detectDefaultShell(): Shell {
  if (typeof window === "undefined") return "powershell";
  const platform = window.navigator.platform || "";
  const ua = window.navigator.userAgent || "";
  if (/win/i.test(platform) || /Windows/.test(ua)) return "powershell";
  return "bash";
}

export function InstallModal({ assetId, assetName, category, onClose }: Props) {
  const [shell, setShell] = useState<Shell>(() => detectDefaultShell());
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const command = useMemo(() => buildOneLiner(assetId, shell), [assetId, shell]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    // auto-copy on open / when shell changes
    void copyToClipboard(command, true);
  }, [command]);

  async function copyToClipboard(text: string, silent = false) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // clipboard API blocked (HTTP) — fallback to execCommand
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }
    if (ok) {
      setCopied(true);
      if (!silent) setToast("Comando copiado!");
      window.setTimeout(() => setCopied(false), 1600);
      if (!silent) window.setTimeout(() => setToast(null), 2200);
    } else if (!silent) {
      const codeEl = document.querySelector(".command-box code");
      if (codeEl) {
        const range = document.createRange();
        range.selectNodeContents(codeEl);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setToast("Texto selecionado — pressione Ctrl+C para copiar.");
      window.setTimeout(() => setToast(null), 3500);
    }
  }

  const terminalName = shell === "powershell" ? "PowerShell" : "Bash (macOS/Linux)";
  const targetHint = describeTarget(category);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar">×</button>

          <header className="modal-header">
            <p className="eyebrow">Instalar</p>
            <h2>{assetName}</h2>
            <p>{targetHint}</p>
          </header>

          <div className="spread">
            <div className="shell-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                className={shell === "powershell" ? "shell-tab shell-tab-active" : "shell-tab"}
                onClick={() => setShell("powershell")}
              >
                Windows · PowerShell
              </button>
              <button
                type="button"
                role="tab"
                className={shell === "bash" ? "shell-tab shell-tab-active" : "shell-tab"}
                onClick={() => setShell("bash")}
              >
                macOS / Linux · Bash
              </button>
            </div>
          </div>

          <div className="command-box">
            <button
              type="button"
              className={copied ? "command-copy command-copy-success" : "command-copy"}
              onClick={() => copyToClipboard(command)}
            >
              {copied ? "Copiado ✓" : "Copiar"}
            </button>
            <code>{command}</code>
          </div>

          <ol className="steps">
            <li>
              <span>1</span>
              <span>O comando já foi copiado para a área de transferência.</span>
            </li>
            <li>
              <span>2</span>
              <span>Abra o <strong>{terminalName}</strong> no seu computador.</span>
            </li>
            <li>
              <span>3</span>
              <span>Cole (<code>Ctrl</code>+<code>V</code> ou clique com botão direito) e pressione <code>Enter</code>.</span>
            </li>
            {category === "Skill" ? (
              <li>
                <span>4</span>
                <span>
                  <strong>Reinicie o Claude Code</strong> completamente para a skill aparecer.<br />
                  No Windows, fechar a janela <strong>não basta</strong> — o app fica rodando na bandeja (perto do relógio). Clique com o botão direito no ícone da bandeja e em <em>Sair</em> antes de abrir de novo.
                </span>
              </li>
            ) : null}
          </ol>

          <div className="info-banner">
            O script é gerado pelo hub no momento da instalação e roda só na sua máquina.
            Antes de executar, você pode inspecioná-lo abrindo a URL diretamente no navegador.
          </div>
        </div>
      </div>
      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}

function describeTarget(category: string): string {
  switch (category) {
    case "Skill":
      return "A skill será instalada em ~/.claude/skills/<slug>/SKILL.md no seu usuário.";
    case "MCP Server":
      return "O instalador mostrará as instruções para registrar o servidor MCP no claude_desktop_config.json.";
    case "Prompt":
      return "O conteúdo será salvo em ~/lg-assets/<slug>/README.md para você consultar localmente.";
    default:
      return "O instalador executará as instruções publicadas com este asset.";
  }
}
