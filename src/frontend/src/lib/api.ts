import type {
  Asset,
  AssetCreateInput,
  AuthResponse,
  ForgotPasswordInput,
  LoginInput,
  OperationResponse,
  RegisterInput,
  RegistrationResponse,
  ResetPasswordInput,
  SessionUser,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
};

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null;
}

function readString(record: RawRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return "";
}

function mapUser(payload: unknown): SessionUser {
  const record = isRecord(payload) ? payload : {};
  const roles = Array.isArray(record.roles)
    ? record.roles.filter((value): value is SessionUser["role"] => typeof value === "string")
    : [];
  const preferredRole = roles.includes("Admin")
    ? "Admin"
    : roles.includes("Contributor")
      ? "Contributor"
      : "User";

  return {
    id: readString(record, "id", "userId"),
    fullName: readString(record, "fullName"),
    email: readString(record, "email"),
    role: preferredRole,
    roles,
  };
}

function mapAsset(payload: unknown): Asset {
  const record = isRecord(payload) ? payload : {};
  const author = isRecord(record.author) ? record.author : {};

  const rawTags = record.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];

  const installTypeRaw = readString(record, "install_type", "installType");
  const installType: Asset["installType"] =
    installTypeRaw === "Automatic" || installTypeRaw === "Assisted"
      ? installTypeRaw
      : "Manual";

  return {
    id: readString(record, "id"),
    name: readString(record, "name"),
    shortDescription: readString(record, "short_description", "shortDescription"),
    detailedDescription: readString(
      record,
      "detailed_description",
      "detailedDescription",
    ),
    category: readString(record, "category"),
    tags,
    teamName: readString(record, "team_name", "teamName") || null,
    version: readString(record, "version") || "1.0.0",
    installType,
    installNotes: readString(record, "install_notes", "installNotes") || null,
    authorUserId: readString(record, "author_user_id", "authorUserId"),
    authorName:
      readString(record, "author_full_name", "authorFullName") ||
      readString(author, "fullName", "name"),
    createdAt: readString(record, "created_at", "createdAt"),
    updatedAt: readString(record, "updated_at", "updatedAt"),
  };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    const parsed = parseErrorMessage(errorText);
    if (response.status === 401) {
      throw new Error(
        parsed || "Sua sessão expirou. Saia e entre novamente para continuar.",
      );
    }
    throw new Error(
      parsed || `Não foi possível concluir a requisição (HTTP ${response.status}).`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function parseErrorMessage(rawValue: string) {
  if (!rawValue) {
    return "";
  }

  try {
    const payload = JSON.parse(rawValue) as unknown;
    if (isRecord(payload)) {
      const errorsField = payload.errors;
      if (isRecord(errorsField)) {
        const flat: string[] = [];
        for (const key of Object.keys(errorsField)) {
          const value = errorsField[key];
          if (Array.isArray(value)) {
            for (const item of value) {
              if (typeof item === "string" && item.length > 0) flat.push(item);
            }
          } else if (typeof value === "string" && value.length > 0) {
            flat.push(value);
          }
        }
        if (flat.length > 0) return flat.join(" · ");
      }

      const message = readString(payload, "message", "title", "detail");
      if (message) {
        return message;
      }
    }
  } catch {
    return rawValue;
  }

  return rawValue;
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
};

export async function registerUser(input: RegisterInput): Promise<RegistrationResponse> {
  const payload = await request<RawRecord>("/api/auth/register", {
    method: "POST",
    body: {
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      confirmPassword: input.confirmPassword,
    },
  });

  return {
    email: readString(payload, "email"),
    message: readString(payload, "message") || "Conta criada. Verifique seu e-mail.",
    emailVerificationUrl: readString(payload, "emailVerificationUrl") || undefined,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const payload = await request<RawRecord>("/api/auth/login", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
    },
  });

  return {
    token: readString(payload, "token", "accessToken"),
    user: mapUser(payload),
  };
}

export async function confirmEmail(token: string): Promise<OperationResponse> {
  const params = new URLSearchParams({ token });
  const payload = await request<RawRecord>(`/api/auth/confirm-email?${params.toString()}`, {
    method: "POST",
  });

  return {
    message: readString(payload, "message"),
  };
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<OperationResponse> {
  const payload = await request<RawRecord>("/api/auth/forgot-password", {
    method: "POST",
    body: {
      email: input.email,
    },
  });

  return {
    message: readString(payload, "message"),
    actionUrl: readString(payload, "actionUrl") || undefined,
  };
}

export async function resetPassword(input: ResetPasswordInput): Promise<OperationResponse> {
  const payload = await request<RawRecord>("/api/auth/reset-password", {
    method: "POST",
    body: {
      token: input.token,
      newPassword: input.newPassword,
    },
  });

  return {
    message: readString(payload, "message"),
  };
}

export async function listAssets(search?: string, token?: string): Promise<Asset[]> {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set("q", search.trim());
  }

  const queryString = params.size > 0 ? `?${params.toString()}` : "";
  const payload = await request<unknown>(`/api/assets${queryString}`, {
    token,
  });

  if (Array.isArray(payload)) {
    return payload.map(mapAsset);
  }

  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items.map(mapAsset);
  }

  return [];
}

export async function getAssetById(assetId: string, token?: string): Promise<Asset> {
  const payload = await request<unknown>(`/api/assets/${assetId}`, {
    token,
  });
  return mapAsset(payload);
}

export async function createAsset(
  input: AssetCreateInput,
  token: string,
): Promise<Asset> {
  const payload = await request<unknown>("/api/assets", {
    method: "POST",
    token,
    body: {
      name: input.name,
      shortDescription: input.shortDescription,
      detailedDescription: input.detailedDescription,
      category: input.category,
      tags: input.tags,
      teamName: input.teamName || null,
      version: input.version,
      installType: input.installType,
      installNotes: input.installNotes || null,
    },
  });

  return mapAsset(payload);
}

export async function updateAsset(
  assetId: string,
  input: AssetCreateInput,
  token: string,
): Promise<Asset> {
  const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: input.name,
      shortDescription: input.shortDescription,
      detailedDescription: input.detailedDescription,
      category: input.category,
      version: input.version,
      installType: input.installType,
      installNotes: input.installNotes || null,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const message = parseErrorMessage(text) || `Erro ${response.status}`;
    throw new Error(message);
  }

  return mapAsset(await response.json());
}

export async function deleteAsset(
  assetId: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    const message = parseErrorMessage(text) || `Erro ${response.status}`;
    throw new Error(message);
  }
}
