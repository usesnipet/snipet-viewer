import * as React from "react";
import {
  LayoutDashboard,
  Database,
  Settings,
  BarChart3,
  ShieldCheck,
  Layers,
  ChevronRight,
  Zap,
  Cpu,
  Sun,
  Moon,
  Filter
} from "lucide-react";
import { cn } from "../lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/theme-provider";
import { SystemService } from "../services/system-service";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  {
    icon: Database,
    label: "Knowledge",
    path: "/knowledge",
    subItems: [
      { label: "Bases", path: "/knowledge/base" },
      { label: "Sources", path: "/knowledge/source" },
    ]
  },
  { icon: Cpu, label: "LLMs", path: "/llms" },
  { icon: Filter, label: "Re-rankers", path: "/rerankers" },
  { icon: Layers, label: "Embeddings", path: "/embeddings" },
  { icon: BarChart3, label: "Observability", path: "/observability" },
  { icon: ShieldCheck, label: "Security", path: "/security" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [version, setVersion] = React.useState<string>("...");
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["Knowledge"]);

  React.useEffect(() => {
    SystemService.getVersion().then(setVersion);
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-screen sticky top-0 flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Snipet</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isParentActive = location.pathname.startsWith(item.path);
          const isExpanded = expandedItems.includes(item.label);

          if (item.subItems) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isParentActive
                      ? "text-indigo-700 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-4 h-4", isParentActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                    {item.label}
                  </div>
                  <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", isExpanded && "rotate-90")} />
                </button>

                {isExpanded && (
                  <div className="ml-9 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={cn(
                            "block px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                            isSubActive
                              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                              : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                          )}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-600">Version</span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-500">{version}</span>
        </div>

        <button
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
