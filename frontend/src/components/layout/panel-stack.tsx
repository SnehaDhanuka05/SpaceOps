"use client";

import React from "react";

interface PanelStackProps {
  children: React.ReactNode;
}

export default function PanelStack({ children }: PanelStackProps) {
  return (
    <aside className="absolute right-4 top-24 bottom-4 w-96 z-30 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {children}
    </aside>
  );
}
