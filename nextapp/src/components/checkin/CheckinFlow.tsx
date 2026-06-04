"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { CompositeCanvasRef } from "./CompositeCanvas";
import { GMAPS_CHECKIN_URL } from "@/config";

const CompositeCanvas = dynamic(() => import("./CompositeCanvas"), { ssr: false });

type Step = 1 | 2 | 3 | 4;

interface VoucherResult {
  qr_token: string;
  record_id: string;
}

// ── Step indicator ──────────────────────────────────────────────────────────

function StepDots({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 px-6 py-3">
      {([1, 2, 3, 4] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              s < current
                ? "bg-rose-500"
                : s === current
                ? "bg-rose-500 ring-4 ring-rose-200 animate-pulse"
                : "bg-stone-200 border border-stone-300"
            }`}
          />
          {i < 3 && (
            <div
              className={`w-8 h-0.5 transition-colors duration-300 ${
                s < current ? "bg-rose-400" : "bg-stone-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Hướng dẫn ───────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col px-5 pt-4 pb-6">
      <div className="flex flex-col items-center text-center mb-6 mt-2">
        <div className="text-5xl mb-4">📍</div>
        <h2 className="text-xl font-bold text-stone-800">Check-in Google Maps</h2>
        <p className="text-sm text-stone-500 mt-1">Nhận voucher ưu đãi ngay hôm nay</p>
      </div>

      <div className="bg-rose-50 rounded-2xl p-4 mb-6 space-y-3">
        <p className="text-sm font-semibold text-stone-700 mb-3">Làm theo 4 bước đơn giản:</p>
        {[
          "Bấm mở Google Maps bên dưới",
          "Check-in tại Tiệm Hoa Nhà Tình",
          "Chụp màn hình kết quả check-in",
          "Upload ảnh để nhận mã QR voucher",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-stone-600">{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <a
          href={GMAPS_CHECKIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-13 min-h-[52px] bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-base"
        >
          🗺️ Mở Google Maps Check-in
        </a>
        <button
          onClick={onNext}
          className="w-full h-12 border-2 border-stone-300 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors text-base"
        >
          Tôi đã check-in →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Upload ảnh ──────────────────────────────────────────────────────

function Step2({
  file,
  onFile,
  onNext,
  onBack,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      alert("Ảnh tối đa 10MB");
      return;
    }
    onFile(f);
  }

  return (
    <div className="flex flex-col px-5 pt-4 pb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-800">📸 Upload ảnh check-in</h2>
        <p className="text-sm text-stone-500 mt-1">Chụp màn hình kết quả check-in Google Maps</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden bg-stone-100 max-h-64 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="preview" className="w-full h-full object-cover max-h-64" />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute top-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            ✏️ Đổi ảnh
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="h-48 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 hover:bg-stone-100 flex flex-col items-center justify-center gap-3 transition-colors mb-4"
        >
          <div className="text-4xl">📁</div>
          <p className="text-stone-500 text-sm font-medium">Nhấn để chọn ảnh</p>
          <p className="text-stone-400 text-xs">hoặc kéo thả vào đây · Tối đa 10MB</p>
        </button>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 h-12 border border-stone-300 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors"
        >
          ← Quay lại
        </button>
        <button
          onClick={onNext}
          disabled={!file}
          className="flex-1 h-12 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Tiếp theo →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Nhập thông tin ──────────────────────────────────────────────────

function Step3({
  name,
  phone,
  onName,
  onPhone,
  onSubmit,
  onBack,
  loading,
}: {
  name: string;
  phone: string;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col px-5 pt-4 pb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-800">👤 Thông tin của bạn</h2>
        <p className="text-sm text-stone-500 mt-1">Điền thông tin để nhận voucher</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Họ tên <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            inputMode="text"
            placeholder="Nguyễn Văn A"
            className="w-full h-12 px-4 border border-stone-300 rounded-xl text-base text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Số điện thoại <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            inputMode="tel"
            placeholder="0901234567"
            className="w-full h-12 px-4 border border-stone-300 rounded-xl text-base text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          onClick={onSubmit}
          disabled={!name.trim() || !phone.trim() || loading}
          className="w-full h-13 min-h-[52px] bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo voucher 🎉"
          )}
        </button>
        <button
          onClick={onBack}
          className="w-full text-sm text-center text-stone-500 py-2 hover:text-stone-700 transition-colors"
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Kết quả ─────────────────────────────────────────────────────────

function Step4({
  screenshot,
  qrToken,
  userName,
  userPhone,
}: {
  screenshot: File;
  qrToken: string;
  userName: string;
  userPhone: string;
}) {
  const canvasRef = useRef<CompositeCanvasRef>(null);

  const handleDownload = useCallback(() => {
    canvasRef.current?.download();
  }, []);

  return (
    <div className="flex-1 flex flex-col px-5 pt-4 pb-6">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-stone-800">🎉 Xong rồi!</h2>
        <p className="text-sm text-stone-500 mt-1">Lưu ảnh voucher để dùng tại shop</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <CompositeCanvas
          ref={canvasRef}
          screenshot={screenshot}
          qrToken={qrToken}
          userName={userName}
          userPhone={userPhone}
        />
      </div>

      <div className="mt-5 space-y-3">
        <button
          onClick={handleDownload}
          className="w-full h-13 min-h-[52px] bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors text-base flex items-center justify-center gap-2"
        >
          ⬇️ Lưu ảnh voucher
        </button>
        <p className="text-xs text-center text-stone-400">
          hoặc chụp màn hình để lưu voucher này
        </p>
        <div className="text-center">
          <a href="/" className="text-sm text-rose-500 hover:text-rose-600 transition-colors">
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main CheckinFlow ────────────────────────────────────────────────────────

export default function CheckinFlow() {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoucherResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!file || !name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("user_name", name.trim());
      fd.append("user_phone", phone.trim());
      fd.append("screenshot", file);

      const res = await fetch("/api/checkin", { method: "POST", body: fd });
      const data = await res.json() as { qr_token?: string; record_id?: string; error?: string; message?: string };

      if (!res.ok || !data.qr_token) {
        throw new Error(data.message ?? data.error ?? "Lỗi không xác định");
      }

      setResult({ qr_token: data.qr_token, record_id: data.record_id ?? "" });
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-dvh flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center h-14 px-4 border-b border-stone-100 shrink-0">
        <div className="text-2xl select-none">🌸</div>
        <p className="ml-3 font-bold text-stone-800 text-base">Tiệm Hoa Nhà Tình</p>
      </header>

      <StepDots current={step} />

      {error && (
        <div className="mx-5 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && (
        <Step2
          file={file}
          onFile={setFile}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          name={name}
          phone={phone}
          onName={setName}
          onPhone={setPhone}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
          loading={loading}
        />
      )}
      {step === 4 && result && file && (
        <Step4
          screenshot={file}
          qrToken={result.qr_token}
          userName={name}
          userPhone={phone}
        />
      )}

      <div className="pb-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
