import { Suspense } from "react";

export type PageLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
      </header>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </>
  );
}