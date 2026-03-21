"use client";

import React from "react";

/**
 * TypingIndicator Component
 * Recreates the exact central circle UI from the image using pure Tailwind CSS.
 * This replaces the image with high-fidelity CSS layers and animations.
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-3 w-full justify-start items-center">
      {/* Container with Pulse and Spin animations */}
      <div className="relative w-10 h-10 flex items-center justify-center animate-pulse duration-1000">
        
        {/* 1. Main Outer Dark Brown/Bronze Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4a3728] via-[#2a1d15] to-[#120c08] border-[1px] border-stone-800 shadow-xl" />

        {/* 2. Middle Layer (Concentric Ring Detail) */}
        <div className="absolute w-[85%] h-[85%] rounded-full border border-yellow-600/20" />
        
        {/* 3. Deep Recessed Layer */}
        <div className="absolute w-[70%] h-[70%] rounded-full bg-black/40 border border-black/60 shadow-inner" />

        {/* 4. Golden Inner Ring Shadow/Glow */}
        <div className="absolute w-[45%] h-[45%] rounded-full border border-yellow-500/30 blur-[0.5px]" />

        {/* 5. Central Glowing Yellow Dot */}
        <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#ffcc33] shadow-[0_0_15px_4px_rgba(255,204,51,0.6)]" />

        {/* 6. Subtle Highlight (Glassy effect) */}
        <div className="absolute top-[15%] left-[25%] w-[15%] h-[10%] bg-white/10 rounded-full rotate-[-45deg]" />

        {/* Spinning Overlay (Optional: simulates movement of the outer ring) */}
        <div 
          className="absolute inset-0 rounded-full border-t border-transparent border-r-yellow-500/20 animate-spin" 
          style={{ animationDuration: '3s' }}
        />
      </div>
      
      {/* Optional: Label next to the indicator */}
      {/* <span className="text-xs font-medium text-stone-500 italic">Typing...</span> */}
    </div>
  );
}

export default TypingIndicator;