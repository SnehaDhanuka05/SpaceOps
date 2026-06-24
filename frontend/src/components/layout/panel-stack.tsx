"use client";

import React from "react";

interface PanelStackProps {
  children: React.ReactNode;
  className?: string;
}

export default function PanelStack({ children, className }: PanelStackProps) {
  return (
    <aside className={className || "relative lg:absolute lg:right-4 lg:top-24 lg:bottom-4 w-full lg:w-96 z-30 flex flex-col gap-4 px-4 pb-8 lg:p-0 lg:pr-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-none pointer-events-auto"}>
      {children}
    </aside>
  );
}
