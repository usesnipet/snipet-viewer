import { ThemeProvider } from "./context/theme-provider";

import { Toaster } from './components/ui/toaster';
import { DialogProvider } from './context/dialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "./components/ui/tooltip";

const queryClient = new QueryClient();

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <DialogProvider>
            {children}
          </DialogProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}