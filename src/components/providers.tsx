"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AccentProvider } from "@/contexts/accent-context";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ConvexClientProvider>
        <AccentProvider>
          {children}
          <Toaster />
        </AccentProvider>
      </ConvexClientProvider>
    </ThemeProvider>
  );
}


