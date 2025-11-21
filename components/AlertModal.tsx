"use client";

import React from "react";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info"; // เพิ่มประเภทเพื่อเปลี่ยนสีไอคอน
}

export default function AlertModal({
  isOpen,
  title,
  message,
  onClose,
  type = "info",
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-stone-100 text-center animate-in zoom-in-95 duration-200 scale-100">
        {/* ไอคอนแสดงอารมณ์ */}
        <div className="mb-4 flex justify-center">
          {type === "success" && (
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">
              ✅
            </div>
          )}
          {type === "error" && (
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl">
              ⚠️
            </div>
          )}
          {type === "info" && (
            <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center text-2xl">
              ℹ️
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
        <p className="text-stone-600 mb-6 text-sm leading-relaxed">{message}</p>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 transition-all transform active:scale-95 shadow-md"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
