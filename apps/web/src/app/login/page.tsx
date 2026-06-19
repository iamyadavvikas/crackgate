import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForms } from "@/components/login-forms";
import { BrandMark } from "@/components/brand";

export default async function LoginPage(props: { searchParams: Promise<{ next?: string }> }) {
  const session = await auth();
  const { next = "/dashboard" } = await props.searchParams;
  if (session?.user) redirect(next);

  // Whitelist redirect target to prevent open-redirect
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <div className="max-w-md mx-auto my-12 sm:my-20 px-4 sm:px-5">
      <div className="card p-6 sm:p-10 text-center">
        <div className="mx-auto mb-5 grid place-items-center">
          <BrandMark size={64} />
        </div>
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="text-sm text-muted mt-2">
          Sign in to access your dashboard, mocks and study material.
        </p>

        <LoginForms safeNext={safeNext} />

        <hr className="my-7 border-line" />
        <p className="text-xs text-muted">
          By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
