import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="app-shell">
      <div className="auth-layout">
        <aside className="auth-aside">
          <p className="eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>AI Assets Hub</p>
          <h2>Bem-vindo de volta</h2>
          <p>
            Entre para explorar agentes, prompts, skills e workflows da sua organização,
            tudo em um único catálogo.
          </p>
          <ul className="feature-list">
            <li>Busca rápida em todo o catálogo</li>
            <li>Filtros por categoria e popularidade</li>
            <li>Instalação assistida em poucos cliques</li>
            <li>Histórico de versões e autoria</li>
          </ul>
        </aside>
        <div className="auth-form-wrap">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
