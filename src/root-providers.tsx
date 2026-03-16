import { ThemeProvider } from "./components/theme-provider";

import { Toaster } from './components/ui/toaster';
import { DialogProvider } from './context/dialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DialogProvider>
          {children}
        </DialogProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}