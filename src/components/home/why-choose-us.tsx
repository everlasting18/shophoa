import { Truck, Star, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Giao Hoa Tận Nơi",
    desc: "Giao hoa hỏa tốc trong 60 phút tại nội thành TPHCM. Đặt online, nhận tận tay.",
  },
  {
    icon: Star,
    title: "Mẫu Đa Dạng",
    desc: "Giá cả niêm yết công khai trên website. Hoa tươi nhập mới mỗi ngày, nói không với hoa héo.",
  },
  {
    icon: Shield,
    title: "Cam Kết Chất Lượng",
    desc: "Hoa giống mẫu đã chọn, đảm bảo tươi thắm. Thiết kế tinh tế từ đội ngũ nghệ nhân tài hoa.",
  },
  {
    icon: Clock,
    title: "Phục Vụ Mỗi Ngày",
    desc: "Mở cửa 08:00 – 21:00 tất cả các ngày trong tuần. Tư vấn miễn phí qua Zalo & điện thoại.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-14 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
            Vì Sao Chọn Vườn Hoa Tươi?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Hơn 10 năm kinh nghiệm, chúng mình tự hào là tiệm hoa tươi TPHCM được khách hàng tin chọn để gửi gắm yêu thương.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
