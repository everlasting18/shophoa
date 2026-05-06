import type { ReactNode } from "react";

export default function InputIcon({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </div>
  );
}
