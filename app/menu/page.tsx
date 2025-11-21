"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/ProductCard";
import CustomCakeModal from "@/components/CustomCakeModal";
import { useSupabaseAuth } from "@/components/useSupabaseAuth";
import type { Product, CustomCakePayload } from "@/types";
import { useAlert } from "@/components/AlertProvider";

// ✅ 1. กำหนดรายการหมวดหมู่ (id ต้องตรงกับใน Database)
const CATEGORIES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "cake", label: "🍰 เค้ก" },
  { id: "cookie", label: "🍪 คุกกี้" },
  { id: "tart", label: "🥧 ทาร์ต" },
  { id: "cupcake", label: "🧁 คัพเค้ก" },
  { id: "macaron", label: "🍬 มาการอง" },
  { id: "other", label: "✨ อื่นๆ" },
];

export default function MenuPage() {
  const { showAlert } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [openCustom, setOpenCustom] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const [isAdding, setIsAdding] = useState(false);

  // ✅ 2. เพิ่ม State สำหรับเก็บหมวดหมู่ที่เลือก (ค่าเริ่มต้นคือ 'all')
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);

      if (mounted) {
        setProducts(data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ 3. ฟังก์ชันกรองสินค้า
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true; // ถ้าเลือกทั้งหมด ให้โชว์ทุกตัว
    return product.category === selectedCategory; // ถ้าเลือกหมวดอื่น ให้เช็คว่าตรงกันมั้ย
  });

  const openForCustom = (product: Product) => {
    setSelected(product);
    setOpenCustom(true);
  };

  const handleAddCustom = async (payload: CustomCakePayload) => {
    if (!user)
      return showAlert(
        "เข้าสู่ระบบไม่สำเร็จ",
        "กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า",
        "error"
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
        "เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า",
        "error"
      ); 
    } else {
      setOpenCustom(false);
      showAlert(
        "เพิ่มสำเร็จ! 🛒",
        "เพิ่มสินค้าลงในตะกร้าเรียบร้อยแล้ว",
        "success"
      ); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-600">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
          <p>กำลังโหลดเมนู...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-stone-800 mb-2">
          สินค้าทั้งหมด
        </h1>
        <p className="text-stone-500 text-lg">
          เลือกความอร่อยที่คุณชื่นชอบได้เลย
        </p>
      </div>

      {/* ✅ 4. แถบเลือกหมวดหมู่ (Scroll แนวนอนได้ในมือถือ) */}
      <div className="flex flex-wrap justify-center gap-3 mb-10 overflow-x-auto pb-2 px-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap shadow-sm
              ${
                selectedCategory === cat.id
                  ? "bg-stone-800 text-white scale-105 shadow-md" // สถานะที่เลือกอยู่
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:border-stone-300" // สถานะปกติ
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ✅ 5. แสดงสินค้า (ใช้ filteredProducts แทน products เดิม) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onOpenCustom={openForCustom} />
          ))}
        </div>
      ) : (
        // ถ้าไม่มีสินค้าในหมวดนี้
        <div className="text-center py-20">
          <p className="text-xl text-stone-400">ไม่มีสินค้าในหมวดหมู่นี้</p>
          <button
            onClick={() => setSelectedCategory("all")}
            className="mt-4 text-stone-600 underline hover:text-stone-800"
          >
            ดูสินค้าทั้งหมด
          </button>
        </div>
      )}

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
