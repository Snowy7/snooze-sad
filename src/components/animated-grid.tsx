"use client";

import { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  hue: number;
}

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

    // Bubbles configuration
    const bubbles: Bubble[] = [];
    const maxBubbles = 15;
    
    // Create initial bubbles
    for (let i = 0; i < maxBubbles; i++) {
      bubbles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        radius: Math.random() * 40 + 20,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
        hue: Math.random() * 60 + 340, // Red to orange range
      });
    }

    // Animation
    const animate = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Get theme
      const isDark = document.documentElement.classList.contains("dark");
      const baseColor = isDark ? "150, 150, 170" : "120, 120, 140";

      // Draw grid lines
      const lineOpacity = isDark ? 0.06 : 0.08;
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

      // Draw grid dots with wave animation
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const distance = Math.sqrt(
            Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2)
          );
          const wave = Math.sin(distance * 0.01 - frame * 0.02);
          const opacity = 0.15 + wave * 0.1;

          ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw and update bubbles
      bubbles.forEach((bubble) => {
        // Update position
        bubble.y -= bubble.speed;
        
        // Reset bubble if it goes off screen
        if (bubble.y + bubble.radius < 0) {
          bubble.y = height + bubble.radius;
          bubble.x = Math.random() * width;
        }

        // Draw bubble with gradient
        const gradient = ctx.createRadialGradient(
          bubble.x, bubble.y, 0,
          bubble.x, bubble.y, bubble.radius
        );
        
        gradient.addColorStop(0, `hsla(${bubble.hue}, 70%, 60%, ${bubble.opacity * 0.4})`);
        gradient.addColorStop(0.5, `hsla(${bubble.hue}, 70%, 50%, ${bubble.opacity * 0.2})`);
        gradient.addColorStop(1, `hsla(${bubble.hue}, 70%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw bubble highlight
        ctx.fillStyle = `hsla(${bubble.hue}, 80%, 80%, ${bubble.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

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
      style={{ opacity: 0.6 }}
    />
  );
}
