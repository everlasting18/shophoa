import { useEffect, useRef, useCallback } from "react";
import jsQR from "jsqr";

interface Props {
  onDetected: (code: string) => void;
  active?: boolean;
}

export default function QRReader({ onDetected, active = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectedRef = useRef(false);

  const stopStream = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    detectedRef.current = false;
  }, []);

  useEffect(() => {
    if (!active) {
      stopStream();
      return;
    }

    detectedRef.current = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.play();

        // Scan every 200ms
        timerRef.current = setInterval(() => {
          if (detectedRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx || !video || video.readyState < 2) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          if (result?.data) {
            detectedRef.current = true;
            onDetected(result.data);
          }
        }, 200);
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });

    return stopStream;
  }, [active, onDetected, stopStream]);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-900">
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan line animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3/5 h-3/5 border-2 border-white/50 rounded-xl relative overflow-hidden">
          <div className="absolute inset-x-0 h-0.5 bg-rose-400/80 animate-scan" />
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
}
