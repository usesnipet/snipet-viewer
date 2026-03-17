import * as React from "react";
import { AppSidebar } from "../../components/sidebar";
import { LLMDashboard } from "./_components/llm-dashboard";
import { motion } from "motion/react";

export function ObservabilityPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AppSidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Observability</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor performance, costs, and usage across your AI infrastructure.</p>
          </header>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">LLM Performance & Costs</h2>
              </div>

              <LLMDashboard />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
