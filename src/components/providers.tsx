"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ConvexClientProvider>
        {children}
        <Toaster />
      </ConvexClientProvider>
    </ThemeProvider>
  );
}


