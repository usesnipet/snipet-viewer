import { Suspense } from "react";

export type PageLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Optional actions (e.g. primary button) aligned to the right of the header */
  actions?: React.ReactNode;
  /** Custom Suspense fallback (default: "Loading...") */
  fallback?: React.ReactNode;
};

export function PageLayout({
  title,
  description,
  children,
  actions,
  fallback = <div>Loading...</div>,
}: PageLayoutProps) {
  return (
    <>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
        </div>
        {actions != null ? (
          <div className="shrink-0">{actions}</div>
        ) : null}
      </header>
      <Suspense fallback={fallback}>{children}</Suspense>
    </>
  );
}