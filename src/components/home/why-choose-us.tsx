import { Truck, Star, ShieldCheck, Clock } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Giao Hoa Tận Nơi",
    desc: "Giao hoa hỏa tốc trong 60 phút tại nội thành TPHCM. Đặt online, nhận tận tay.",
  },
  {
    icon: Star,
    title: "Mẫu Đa Dạng",
    desc: "Giá cả niêm yết công khai. Hoa tươi nhập mới mỗi ngày.",
  },
  {
    icon: ShieldCheck,
    title: "Cam Kết Chất Lượng",
    desc: "Hoa giống mẫu đã chọn, đảm bảo tươi thắm. Thiết kế tinh tế từ đội ngũ nghệ nhân.",
  },
  {
    icon: Clock,
    title: "Phục Vụ Mỗi Ngày",
    desc: "Mở cửa 08:00 – 21:00 tất cả các ngày. Tư vấn miễn phí qua Zalo & điện thoại.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
            Tại Sao Chọn Chúng Mình
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
            Vườn Hoa Tươi – Uy Tín Hơn 10 Năm
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Chúng mình tự hào là tiệm hoa tươi TPHCM được khách hàng tin chọn để gửi gắm yêu thương.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-7 text-center border border-border/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent mb-5 group-hover:bg-primary/10 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2 text-[15px]">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
