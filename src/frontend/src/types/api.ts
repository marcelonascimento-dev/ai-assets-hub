export type UserRole = "User" | "Contributor" | "Admin";

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
};

export type AuthResponse = {
  token: string;
  user: SessionUser;
};

export type RegistrationResponse = {
  email: string;
  message: string;
  emailVerificationUrl?: string;
};

export type OperationResponse = {
  message: string;
  actionUrl?: string;
};

export type AssetInstallType = "Automatic" | "Assisted" | "Manual";

export type Asset = {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription?: string;
  category: string;
  tags: string[];
  teamName?: string | null;
  version: string;
  installType: AssetInstallType;
  installNotes?: string | null;
  authorUserId?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AssetCreateInput = {
  name: string;
  shortDescription: string;
  detailedDescription: string;
  category: string;
  tags: string[];
  teamName?: string;
  version: string;
  installType: AssetInstallType;
  installNotes?: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};
