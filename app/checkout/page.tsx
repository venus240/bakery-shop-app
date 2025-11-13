"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/components/useSupabaseAuth";

// ✅ 1. สร้าง Type ที่ถูกต้องสำหรับสินค้าในตะกร้า
interface CartItem {
  id: string;
  user_id: string;
  product_id: string; // เพิ่มเผื่อไว้
  product_name: string;
  price: number;
  quantity: number;
  // ระบุโครงสร้างของ custom_options ให้ชัดเจน
  custom_options: {
    flavor?: string;
    frosting?: string;
    note?: string;
  } | null; 
}

const BANK_INFO = {
  bankName: "ธนาคารกสิกรไทย (KBANK)",
  accountName: "ร้านบ้านขนม (Baan Kanom)",
  accountNumber: "123-4-56789-0",
};

export default function CheckoutPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  
  // ✅ 2. ใช้ Type CartItem[] แทน any[]
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [slip, setSlip] = useState<File | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  useEffect(() => {
    if (!user) return;
    async function fetchCart() {
      const { data } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user!.id); // ใส่ ! ยืนยันว่ามี id แน่นอน
      
      if (data) {
        // Cast ข้อมูลที่ได้จาก Supabase ให้เป็น Type ที่เรากำหนด
        setCartItems(data as CartItem[]);
        
        const total = data.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setSubTotal(total);
      }
      setLoading(false);
    }
    fetchCart();
  }, [user]);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    
    if (code === "HBD10") {
      const discountValue = subTotal * 0.10;
      setDiscount(discountValue);
      setAppliedCode(code);
      alert(`ใช้โค้ด ${code} สำเร็จ! ลด 10%`);
    } else if (code === "FREEDEL") {
      alert("ใช้โค้ด FREEDEL สำเร็จ! (ส่งฟรี)");
    } else if (code === "WELCOME50") {
        setDiscount(50);
        setAppliedCode(code);
        alert(`ใช้โค้ด ${code} สำเร็จ! ลด 50 บาท`);
    } else {
      setDiscount(0);
      setAppliedCode("");
      alert("❌ โค้ดไม่ถูกต้อง หรือหมดอายุ");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCode("");
    setCouponCode("");
  };

  const finalPrice = Math.max(0, subTotal - discount);

  const uploadSlip = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("slips")
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("slips")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("ตะกร้าว่างเปล่า");
    if (!slip) return alert("กรุณาแนบสลิปการโอนเงิน");

    setSubmitting(true);
    try {
      const slipUrl = await uploadSlip(slip);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id,
            total_price: finalPrice,
            status: "pending",
            name,
            address,
            phone,
            note: note || null,
            slip_url: slipUrl,
            discount_amount: discount,
            promotion_code: appliedCode || null,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // สร้าง Order Items โดยใช้ข้อมูลจาก cartItems ที่มี Type ถูกต้อง
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        custom_options: item.custom_options,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await supabase.from("cart_items").delete().eq("user_id", user?.id);

      alert("สั่งซื้อสำเร็จ! ขอบคุณที่อุดหนุนเรานะคะ ");
      router.push("/");

    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-500">กำลังโหลด...</div>;
  if (cartItems.length === 0) return <div className="p-10 text-center text-stone-500">ไม่มีสินค้าในตะกร้า</div>;

  return (
    <div className="min-h-screen bg-[#FBF9F6] py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-800 mb-4">📍 ที่อยู่จัดส่ง</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">ชื่อผู้รับ</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 text-stone-800" placeholder="ชื่อ-นามสกุล" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">เบอร์โทรศัพท์</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 text-stone-800" placeholder="08x-xxx-xxxx" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">ที่อยู่จัดส่ง</label>
                <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 text-stone-800" placeholder="บ้านเลขที่, ถนน, แขวง/เขต, จังหวัด..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  หมายเหตุถึงร้านค้า <span className="text-stone-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 text-stone-800" placeholder="เช่น ฝากไว้ที่ป้อมยาม, ขอช้อนส้อม, แพ้ถั่ว..." />
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-800 mb-4">💸 ชำระเงิน</h2>
            <div className="bg-stone-800 text-white p-4 rounded-xl mb-4">
              <p className="text-sm opacity-80">โอนเงินเข้าบัญชี</p>
              <p className="text-lg font-bold">{BANK_INFO.bankName}</p>
              <p className="text-2xl font-mono my-1 tracking-wider">{BANK_INFO.accountNumber}</p>
              <p className="text-sm opacity-80">ชื่อบัญชี: {BANK_INFO.accountName}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-700">แนบสลิปโอนเงิน</label>
              <input type="file" accept="image/*" required onChange={(e) => setSlip(e.target.files?.[0] || null)} className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-stone-800 mb-4">🧾 สรุปคำสั่งซื้อ</h2>
          
          <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b border-stone-50 pb-3 last:border-0">
                <div>
                  <span className="font-bold text-stone-700 block">{item.product_name}</span> 
                  <span className="text-stone-400 text-xs">x {item.quantity} ชิ้น</span>
                  {/* ใช้ Optional Chaining ?. เพื่อความปลอดภัย */}
                  {item.custom_options && (
                    <div className="text-xs text-stone-500 mt-1 bg-stone-50 p-1 rounded border border-stone-100">
                      {item.custom_options?.flavor && <div>รส: {item.custom_options.flavor}</div>}
                      {item.custom_options?.frosting && <div>หน้า: {item.custom_options.frosting}</div>}
                      {item.custom_options?.note && <div>โน้ต: {item.custom_options.note} </div>}
                    </div>
                  )}
                </div>
                <span className="text-stone-600 font-medium">฿{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="text-sm font-bold text-stone-700 block mb-2">โค้ดส่วนลด</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCode}
                placeholder="กรอกโค้ดที่นี่"
                className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-stone-400 text-stone-800 uppercase"
              />
              {appliedCode ? (
                <button 
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-4 py-2 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200"
                >
                  ยกเลิก
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-stone-700 text-white text-sm font-bold rounded-lg hover:bg-stone-800"
                >
                  ใช้โค้ด
                </button>
              )}
            </div>
            {appliedCode && <p className="text-xs text-green-600 mt-1">✅ ใช้โค้ด {appliedCode} เรียบร้อย</p>}
          </div>

          <div className="border-t-2 border-stone-100 pt-4 space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>ยอดรวมสินค้า</span>
              <span>฿{subTotal.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>ส่วนลด ({appliedCode})</span>
                <span>-฿{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>ค่าจัดส่ง</span>
              <span>ฟรี</span>
            </div>
            
            <div className="flex justify-between text-xl font-bold text-stone-800 pt-2 border-t border-stone-100 mt-2">
              <span>ยอดสุทธิ</span>
              <span>฿{finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            form="checkout-form"
            disabled={submitting}
            className="w-full mt-6 py-3 bg-stone-800 text-white font-bold rounded-xl shadow-lg hover:bg-stone-900 hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
          >
            {submitting ? (
               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "✅ ยืนยันการสั่งซื้อ"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}