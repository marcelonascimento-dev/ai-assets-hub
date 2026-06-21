import Link from "next/link";

const CATEGORIES = [
  { label: "Agentes", icon: "🤖" },
  { label: "MCP Servers", icon: "🔌" },
  { label: "Prompts", icon: "💬" },
  { label: "Skills", icon: "✨" },
  { label: "Workflows", icon: "🔄" },
  { label: "Integrações", icon: "🧩" },
  { label: "Automações", icon: "⚙️" },
  { label: "Templates", icon: "📄" },
];

export default function HomePage() {
  return (
    <main className="app-shell page-section">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI Assets Hub</p>
          <h1>Descubra, compartilhe e instale assets de IA em poucos cliques.</h1>
          <p className="hero-text">
            Centralize agentes, prompts, skills, workflows e ferramentas da sua organização
            em um só lugar. Reduza retrabalho e acelere a adoção de IA pelas equipes.
          </p>
          <div className="inline-actions">
            <Link className="primary-button" href="/assets">
              Explorar catálogo →
            </Link>
            <Link className="secondary-button" href="/register">
              Criar conta
            </Link>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Resumo de funcionalidades">
          <p className="eyebrow">Como funciona</p>
          <h2>Fluxo principal</h2>
          <ol className="feature-list">
            <li>Cadastre-se com e-mail corporativo.</li>
            <li>Busque assets por nome, descrição ou categoria.</li>
            <li>Abra o detalhe, leia a documentação e instale.</li>
            <li>Publique seus próprios assets como Contributor.</li>
          </ol>
        </aside>
      </section>

      <section className="stats-row" aria-label="Indicadores da plataforma">
        <div className="stat">
          <span className="stat-label">Categorias</span>
          <span className="stat-value">12+</span>
        </div>
        <div className="stat">
          <span className="stat-label">Busca</span>
          <span className="stat-value">&lt; 2s</span>
        </div>
        <div className="stat">
          <span className="stat-label">Níveis de instalação</span>
          <span className="stat-value">3</span>
        </div>
        <div className="stat">
          <span className="stat-label">Acesso</span>
          <span className="stat-value">Corporativo</span>
        </div>
      </section>

      <section className="card">
        <div className="spread">
          <div className="stack">
            <p className="eyebrow">Catálogo</p>
            <h2>Categorias disponíveis</h2>
            <p className="muted-text">Filtre pelo tipo de ativo que você está procurando.</p>
          </div>
          <Link className="text-link" href="/assets">
            Ver todos →
          </Link>
        </div>
        <div className="chip-row">
          {CATEGORIES.map((category) => (
            <Link key={category.label} href="/assets" className="chip">
              <span aria-hidden>{category.icon}</span>
              {category.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
