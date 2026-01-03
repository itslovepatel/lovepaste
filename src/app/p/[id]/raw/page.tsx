import { notFound } from "next/navigation";
import { getPaste } from "@/lib/db";

interface RawPageProps {
  params: Promise<{ id: string }>;
}

// Validate paste ID format
function isValidId(id: string): boolean {
  return /^[a-z2-9]{5}$/.test(id);
}

export default async function RawPage({ params }: RawPageProps) {
  const { id } = await params;
  
  // Security: Validate ID format before database lookup
  if (!isValidId(id)) {
    notFound();
  }

  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  return (
    <pre className="p-4 font-mono text-sm whitespace-pre-wrap bg-background text-foreground min-h-screen">
      {paste.content}
    </pre>
  );
}
