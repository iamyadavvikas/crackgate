import Link from "next/link";
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto my-32 px-5 text-center">
      <div className="text-7xl">🚧</div>
      <h1 className="text-3xl font-extrabold mt-4">Page not found</h1>
      <p className="text-muted mt-2">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="btn btn-primary mt-6">← Back home</Link>
    </div>
  );
}
