"use client";

import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/api";
import type { OperationResponse } from "@/types/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<OperationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ email });
      setResult(response);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Nao foi possivel solicitar a recuperacao.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="eyebrow">Recuperacao</p>
        <h1>Esqueci minha senha</h1>
        <p className="muted-text">
          Informe seu e-mail corporativo para receber o link de redefinicao.
        </p>
      </div>

      <label className="field">
        <span>E-mail</span>
        <input
          autoComplete="email"
          className="text-input"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@lg.com.br"
          required
          type="email"
          value={email}
        />
      </label>

      {error ? <p className="error-banner">{error}</p> : null}

      {result ? (
        <div className="info-banner">
          <p>
            {result.actionUrl
              ? "Ambiente local: use o link abaixo para redefinir sua senha. O envio real de e-mail ainda nao esta configurado."
              : result.message}
          </p>
          {result.actionUrl ? (
            <a className="text-link" href={result.actionUrl}>
              Abrir link de redefinicao
            </a>
          ) : null}
        </div>
      ) : null}

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enviando..." : "Enviar link"}
      </button>

      <a className="text-link" href="/login">
        Voltar para login
      </a>
    </form>
  );
}
