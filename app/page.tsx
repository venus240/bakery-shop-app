"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/ProductCard";
import CustomCakeModal from "@/components/CustomCakeModal"; // ✅ 1. นำเข้า Modal
import { useSupabaseAuth } from "@/components/useSupabaseAuth";
import Link from "next/link";
import Image from "next/image";
import type { Product, CustomCakePayload } from "@/types";
import { useAlert } from "@/components/AlertProvider";

export default function HomePage() {
  const { user } = useSupabaseAuth();
  const { showAlert } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- State สำหรับ Modal ---
  const [openCustom, setOpenCustom] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // ดึงข้อมูลสินค้าแนะนำ
  useEffect(() => {
    async function fetchFeaturedProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) console.error("Error fetching products:", error);
      else setProducts(data || []);
      setLoading(false);
    }
    fetchFeaturedProducts();
  }, []);

  // ✅ ฟังก์ชันเปิด Modal (เหมือนหน้า Menu)
  const openForCustom = (product: Product) => {
    setSelected(product);
    setOpenCustom(true);
  };

  // ✅ ฟังก์ชันเพิ่มสินค้า Custom (เหมือนหน้า Menu)
  const handleAddCustom = async (payload: CustomCakePayload) => {
    if (!user)
      return showAlert(
        "เข้าสู่ระบบก่อนนะ",
        "กรุณาเข้าสู่ระบบเพื่อปรับแต่งเค้ก",
        "info"
      );
    setIsAdding(true);
    const { error } = await supabase.from("cart_items").insert([
      {
        user_id: user.id,
        product_id: payload.productId,
        product_name: payload.name,
        price: payload.price,
        quantity: payload.qty ?? 1,
        custom_options: payload.custom_options ?? {},
      },
    ]);
    setIsAdding(false);
    if (error) {
      console.error(error);
      showAlert(
        "เพิ่มสินค้าไม่สำเร็จ",
        "ระบบไม่สามารถเพิ่มเค้กแบบ Custom ลงตะกร้าได้",
        "error"
      );
    } else {
      setOpenCustom(false);
      // alert("เพิ่มลงตะกร้าเรียบร้อยแล้ว"); // (Optional)
    }
  };

  return (
    <div className="min-h-screen flex flex-col"> {/* ✅ ใช้ flex-col เพื่อดัน Footer ลงล่างสุด */}
      
      <div className="flex-grow pb-12"> {/* เนื้อหาหลัก */}
        
        {/* ========== 1. Hero Section ========== */}
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl group">
            <Image
              src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2880&auto=format&fit=crop"
              alt="Bakery Banner"
              fill
              className="object-cover brightness-75 transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                อบใหม่...พร้อมเสิร์ฟ!
              </h1>
              <p className="text-xl text-stone-100 mb-8 font-medium drop-shadow-md max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                ขนมปังหอมกรุ่นและเค้กเนื้อนุ่มสูตรพิเศษ รอให้คุณมาลิ้มลองความอร่อยได้ทุกวัน
              </p>
              <Link
                href="/menu"
                className="bg-white text-stone-800 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-stone-100 hover:scale-105 transition-all animate-in fade-in zoom-in duration-500 delay-300"
              >
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          </div>
        </div>

        {/* ========== 2. สินค้าแนะนำ ========== */}
        <div className="container mx-auto px-4 mt-8">
          <h2 className="text-3xl font-bold text-center text-stone-800 mb-8">
            เมนูยอดฮิต
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.length > 0 ? (
                products.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onOpenCustom={openForCustom} // ✅ ส่งฟังก์ชันเปิด Modal
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-stone-500">
                  ยังไม่มีสินค้าแนะนำ
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-block px-8 py-2 border-2 border-stone-600 text-stone-600 text-lg font-semibold rounded-full hover:bg-stone-600 hover:text-white transition-colors duration-300"
            >
              ดูรายการขนมเพิ่มเติม ➜
            </Link>
          </div>
        </div>
      </div>

      {/* ========== 3. Footer (ใหม่) ========== */}
      <footer className="bg-stone-800 text-stone-300 py-12 mt-auto">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Column 1: Logo & Description */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 font-sans tracking-wide">Baan Kanom</h3>
            <p className="text-sm leading-relaxed">
              ร้านขนมโฮมเมดที่ใส่ใจทุกขั้นตอนการทำ คัดสรรวัตถุดิบชั้นดี เพื่อส่งมอบความอร่อยและความสุขให้คุณในทุกคำ
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">เมนูลัด</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link></li>
              <li><Link href="/menu" className="hover:text-white transition-colors">สินค้าทั้งหมด</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">ตะกร้าสินค้า</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">ติดตามสถานะคำสั่งซื้อ</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 081-234-5678</li>
              <li>LINE: @baankanom</li>
              <li>Facebook: Baan Kanom Official</li>
              <li>📍 123 ถนนสุขุมวิท, กรุงเทพฯ</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-10 pt-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} Baan Kanom. All rights reserved.
        </div>
      </footer>

      {/* ✅ ใส่ Modal ไว้ที่นี่ */}
      <CustomCakeModal
        open={openCustom}
        onClose={() => setOpenCustom(false)}
        product={selected}
        onAddCustom={handleAddCustom}
        isAdding={isAdding}
      />
    </div>
  );
}