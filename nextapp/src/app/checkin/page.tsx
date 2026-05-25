import type { Metadata } from "next";
import CheckinFlow from "@/components/checkin/CheckinFlow";

export const metadata: Metadata = {
  title: "Check-in Google Maps – Nhận Voucher Ưu Đãi",
  description:
    "Check-in tại Tiệm Hoa Nhà Tình trên Google Maps, upload ảnh và nhận ngay voucher ưu đãi Mua 1 Tặng 1.",
  robots: { index: false },
};

export default function CheckinPage() {
  return <CheckinFlow />;
}
