"use client";

import { useEffect, useState } from "react";
import { confirmEmail } from "@/lib/api";

export function VerifyEmailClient({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    async function verify() {
      try {
        const response = await confirmEmail(token);
        if (isActive) {
          setMessage(response.message);
        }
      } catch (verificationError) {
        if (isActive) {
          setError(
            verificationError instanceof Error
              ? verificationError.message
              : "Nao foi possivel confirmar o e-mail.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    verify();

    return () => {
      isActive = false;
    };
  }, [token]);

  if (!token) {
    return (
      <section className="card form-card">
        <div className="section-heading">
          <p className="eyebrow">Link invalido</p>
          <h1>Token ausente</h1>
          <p className="muted-text">Solicite um novo cadastro para receber um link valido.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card form-card">
      <div className="section-heading">
        <p className="eyebrow">Verificacao</p>
        <h1>Confirmacao de e-mail</h1>
        <p className="muted-text">
          {isLoading ? "Estamos validando seu link." : "O processo de validacao terminou."}
        </p>
      </div>

      {isLoading ? <p className="info-banner">Verificando...</p> : null}
      {message ? <p className="success-banner">{message}</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {message ? (
        <a className="primary-button" href="/login">
          Entrar
        </a>
      ) : null}
    </section>
  );
}
