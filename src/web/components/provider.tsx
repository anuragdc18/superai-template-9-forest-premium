import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { startPreviewBridge } from "../lib/preview-draft";

// inside the admin's live-preview frame only: receive unsaved changes to show
startPreviewBridge();

const queryClient = new QueryClient();

interface ProviderProps {
  children: React.ReactNode;
}

// App-level providers — add theme/context providers here, wrapping children.
// QueryClientProvider must stay (all API calls run through TanStack Query).
export function Provider({ children }: ProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
