import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="app-shell">
      <div className="auth-layout">
        <aside className="auth-aside">
          <p className="eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>Cadastro</p>
          <h2>Crie sua conta</h2>
          <p>
            Use seu e-mail corporativo para se juntar ao hub. Depois da confirmação você
            poderá explorar, instalar e publicar assets.
          </p>
          <ul className="feature-list">
            <li>Apenas domínios corporativos autorizados</li>
            <li>Confirmação por e-mail</li>
            <li>Publique como Contributor</li>
            <li>Favoritos e histórico pessoal</li>
          </ul>
        </aside>
        <div className="auth-form-wrap">
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}
