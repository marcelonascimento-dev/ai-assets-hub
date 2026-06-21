"use client";

import { FormEvent, useState } from "react";
import { resetPassword } from "@/lib/api";

export function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await resetPassword({ token, newPassword });
      setMessage(response.message);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Nao foi possivel redefinir a senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <section className="card form-card">
        <div className="section-heading">
          <p className="eyebrow">Link invalido</p>
          <h1>Token ausente</h1>
          <p className="muted-text">
            Solicite um novo link de recuperacao para redefinir sua senha.
          </p>
        </div>
        <a className="primary-button" href="/forgot-password">
          Solicitar novo link
        </a>
      </section>
    );
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="eyebrow">Nova senha</p>
        <h1>Redefina sua senha</h1>
        <p className="muted-text">Escolha uma nova senha com pelo menos 8 caracteres.</p>
      </div>

      <label className="field">
        <span>Nova senha</span>
        <input
          autoComplete="new-password"
          className="text-input"
          minLength={8}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Digite a nova senha"
          required
          type="password"
          value={newPassword}
        />
      </label>

      {error ? <p className="error-banner">{error}</p> : null}
      {message ? <p className="success-banner">{message}</p> : null}

      <button className="primary-button" disabled={isSubmitting || Boolean(message)} type="submit">
        {isSubmitting ? "Salvando..." : "Redefinir senha"}
      </button>

      {message ? (
        <a className="text-link" href="/login">
          Ir para login
        </a>
      ) : null}
    </form>
  );
}
