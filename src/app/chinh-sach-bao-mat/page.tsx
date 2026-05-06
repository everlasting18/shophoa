import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";
import { Home, ChevronRight, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: `Chính Sách Bảo Mật | ${SITE_NAME}`,
  description: "Chính sách bảo mật thông tin khách hàng của Vườn Hoa Tươi.",
  alternates: { canonical: "/chinh-sach-bao-mat" },
};

export default async function PrivacyPage() {
  const contact = await getSiteSettings();
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Chính sách bảo mật</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Chính Sách Bảo Mật</h1>
          <p className="text-sm text-muted-foreground">Cập nhật lần cuối: tháng 5 năm 2025</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">
        <section className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">1. Thu Thập Thông Tin</h2>
          <p>
            Chúng mình thu thập thông tin bạn cung cấp khi đặt hoa, bao gồm: họ tên, số điện thoại,
            địa chỉ giao hàng và email (nếu có). Thông tin này chỉ được sử dụng để xử lý đơn hàng
            và liên lạc với bạn.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">2. Sử Dụng Thông Tin</h2>
          <p>Thông tin của bạn được sử dụng để:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Xác nhận và thực hiện đơn hàng của bạn</li>
            <li>Liên hệ xác nhận đơn, hình ảnh thành phẩm và cập nhật giao hàng</li>
            <li>Hỗ trợ khách hàng sau bán hàng</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">3. Bảo Mật Thông Tin</h2>
          <p>
            Chúng mình cam kết bảo mật thông tin cá nhân của bạn. Thông tin không được chia sẻ
            với bên thứ ba ngoại trừ các đơn vị vận chuyển phục vụ việc giao hàng.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">4. Không Chia Sẻ Thông Tin</h2>
          <p>
            Chúng mình không bán, cho thuê hoặc chuyển nhượng thông tin cá nhân của bạn cho
            bất kỳ bên thứ ba nào vì mục đích thương mại.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">5. Quyền Của Bạn</h2>
          <p>
            Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình bằng cách
            liên hệ với chúng mình qua:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Hotline: <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phoneDisplay}</a></li>
            <li>Email: <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a></li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">6. Cookie</h2>
          <p>
            Website sử dụng cookie để lưu thông tin giỏ hàng và cải thiện trải nghiệm của bạn.
            Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên điều này có thể ảnh hưởng
            đến chức năng của trang.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">7. Liên Hệ</h2>
          <p>
            Nếu có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ:
          </p>
          <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/40 text-sm">
            <p className="font-semibold text-foreground">{SITE_NAME}</p>
            <p>Hotline: {contact.phoneDisplay}</p>
            <p>Email: {contact.email}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
