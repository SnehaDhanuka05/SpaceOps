"use client";

import React from "react";

interface PanelStackProps {
  children: React.ReactNode;
  className?: string;
}

export default function PanelStack({ children, className }: PanelStackProps) {
  return (
    <aside className={className || "relative md:absolute md:right-4 md:top-24 md:bottom-4 w-full md:w-96 z-30 flex flex-col gap-4 px-4 pb-8 md:p-0 md:pr-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-none pointer-events-auto"}>
      {children}
    </aside>
  );
}
