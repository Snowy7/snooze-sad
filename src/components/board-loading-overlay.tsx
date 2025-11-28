"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

interface BoardLoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function BoardLoadingOverlay({ isLoading, message = "Loading workspace..." }: BoardLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm bg-background/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="glass-strong border border-border/50 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">{message}</p>
              <p className="text-xs text-muted-foreground">Please wait a moment...</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

