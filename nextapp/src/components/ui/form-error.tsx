import { AlertCircle } from "lucide-react";

export default function FormError({ msg }: { msg: string }) {
  return (
    <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}
