import { notFound } from "next/navigation";
import { getPaste } from "@/lib/db";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import CodeViewer from "@/components/CodeViewer";
import GoToPasteInput from "@/components/GoToPasteInput";

interface PastePageProps {
  params: Promise<{ id: string }>;
}

// Validate paste ID format
function isValidId(id: string): boolean {
  return /^[a-z2-9]{5}$/.test(id);
}

export default async function PastePage({ params }: PastePageProps) {
  const { id } = await params;
  
  // Security: Validate ID format before database lookup
  if (!isValidId(id)) {
    notFound();
  }

  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  const shareUrl = typeof window !== "undefined" 
    ? window.location.href 
    : `${process.env.NEXT_PUBLIC_BASE_URL || ""}/p/${id}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center group-hover:scale-105 group-hover:bg-rose-600 transition-all">
                <span className="text-white font-bold text-sm">❤</span>
              </div>
              <span className="text-xl font-bold tracking-tight">LovePaste</span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <GoToPasteInput className="hidden sm:flex" />
              <CopyButton text={paste.content} label="Copy Code" />
              <CopyButton text={`/p/${id}`} label="Copy Link" />
              <Link href={`/p/${id}/raw`}>
                <span className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                  Raw
                </span>
              </Link>
              <Link href="/">
                <span className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                  New Paste
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Paste Code Banner */}
        <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Paste Code:</span>
            <code className="text-2xl font-bold font-mono tracking-wider text-foreground">
              {id}
            </code>
          </div>
          <CopyButton text={id} label="Copy Code" />
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
              {paste.language || "plaintext"}
            </span>
            <span>
              Created {new Date(paste.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {paste.expires_at && (
              <span className="text-amber-600">
                Expires {new Date(paste.expires_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {paste.content.length.toLocaleString()} characters • {paste.content.split("\n").length} lines
          </div>
        </div>

        {/* Code Display */}
        <CodeViewer code={paste.content} language={paste.language} />
      </main>
    </div>
  );
}
