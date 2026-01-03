import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Paste Not Found</h1>
          <p className="text-muted-foreground max-w-sm">
            This paste may have expired or doesn&apos;t exist. Pastes with expiration times are automatically deleted.
          </p>
        </div>
        
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create New Paste
        </Link>
      </div>
    </div>
  );
}
