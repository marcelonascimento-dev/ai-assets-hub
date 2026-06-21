"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSession } from "@/components/session-provider";
import { loginUser, registerUser } from "@/lib/api";
import type { LoginInput, RegistrationResponse } from "@/types/api";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { setSession } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<RegistrationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError("As senhas informadas nao conferem.");
          return;
        }

        const response = await registerUser({
            fullName,
            email,
            password,
            confirmPassword,
          });
        setRegistration(response);
        return;
      }

      const session = await loginUser({
        email,
        password,
      } satisfies LoginInput);
      setSession(session);
      router.push("/assets");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Nao foi possivel concluir a autenticacao.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registration) {
    return (
      <section className="card form-card">
        <div className="section-heading">
          <p className="eyebrow">Verificacao pendente</p>
          <h1>Confirme seu e-mail</h1>
          <p className="muted-text">{registration.message}</p>
        </div>

        <div className="info-banner">
          {registration.emailVerificationUrl ? (
            <>
              Ambiente local: use o botao abaixo para verificar{" "}
              <strong>{registration.email}</strong>. O envio real de e-mail ainda nao esta
              configurado.
            </>
          ) : (
            <>
              Enviamos as instrucoes para <strong>{registration.email}</strong>. Depois de
              confirmar, volte para a tela de login.
            </>
          )}
        </div>

        {registration.emailVerificationUrl ? (
          <a className="primary-button" href={registration.emailVerificationUrl}>
            Verificar agora
          </a>
        ) : null}

        <a className="text-link" href="/login">
          Ir para login
        </a>
      </section>
    );
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="eyebrow">{isRegister ? "Cadastro" : "Login"}</p>
        <h1>{isRegister ? "Crie sua conta" : "Entre na plataforma"}</h1>
        <p className="muted-text">
          {isRegister
            ? "Use um e-mail corporativo. O acesso sera liberado depois da verificacao."
            : "Autentique-se para listar assets e criar novos itens quando tiver permissao."}
        </p>
      </div>

      {isRegister ? (
        <label className="field">
          <span>Nome completo</span>
          <input
            autoComplete="name"
            className="text-input"
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Seu nome"
            required
            type="text"
            value={fullName}
          />
        </label>
      ) : null}

      <label className="field">
        <span>E-mail</span>
        <input
          autoComplete="email"
          className="text-input"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        <span>Senha</span>
        <input
          autoComplete={isRegister ? "new-password" : "current-password"}
          className="text-input"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Digite sua senha"
          required
          type="password"
          value={password}
        />
      </label>

      {isRegister ? (
        <label className="field">
          <span>Confirmar senha</span>
          <input
            autoComplete="new-password"
            className="text-input"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Digite a senha novamente"
            required
            type="password"
            value={confirmPassword}
          />
        </label>
      ) : null}

      {error ? <p className="error-banner">{error}</p> : null}

      {!isRegister ? (
        <div className="spread">
          <a className="text-link" href="/forgot-password">
            Esqueci minha senha
          </a>
        </div>
      ) : (
        <p className="field-hint">
          Mínimo de 8 caracteres. Use um e-mail corporativo autorizado.
        </p>
      )}

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting
          ? "Enviando..."
          : isRegister
            ? "Criar conta"
            : "Entrar"}
      </button>

      <p className="muted-text" style={{ fontSize: "0.88rem", textAlign: "center" }}>
        {isRegister ? (
          <>
            Já tem conta? <a className="text-link" href="/login">Entrar</a>
          </>
        ) : (
          <>
            Novo por aqui? <a className="text-link" href="/register">Criar conta</a>
          </>
        )}
      </p>
    </form>
  );
}
