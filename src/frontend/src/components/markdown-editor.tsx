"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
};

type Tool = {
  label: string;
  title: string;
  apply: (text: string, selStart: number, selEnd: number) => { text: string; cursor: number };
};

function wrap(symbolStart: string, symbolEnd = symbolStart, fallback = "texto"): Tool["apply"] {
  return (text, start, end) => {
    const selected = text.slice(start, end) || fallback;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const next = `${before}${symbolStart}${selected}${symbolEnd}${after}`;
    return { text: next, cursor: before.length + symbolStart.length + selected.length + symbolEnd.length };
  };
}

function linePrefix(prefix: string, fallback = "item"): Tool["apply"] {
  return (text, start, end) => {
    const before = text.slice(0, start);
    const selected = text.slice(start, end) || fallback;
    const after = text.slice(end);
    const transformed = selected
      .split("\n")
      .map((line) => (line.length === 0 ? line : `${prefix}${line}`))
      .join("\n");
    const next = `${before}${transformed}${after}`;
    return { text: next, cursor: before.length + transformed.length };
  };
}

function makeLink(): Tool["apply"] {
  return (text, start, end) => {
    const selected = text.slice(start, end) || "texto do link";
    const before = text.slice(0, start);
    const after = text.slice(end);
    const insert = `[${selected}](https://)`;
    return { text: `${before}${insert}${after}`, cursor: before.length + insert.length - 1 };
  };
}

const TOOLS: Tool[] = [
  { label: "B", title: "Negrito (Ctrl+B)", apply: wrap("**") },
  { label: "I", title: "Itálico (Ctrl+I)", apply: wrap("_") },
  { label: "S", title: "Tachado", apply: wrap("~~") },
];

const HEADINGS: Tool[] = [
  { label: "H1", title: "Título 1", apply: linePrefix("# ", "Título") },
  { label: "H2", title: "Título 2", apply: linePrefix("## ", "Subtítulo") },
  { label: "H3", title: "Título 3", apply: linePrefix("### ", "Subtítulo") },
];

const LISTS: Tool[] = [
  { label: "•", title: "Lista", apply: linePrefix("- ") },
  { label: "1.", title: "Lista numerada", apply: linePrefix("1. ") },
  { label: "☐", title: "Checklist", apply: linePrefix("- [ ] ", "tarefa") },
];

const EXTRAS: Tool[] = [
  { label: "</>", title: "Código", apply: wrap("`") },
  { label: "{ }", title: "Bloco de código", apply: wrap("\n```\n", "\n```\n", "código") },
  { label: "❝", title: "Citação", apply: linePrefix("> ", "citação") },
  { label: "🔗", title: "Link", apply: makeLink() },
];

export function MarkdownEditor({ value, onChange, placeholder, rows = 12, id }: Props) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const ref = useRef<HTMLTextAreaElement>(null);

  function runTool(tool: Tool) {
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const result = tool.apply(value, start, end);
    onChange(result.text);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.cursor, result.cursor);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      runTool(TOOLS[0]);
    } else if (key === "i") {
      event.preventDefault();
      runTool(TOOLS[1]);
    } else if (key === "k") {
      event.preventDefault();
      runTool(EXTRAS[3]);
    }
  }

  const renderToolButton = (tool: Tool) => (
    <button
      key={tool.label}
      type="button"
      className="md-tool"
      title={tool.title}
      onClick={() => runTool(tool)}
      tabIndex={-1}
    >
      {tool.label}
    </button>
  );

  return (
    <div className="md-editor">
      <div className="md-toolbar" role="toolbar" aria-label="Formatação">
        {TOOLS.map(renderToolButton)}
        <span className="md-tool-divider" />
        {HEADINGS.map(renderToolButton)}
        <span className="md-tool-divider" />
        {LISTS.map(renderToolButton)}
        <span className="md-tool-divider" />
        {EXTRAS.map(renderToolButton)}

        <div className="md-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "edit"}
            className={mode === "edit" ? "md-tab md-tab-active" : "md-tab"}
            onClick={() => setMode("edit")}
          >
            Editar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            className={mode === "preview" ? "md-tab md-tab-active" : "md-tab"}
            onClick={() => setMode("preview")}
          >
            Visualizar
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      ) : (
        <div className="md-preview">
          {value.trim() ? (
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="md-preview-empty">Nada para visualizar ainda.</p>
          )}
        </div>
      )}

      <div className="md-editor-footer">
        <span>Suporta Markdown · negrito, listas, código, links, tabelas</span>
        <span>{value.length} caracteres</span>
      </div>
    </div>
  );
}
