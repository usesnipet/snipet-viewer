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
  Filter,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/theme-provider";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "./ui/sidebar";
import { useGetApiVersion } from "@/gen";

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

export function AppSidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["Knowledge"]);

  const { data: { version } = { version: "..." } } = useGetApiVersion();

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((i) => i !== label)
        : [...prev, label]
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Snipet
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isParentActive = location.pathname.startsWith(item.path);
                const isExpanded = expandedItems.includes(item.label);

                if (item.subItems?.length) {
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        onClick={() => toggleExpand(item.label)}
                        isActive={isParentActive}
                        tooltip={item.label}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>

                      <SidebarMenuAction
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpand(item.label);
                        }}
                        showOnHover
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </SidebarMenuAction>

                      {isExpanded && (
                        <SidebarMenuSub>
                          {item.subItems.map((sub) => {
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <SidebarMenuSubItem key={sub.path}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link to={sub.path}>{sub.label}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.path}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
              Version
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-500">
              {version}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
