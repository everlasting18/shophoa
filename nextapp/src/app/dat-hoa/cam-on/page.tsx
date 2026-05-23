"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MessageCircle, Home, Package, Clock, Phone, MapPin, Calendar, CreditCard, User, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import pb from "@/services/pocketbase";
import { formatPrice } from "@/lib/utils";
import { shortDateISO } from "@/lib/date-utils";
import { PHOTO_BASE } from "@/config";
import type { Order } from "@/schema";



function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border/60 overflow-hidden animate-pulse">
      <div className="px-5 py-3.5 border-b border-border/40">
        <div className="h-3.5 w-28 bg-muted rounded" />
      </div>
      <div className="p-5 space-y-3.5">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-md bg-muted shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-1/3 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThanksContent() {
  const contact = useSettings();
  const params = useSearchParams();
  const orderCode = params.get("code") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderCode);

  useEffect(() => {
    if (!orderCode) return;
    pb.collection("orders").getFirstListItem<Order>(`order_code="${orderCode}"`)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderCode]);

  const items = Array.isArray(order?.items) ? order!.items : [];

  return (
    <div className="container mx-auto px-4 pt-8 pb-20 md:pb-10 max-w-md space-y-4">

      {/* Hero + order code */}
      <div className="text-center">
        <div className="relative inline-flex mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping" style={{ animationDuration: "2s", animationIterationCount: "1" }} />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-1">Đặt hoa thành công! 🌸</h1>
        <p className="text-muted-foreground text-sm mb-4">
          Cảm ơn quý khách đã tin tưởng. Shop sẽ chủ động liên hệ xác nhận đơn sớm nhất.
        </p>
      
      </div>

      {/* Order detail */}
      {loading ? (
        <OrderSkeleton />
      ) : order ? (
        <div className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          

          {/* Info rows */}
          <div className="divide-y divide-border/30">
            <div className="flex items-center gap-3 px-5 py-3">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{order.recipient_name || order.customer_name}</span>
                {order.recipient_phone && <span className="text-xs text-muted-foreground ml-2">{order.recipient_phone}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">
                {order.delivery_date ? shortDateISO(order.delivery_date) : "—"}
                {order.delivery_time && <span className="text-muted-foreground font-normal ml-2">{order.delivery_time}</span>}
              </span>
            </div>
            {order.recipient_address && (
              <div className="flex items-start gap-3 px-5 py-3">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">{order.recipient_address}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="px-5 py-3.5 border-t border-border/40 space-y-2.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/40">
                    {item.thumbnail && item.product_id ? (
                      <Image
                        src={`${PHOTO_BASE}/${item.collectionId || "products"}/${item.product_id}/${item.thumbnail}`}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="px-5 py-3.5 border-t border-border/40 bg-muted/20 space-y-2">
            {order.note && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Ghi chú: </span>{order.note}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" />
                {order.payment_method === "bank_transfer" ? "Chuyển khoản" : "Thanh toán khi nhận"}
              </span>
              <span className="text-lg font-bold text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="space-y-2.5 pt-1">
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border border-border font-semibold text-sm hover:bg-muted transition-colors"
        >
          <Home className="w-4 h-4" />
          Về trang chủ
        </Link>
        <div className="text-center pt-1">
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {contact.phoneDisplay}
            <ChevronRight className="w-3 h-3 opacity-40" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Đang tải...</p>
        </div>
      }
    >
      <ThanksContent />
    </Suspense>
  );
}
