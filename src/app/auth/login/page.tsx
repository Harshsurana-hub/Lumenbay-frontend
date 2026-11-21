"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, type OAuthProvider } from "@/context/AuthContext";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import { GitHubIcon, GoogleIcon } from "@/components/auth/ProviderIcons";

type FormErrors = { email?: string; password?: string; form?: string };

/**
 * Turns a Supabase auth error into something a person can act on.
 *
 * "Invalid login credentials" is returned for both a wrong password and an
 * unknown email — deliberately, so the form cannot be used to discover which
 * addresses have accounts. The message here preserves that.
 */
function signInErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (/invalid login credentials/i.test(message)) return "Invalid email or password";
  if (/email not confirmed/i.test(message)) {
    return "Check your inbox and confirm your email before signing in.";
  }
  if (/failed to fetch|network/i.test(message)) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

const PROVIDER_LABEL: Record<OAuthProvider, string> = { google: "Google", github: "GitHub" };

function providerErrorMessage(provider: OAuthProvider, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/not enabled|unsupported provider/i.test(message)) {
    return `${PROVIDER_LABEL[provider]} sign-in isn't switched on yet. Use your email and password for now.`;
  }
  return signInErrorMessage(error);
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithProvider } = useAuth();

  const prefillEmail = searchParams.get("email") ?? "";
  const justRegistered = searchParams.get("registered") === "1";
  const oauthFailed = searchParams.get("error") === "oauth";

  /**
   * Where to go after signing in.
   *
   * Set by the middleware when it turns an unauthenticated visitor away from a
   * protected page, so they land where they were heading rather than on a
   * generic dashboard.
   *
   * Only same-origin paths are honoured. Redirecting to whatever the query
   * string says is an open redirect — an attacker sends
   * `?returnUrl=https://evil.example` and the site itself delivers the user
   * there, wearing our domain in the address bar on the way.
   */
  const rawReturnUrl = searchParams.get("returnUrl") ?? "";
  const returnUrl =
    rawReturnUrl.startsWith("/") && !rawReturnUrl.startsWith("//")
      ? rawReturnUrl
      : "/home";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>(
    oauthFailed ? { form: "That sign-in didn't complete. Please try again." } : {},
  );
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);

  const handleProvider = async (provider: OAuthProvider) => {
    setErrors({});
    setPendingProvider(provider);
    try {
      await signInWithProvider(provider, returnUrl);
    } catch (err) {
      setErrors({ form: providerErrorMessage(provider, err) });
      setPendingProvider(null);
    }
  };
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: FormErrors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Must be at least 8 characters";
    return e;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      // Refresh so server components re-render against the new session cookie
      // before the dashboard reads it.
      router.refresh();
      router.push(returnUrl);
    } catch (err) {
      setErrors({ form: signInErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: keyof FormErrors, isTouched: boolean) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-ink bg-surface placeholder:text-ink-faint outline-none focus:ring-2 transition-all ${
      errors[field] && isTouched
        ? "border-red-300 focus:ring-red-100"
        : "border-line focus:border-accent"
    }`;

  return (
    <div className="relative min-h-screen flex">
      <AuthBrandPanel
        headline={
          <>
            Trade anything.
            <br />
            <span className="bg-linear-to-r from-[#FFD8CC] to-[#FFC4B0] bg-clip-text text-transparent">
              Risk nothing.
            </span>
          </>
        }
        body="Every transaction on Lumenbay is secured by Stellar smart contract escrow. Your payment only releases when you confirm delivery."
      />

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 lg:w-1/2 lg:flex-none lg:bg-surface lg:p-6">
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 hidden h-80 w-80 rounded-full bg-[#FF6B5B] opacity-15 blur-3xl lg:block" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 hidden h-72 w-72 rounded-full bg-[#FF9B7A] opacity-15 blur-3xl lg:block" />

        <Link href="/" className="relative mb-6 flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-lg">
            <Image src="/logo-icon.png" alt="" width={24} height={24} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">Lumenbay</span>
        </Link>

        <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-surface p-6 shadow-2xl shadow-orange-950/40 sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="mb-7">
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight mb-1">
              Welcome back
              <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-linear-to-br from-[#FF6B5B] to-[#FF9B7A] align-middle" aria-hidden />
            </h1>
            <p className="text-sm text-ink-faint">Sign in to your Lumenbay account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {justRegistered && (
              <div className="px-3 py-2.5 rounded-lg bg-accent-soft border border-accent-line text-accent text-sm font-semibold">
                Account created! Sign in to continue.
              </div>
            )}
            {errors.form && (
              <div role="alert" className="px-3 py-2.5 rounded-lg bg-bad-bg border border-bad-line text-bad text-sm">
                {errors.form}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-ink-muted mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="name@example.com"
                className={fieldClass("email", touched.email)}
                aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && touched.email && (
                <p id="email-error" className="text-xs text-bad mt-1" role="alert">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-ink-muted">
                  Password
                </label>
                <Link href="#" className="text-xs text-accent hover:text-accent-hover">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={fieldClass("password", touched.password)}
                aria-describedby={errors.password && touched.password ? "password-error" : undefined}
                aria-invalid={!!errors.password}
              />
              {errors.password && touched.password && (
                <p id="password-error" className="text-xs text-bad mt-1" role="alert">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-line-strong text-accent"
              />
              <label htmlFor="remember" className="text-xs text-ink-faint">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-[#E0483B] via-[#F05A47] to-[#FF7A59] hover:brightness-110 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative flex justify-center bg-surface px-3 text-[11px] text-ink-faint uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {(
              [
                { provider: "google", Icon: GoogleIcon },
                { provider: "github", Icon: GitHubIcon },
              ] as const
            ).map(({ provider, Icon }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleProvider(provider)}
                disabled={pendingProvider !== null || isSubmitting}
                aria-busy={pendingProvider === provider}
                className="flex items-center justify-center gap-2 border border-line rounded-xl py-2.5 text-sm font-semibold text-ink hover:bg-surface-2 hover:border-line-strong disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {pendingProvider === provider ? (
                  <span className="h-4 w-4 rounded-full border-2 border-line-strong border-t-accent animate-spin" aria-hidden />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {PROVIDER_LABEL[provider]}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-ink-faint">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-accent font-bold hover:text-accent-hover">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
