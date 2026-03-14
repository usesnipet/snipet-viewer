import { Suspense } from "react";
import { EmbeddingContent } from "./embedding-content";
import { Loader2 } from "lucide-react";
import { Sidebar } from "../../components/sidebar";

export function EmbeddingPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Embedding Profiles</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Configure how data is chunked and processed before vectorization.</p>
          </header>

          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            }
          >
            <EmbeddingContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
