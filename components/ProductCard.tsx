"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "./useSupabaseAuth";
import type { Product } from "@/types";
import Image from "next/image"; // ✅ ใช้ Image ของ Next.js เพื่อประสิทธิภาพ

interface ProductCardProps {
  product: Product;
  onOpenCustom?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenCustom,
}) => {
  // --- (Logic: เหมือนเดิมทุกประการ) ---
  const { user } = useSupabaseAuth();
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async (e: React.MouseEvent) => {
    console.log("User:", user);
    e.stopPropagation();
    if (!user) {
      return alert("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
    }
    if (isAdding) {
      return;
    }
    if (!product) {
      return;
    }
    if (product.is_custom) {
      return;
    }
    setIsAdding(true);
    try {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .is("custom_options", null)
        .limit(1)
        .maybeSingle<{ id: string; quantity: number }>();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: (existing.quantity ?? 1) + 1 })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert([
          {
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            quantity: 1,
            custom_options: null,
          },
        ]);
      }
      // alert("เพิ่มลงตะกร้าแล้ว"); // (Optional: ปิด alert เพื่อความลื่นไหล)
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดขณะเพิ่มสินค้าลงตะกร้า");
    }
    setIsAdding(false);
  };

  // ฟังก์ชันตัดสินใจว่าจะเปิด Modal หรือ Add to Cart
  const handleAction = (e: React.MouseEvent) => {
    if (product.is_custom && onOpenCustom) {
      onOpenCustom(product);
    } else {
      addToCart(e);
    }
  };

  // --- (Render: ดีไซน์ใหม่แบบ Baan Kanom) ---
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-105 h-full border border-stone-100">
      {/* ส่วนรูปภาพ: ใช้ Next/Image และ Fallback สีพื้นหลัง */}
      <div className="relative w-full h-48 bg-[#A89086] flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          // ถ้าไม่มีรูป ให้แสดงชื่อสินค้าบนพื้นหลังสีน้ำตาล (Fallback)
          <span className="text-xl font-bold text-white opacity-90 px-4 text-center">
            {product.name}
          </span>
        )}
      </div>

      {/* ส่วนเนื้อหา */}
      <div className="p-5 flex-grow flex flex-col justify-between relative">
        <div>
          {/* ชื่อสินค้า (สีน้ำตาลเข้ม) */}
          <h3 className="text-lg font-bold text-stone-800 leading-tight mb-1">
            {product.name}
          </h3>

          {/* คำอธิบาย (ถ้ามี) */}
          {product.description && (
            <p className="text-xs text-stone-500 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* ราคา (สีน้ำตาลกลาง) */}
          <p className="text-md font-semibold text-stone-600">
            {Number(product.price).toFixed(0)} บาท
          </p>
        </div>

        {/* ปุ่มเพิ่มลงตะกร้า (+) หรือ ปรับหน้า (🎨) */}
        {/* จัดวางไว้มุมขวาล่างของเนื้อหา */}
        <button
          onClick={handleAction}
          disabled={isAdding}
          className={`
            absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow-md transition-colors
            ${
              product.is_custom
                ? "bg-white border-2 border-stone-600 text-stone-600 hover:bg-stone-50" // ปุ่ม Custom (สีขาวขอบน้ำตาล)
                : "bg-stone-700 text-white hover:bg-stone-800" // ปุ่ม Add ปกติ (สีน้ำตาลเข้ม)
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={product.is_custom ? "ปรับแต่งสินค้า" : "เพิ่มลงตะกร้า"}
        >
          {isAdding ? (
            // Loading Spinner เล็กๆ
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : product.is_custom ? (
            // ไอคอนจานสี (สำหรับ Custom)
            <span>+</span>
          ) : (
            // ไอคอน + (สำหรับ Add ปกติ)
            <span>+</span>
          )}
        </button>
      </div>
    </div>
  );
};
