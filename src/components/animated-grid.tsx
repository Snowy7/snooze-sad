"use client";

import { useEffect, useRef } from "react";

export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Grid configuration
    const gridSize = 50;
    const dotSize = 2;
    let frame = 0;

    // Animation
    const animate = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Get theme
      const isDark = document.documentElement.classList.contains("dark");
      const baseColor = isDark ? "120, 120, 140" : "100, 100, 120";

      // Draw grid dots with wave animation
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const distance = Math.sqrt(
            Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2)
          );
          const wave = Math.sin(distance * 0.01 - frame * 0.02);
          const opacity = 0.1 + wave * 0.1;

          ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw animated lines
      const lineOpacity = 0.05 + Math.sin(frame * 0.02) * 0.03;
      ctx.strokeStyle = `rgba(${baseColor}, ${lineOpacity})`;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      frame++;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}
