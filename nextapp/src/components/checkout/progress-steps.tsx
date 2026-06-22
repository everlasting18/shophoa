export default function ProgressSteps() {
  return (
    <div className="bg-white border-b border-border/60">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">1</span>
            <span>Giỏ hàng <span className="opacity-60">/ Cart</span></span>
          </div>
          <span className="text-muted-foreground/40">→</span>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
            <span>Thông tin <span className="opacity-60 font-normal">/ Details</span></span>
          </div>
          <span className="text-muted-foreground/40">→</span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">3</span>
            <span>Hoàn tất <span className="opacity-60">/ Done</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
