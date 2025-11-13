"use client";

import React, { useState, useEffect } from "react";
import type { Product, CustomCakePayload } from "@/types";

interface CustomCakeModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onAddCustom: (payload: CustomCakePayload) => void;
  isAdding: boolean;
}

// รายการ Topping
const TOPPINGS = [
  { id: "strawberry", label: "🍓 สตรอว์เบอร์รี" },
  { id: "blueberry", label: "🫐 บลูเบอร์รี" },
  { id: "almond", label: "🥜 อัลมอนด์" },
  { id: "oreo", label: "🍪 โอริโอ้" },
  { id: "jelly", label: "🧸 เยลลี่" },
  { id: "kitkat", label: "🍫 คิตแคต" },
];

export default function CustomCakeModal({
  open,
  onClose,
  product,
  onAddCustom,
  isAdding,
}: CustomCakeModalProps) {
  const [flavor, setFlavor] = useState("วานิลลา");
  const [frosting, setFrosting] = useState("ครีมชีส");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setFlavor("วานิลลา");
        setFrosting("ครีมชีส");
        setNote("");
        setQty(1);
        setSelectedToppings([]);
      }, 300);
    }
  }, [open]);

  if (!open) return null;

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) => {
      if (prev.includes(toppingId)) {
        return prev.filter((id) => id !== toppingId);
      }
      if (prev.length < 3) {
        return [...prev, toppingId];
      }
      return prev;
    });
  };

  const totalPrice = product?.price || 0;

  const handleSubmit = () => {
    if (!product || isAdding) return;
    onAddCustom({
      productId: product.id,
      name: `${product.name} (ปรับหน้า)`,
      price: totalPrice,
      custom_options: {
        flavor,
        frosting,
        note,
        toppings: selectedToppings
          .map((id) => TOPPINGS.find((t) => t.id === id)?.label)
          .join(", "),
      },
      qty,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <span>🎨</span> ปรับแต่งเค้ก
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* ชื่อสินค้า */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">
              สินค้าที่เลือก
            </label>
            <div className="py-3 px-4 bg-stone-50 rounded-xl font-semibold text-stone-800 border border-stone-200 flex justify-between items-center">
              <span>{product?.name ?? "—"}</span>
              <span className="text-sm text-stone-500">฿{product?.price}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* เลือกรสชาติ (Standard Select) */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                รสเค้ก
              </label>
              <select
                className="w-full p-3 bg-white border border-stone-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 text-stone-700 font-medium cursor-pointer"
                value={flavor}
                onChange={(e) => setFlavor(e.target.value)}
              >
                <option value="วานิลลา">วานิลลา</option>
                <option value="ช็อกโกแลต">ช็อกโกแลต</option>
                <option value="สตรอว์เบอร์รี">สตรอว์เบอร์รี</option>
                <option value="ชาไทย">ชาไทย</option>
              </select>
            </div>
            
            {/* เลือกหน้าเค้ก (Standard Select) */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">
                ครีม/หน้า
              </label>
              <select
                className="w-full p-3 bg-white border border-stone-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 text-stone-700 font-medium cursor-pointer"
                value={frosting}
                onChange={(e) => setFrosting(e.target.value)}
              >
                <option value="ครีมชีส">ครีมชีส</option>
                <option value="ช็อกโกแลต">ช็อกโกแลต</option>
                <option value="บัตเตอร์ครีม">บัตเตอร์ครีม</option>
                <option value="วิปครีม">วิปครีม</option>
              </select>
            </div>
          </div>

          {/* ส่วนเลือก Topping */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-stone-700">
                ของตกแต่ง <span className="font-normal text-stone-400 text-xs">(เลือกฟรี)</span>
              </label>
              <span className={`text-xs font-bold ${selectedToppings.length >= 3 ? "text-red-500" : "text-stone-500"}`}>
                เลือกแล้ว {selectedToppings.length}/3
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {TOPPINGS.map((t) => {
                const isDisabled = selectedToppings.length >= 3 && !selectedToppings.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`
                      flex items-center p-3 rounded-xl border cursor-pointer transition-all select-none
                      ${
                        selectedToppings.includes(t.id)
                          ? "border-stone-800 bg-stone-800 text-white shadow-md ring-1 ring-stone-800"
                          : isDisabled
                          ? "border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed"
                          : "border-stone-200 hover:border-stone-400 bg-white text-stone-700"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedToppings.includes(t.id)}
                      onChange={() => toggleTopping(t.id)}
                      disabled={isDisabled}
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{t.label}</span>
                      {selectedToppings.includes(t.id) && (
                        <span className="text-xs bg-white/20 px-1.5 rounded">✓</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ข้อความหน้าเค้ก */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">
              ข้อความบนหน้าเค้ก{" "}
              <span className="font-normal text-stone-400 text-xs">
                (ไม่บังคับ)
              </span>
            </label>
            <input
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl shadow-sm focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none placeholder-stone-400 transition-all"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น สุขสันต์วันเกิด..."
            />
          </div>

          {/* จำนวน & ราคารวม */}
          <div className="flex items-center justify-between bg-stone-800 text-white p-4 rounded-xl shadow-lg mt-4">
            <div>
              <p className="text-xs opacity-80">ราคารวม</p>
              <p className="text-xl font-bold">฿{totalPrice * qty}</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-2 py-1 rounded-lg border border-white/20">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-md font-bold transition-colors"
              >
                -
              </button>
              <div className="text-lg font-bold w-8 text-center">{qty}</div>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-md font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-all"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isAdding}
            className="flex-[2] py-3 bg-stone-700 text-white font-bold rounded-xl shadow-md hover:bg-stone-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังเพิ่ม...
              </>
            ) : (
              "เพิ่มลงตะกร้า"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}