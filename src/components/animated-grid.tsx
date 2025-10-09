"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Start animation when 10% is visible
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        observer.unobserve(canvasRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

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
    const dotSize = 1.5; // Slightly smaller dots
    let frame = 0;

    // Bubbles configuration
    const bubbles: Bubble[] = [];
    const maxBubbles = 10; // Reduced number of bubbles
    
    // Get theme once
    const isDark = document.documentElement.classList.contains("dark");
    const baseColor = isDark ? "150, 150, 170" : "120, 120, 140";
    const lineOpacity = isDark ? 0.05 : 0.07;

    // Create initial bubbles
    for (let i = 0; i < maxBubbles; i++) {
      bubbles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        radius: Math.random() * 30 + 15, // Smaller bubbles
        speed: Math.random() * 0.2 + 0.1, // Slower speed
        opacity: Math.random() * 0.2 + 0.1,
        hue: Math.random() * 50 + 330, // Tighter red/orange range
      });
    }

    // Animation
    const animate = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw grid lines (simplified)
      ctx.strokeStyle = `rgba(${baseColor}, ${lineOpacity})`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and update bubbles
      bubbles.forEach((bubble) => {
        bubble.y -= bubble.speed;
        if (bubble.y + bubble.radius < 0) {
          bubble.y = height + bubble.radius;
          bubble.x = Math.random() * width;
        }

        const gradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, bubble.radius);
        gradient.addColorStop(0, `hsla(${bubble.hue}, 70%, 60%, ${bubble.opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${bubble.hue}, 70%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      frame++;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }} // Slightly reduced opacity
    />
  );
}
