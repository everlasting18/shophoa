import type { ReactNode } from "react";

export default function CardSection({
  title,
  icon,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-border/60 shadow-sm">
      {title && (
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
