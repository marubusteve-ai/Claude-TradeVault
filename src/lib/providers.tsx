"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { applyPersistedAccentOnLoad } from "./theme-store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// One QueryClient per browser tab, created lazily on first render rather
// than at module scope, which avoids leaking cached data across users on
// the server-rendered path.
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  React.useEffect(() => {
    applyPersistedAccentOnLoad();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
