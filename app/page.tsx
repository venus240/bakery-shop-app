"use client";


import React, { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { ProductCard } from "@/components/ProductCard";

import CustomCakeModal from "@/components/CustomCakeModal";

import { useSupabaseAuth } from "@/components/useSupabaseAuth";

import Link from "next/link";

import Image from "next/image";

import type { Product, CustomCakePayload } from "@/types";


// ✅✅ 1. เพิ่มส่วนนี้กลับเข้ามาครับ (ไอคอนตะกร้า) ✅✅

const IconCart = () => (

  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>

);


export default function HomePage() {

  const { user } = useSupabaseAuth();

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  

  // State สำหรับหมวดหมู่

  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Cake", "Bread", "Cookies"];


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


  // ฟังก์ชันเปิด Modal

  const openForCustom = (product: Product) => {

    setSelected(product);

    setOpenCustom(true);

  };


  // ฟังก์ชันเพิ่มสินค้า Custom

  const handleAddCustom = async (payload: CustomCakePayload) => {

    if (!user) return alert("กรุณาเข้าสู่ระบบ");

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

      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");

    } else {

      setOpenCustom(false);

      // alert("เพิ่มลงตะกร้าเรียบร้อยแล้ว");

    }

  };


  return (

    // พื้นหลังสีครีมไข่ไก่ (Cream Background)

    <div className="min-h-screen flex flex-col bg-[#FFFBF0] font-sans text-[#5D4037]">

      

      {/* Navbar */}

      <nav className="fixed top-0 w-full z-40 px-4 py-4">

        <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-[#F5EFE6] px-6 py-3 flex justify-between items-center">

          <span className="font-serif font-bold text-xl text-[#6D4C41] flex items-center gap-2">

            🍞 Baan Kanom

          </span>

          <div className="hidden md:flex gap-8 text-sm font-medium text-[#8D6E63]">

            <Link href="/" className="hover:text-[#5D4037] transition-colors">Home</Link>

            <Link href="/menu" className="hover:text-[#5D4037] transition-colors">Menu</Link>

            <Link href="#" className="hover:text-[#5D4037] transition-colors">Story</Link>

            <Link href="#" className="hover:text-[#5D4037] transition-colors">Contact</Link>

          </div>

          <div className="flex items-center gap-3">

             <button className="p-2 bg-[#F5EFE6] rounded-full hover:bg-[#EFEBE9] text-[#6D4C41] transition-colors"><IconCart /></button>

          </div>

        </div>

      </nav>


      <div className="flex-grow pb-12">

        

        {/* ========== 1. Hero Section (Warm Brown Tone) ========== */}

        <div className="relative w-full h-[500px] md:h-[600px] bg-[#D7CCC8] flex items-center">

          <Image

            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop"

            alt="Bakery Banner"

            fill

            className="object-cover opacity-80" 

          />

          {/* Overlay สีน้ำตาลอบอุ่น */}

          <div className="absolute inset-0 bg-gradient-to-r from-[#4E342E]/90 via-[#5D4037]/40 to-transparent" />


          <div className="relative container mx-auto px-6 md:px-12 mt-10 z-10">

            <span className="bg-[#FFF8E1] text-[#5D4037] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-6 inline-block uppercase shadow-sm border border-[#F5EFE6]">

              ✨ Premium Homemade

            </span>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#FFF8E1] mb-6 leading-tight drop-shadow-sm">

              อบด้วยรัก<br/>

              <span className="text-[#FFCCBC]">หอมกรุ่นจากเตา</span>

            </h1>

            <p className="text-lg md:text-xl text-[#D7CCC8] mb-8 font-light max-w-lg leading-relaxed">

              เบเกอรี่โฮมเมดสไตล์อบอุ่น คัดสรรวัตถุดิบที่ดีที่สุด <br/>เพื่อให้ทุกคำคือความสุขของคุณ

            </p>

            <div className="flex gap-4">

              <Link

                href="/menu"

                className="bg-[#FFAB91] hover:bg-[#FF8A65] text-white text-lg font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl flex items-center gap-2"

              >

                สั่งขนมเลย

              </Link>

            </div>

          </div>


          {/* Wavy Separator (เส้นคลื่นสีครีม) */}

          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">

             <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">

                 <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#FFFBF0]"></path>

             </svg>

          </div>

        </div>


        {/* ========== 2. Categories & Products ========== */}

        <div className="container mx-auto px-4 mt-10 relative z-10">

          <div className="text-center mb-12">

            <h2 className="text-3xl font-serif font-bold text-[#5D4037]">เมนูแนะนำ (Recommend)</h2>

            <div className="w-24 h-1 bg-[#D7CCC8] mx-auto mt-3 rounded-full"></div>

          </div>


          {loading ? (

            <div className="flex justify-center py-20 text-[#8D6E63] animate-pulse">กำลังอบขนม...</div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">

              {products.length > 0 ? (

                products.map((item) => (

                  <ProductCard

                    key={item.id}

                    product={item}

                    onOpenCustom={openForCustom}

                  />

                ))

              ) : (

                <div className="col-span-full text-center text-[#A1887F]">ยังไม่มีสินค้าแนะนำ</div>

              )}

            </div>

          )}

          

          {/* Banner Promotion (สี Latte) */}

          <div className="mt-24 rounded-[2.5rem] overflow-hidden bg-[#D7CCC8] text-[#5D4037] relative py-12 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between shadow-xl bg-opacity-30">

             <div className="z-10 text-center md:text-left mb-6 md:mb-0">

                <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold mb-3 inline-block text-[#8D6E63]">Special Offer</span>

                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-2">Happy Evening! 🌙</h3>

                <p className="text-[#6D4C41] text-lg opacity-90">ลด 30% ขนมปังทุกรายการ หลัง 18:00 น.</p>

             </div>

             <div className="z-10">

                <Link href="/menu" className="bg-white text-[#6D4C41] px-8 py-3 rounded-full font-bold hover:bg-[#F5EFE6] transition shadow-md inline-block">

                  เช็คสาขาใกล้บ้าน

                </Link>

             </div>

          </div>


        </div>

      </div>


      {/* ========== 3. Footer (Dark Brown Tone) ========== */}

      <footer className="bg-[#4E342E] text-[#D7CCC8] py-16 rounded-t-[3rem] mt-10">

        <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="md:col-span-2">

            <h3 className="text-2xl font-serif font-bold text-[#FFF8E1] mb-4 flex items-center gap-2">🍞 Baan Kanom</h3>

            <p className="text-sm leading-relaxed max-w-xs opacity-80 font-light">

              ความสุขที่อบใหม่ทุกวัน... จากใจถึงมือคุณ <br/> 

              123 ถนนสุขุมวิท, กรุงเทพฯ

            </p>

          </div>

          <div>

            <h4 className="text-[#FFF8E1] font-bold mb-4">Menu</h4>

            <ul className="space-y-2 text-sm opacity-80">

              <li><Link href="/menu" className="hover:text-white transition-colors">New Arrival</Link></li>

              <li><Link href="/menu" className="hover:text-white transition-colors">Best Seller</Link></li>

            </ul>

          </div>

          <div>

            <h4 className="text-[#FFF8E1] font-bold mb-4">Contact</h4>

            <ul className="space-y-2 text-sm opacity-80">

               <li>📞 081-234-5678</li>

               <li>LINE: @baankanom</li>

            </ul>

          </div>

        </div>

        <div className="text-center mt-12 pt-8 border-t border-[#6D4C41] text-xs opacity-60">

          &copy; {new Date().getFullYear()} Baan Kanom. All rights reserved.

        </div>

      </footer>


      {/* Modal */}

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
