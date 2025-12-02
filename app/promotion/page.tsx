import React from "react";
// import Image from "next/image"; // เปลี่ยนเป็น img ธรรมดาเพื่อให้แสดงผลใน Preview นี้ได้ทันที

const PROMOTIONS = [
  {
    id: 1,
    title: "ซื้อ 3 แถม 1 (คัพเค้ก)",
    description: "เมื่อซื้อคัพเค้กรสใดก็ได้ครบ 3 ชิ้น รับฟรีทันที 1 ชิ้น!",
    code: "CUPCAKE3GET1",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=800",
    validUntil: "31 ธ.ค. 2025",
  },
  {
    id: 2,
    title: "ส่วนลดวันเกิด 10%",
    description: "รับส่วนลด 10% สำหรับเค้กปอนด์ เพียงแสดงบัตรประชาชน",
    code: "HBD10",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=800",
    validUntil: "ตลอดทั้งปี",
  },
  {
    id: 3,
    title: "ส่งฟรี! เมื่อสั่งครบ 500.-",
    description: "บริการจัดส่งฟรีภายในระยะทาง 10 กม. เมื่อยอดสั่งซื้อครบ 500 บาท",
    code: "FREEDEL",
    image: "https://images.unsplash.com/photo-1626202267363-25a970b76627?auto=format&fit=crop&q=80&w=800",
    validUntil: "31 ธ.ค. 2025",
  },
];

export default function PromotionPage() {
  return (
    // ✅ พื้นหลังสีครีม Warm Cream (#FFF8E7)
    <div className="min-h-screen bg-[#FFF8E7] py-12 px-4 font-sans selection:bg-[#D7CCC8] selection:text-[#3E2723]">
      <div className="container mx-auto max-w-5xl">
        
        <div className="text-center mb-12">
          {/* ✅ หัวข้อสีน้ำตาลเข้ม Mocha (#4E342E) */}
          <h1 className="text-4xl font-bold text-[#4E342E] mb-3 tracking-wide drop-shadow-sm">โปรโมชั่น</h1>
          {/* ✅ คำโปรยสีน้ำตาลกลาง (#795548) */}
          <p className="text-[#795548] text-lg">ดีลพิเศษที่เราตั้งใจมอบให้คุณ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROMOTIONS.map((promo) => (
            <div 
              key={promo.id} 
              // ✅ การ์ดสีขาว ตัดขอบด้วยสีเบจ (#E6DCC8)
              className="group bg-white rounded-2xl shadow-sm border border-[#E6DCC8] overflow-hidden 
                         flex flex-col md:flex-row 
                         transition-all duration-300 ease-in-out transform 
                         hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(78,52,46,0.15)]"
            >
              {/* รูปภาพ */}
              {/* ✅ พื้นหลังรูปสีครีมเข้ม (#F5E6D3) */}
              <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-[#F5E6D3] overflow-hidden">
                <img 
                  src={promo.image} 
                  alt={promo.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" 
                />
              </div>

              {/* เนื้อหา */}
              <div className="p-6 flex flex-col justify-center flex-grow">
                <div className="flex justify-between items-start mb-2">
                  {/* ✅ ชื่อโปรสีน้ำตาลเข้ม (#4E342E) */}
                  <h3 className="text-xl font-bold text-[#4E342E] group-hover:text-[#6D4C41] transition-colors">{promo.title}</h3>
                </div>
                {/* ✅ รายละเอียดสีน้ำตาลอมเทา (#6D4C41) */}
                <p className="text-[#6D4C41] text-sm mb-4 leading-relaxed">
                  {promo.description}
                </p>
                
                {/* ✅ กล่อง Code สีครีมนวล (#FAF3E0) ขอบเส้นประสีน้ำตาลอ่อน (#D7CCC8) */}
                <div className="mt-auto flex items-center justify-between bg-[#FAF3E0] p-3 rounded-xl border-2 border-[#D7CCC8] border-dashed">
                  <div className="text-xs text-[#795548] font-semibold">
                    CODE: <span className="text-[#4E342E] font-bold text-base ml-1 tracking-wider">{promo.code}</span>
                  </div>
                  {/* ✅ ป้ายวันที่สีน้ำตาลอ่อน (#8D6E63) ตัวหนังสือขาว */}
                  <div className="text-[10px] bg-[#8D6E63] px-2 py-1 rounded text-white font-medium shadow-sm">
                    ถึง {promo.validUntil}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}