// No top-level import/export here on purpose: keeping this file a global
// script (rather than a module) is what lets `declare module` below create
// the ambient "next-auth/react" module from scratch. As soon as this file
// has a top-level import/export, TypeScript treats `declare module` as an
// *augmentation* of an already-resolvable module instead — and since
// `next-auth` isn't an installed package, that augmentation silently fails
// to attach, breaking every `next-auth/react` import in the app.
declare module "next-auth/react" {
  /** Sesión de usuario autenticado, tal y como la expone `next-auth/react`. */
  export interface Session {
    user?: {
      id?: string;
      username?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      avatarUrl?: string | null;
      permissions?: string[];
      firstName?: string | null;
      lastName?: string | null;
      corporateEmail?: string | null;
      isEmailVerified?: boolean;
      preferences?: import("@/context/PreferencesProvider").UserPreferences;
      accessTokenExpires?: number;
      backendTokens?: { accessToken: string; refreshToken: string };
    };
    expires?: string;
  }

  export function useSession(): { data: Session | null; status: "loading" | "authenticated" | "unauthenticated" };
  export function signOut(options?: { callbackUrl?: string }): Promise<void>;
  export function SessionProvider(props: { children?: React.ReactNode; session?: Session | null }): React.ReactNode;
}
