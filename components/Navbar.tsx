"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "./AuthForm";
import { useSupabaseAuth } from "./useSupabaseAuth";
import Image from "next/image";
// ✅ 1. นำเข้า Type ที่ถูกต้องจาก supabase-js
import type { RealtimeChannel } from "@supabase/supabase-js";

export const Navbar = () => {
  const { user } = useSupabaseAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function fetchCount() {
      if (!user) {
        setCartCount(0);
        return;
      }
      const { data, error } = await supabase.rpc("get_cart_count");
      if (error) {
        console.error(error);
        return;
      }
      if (mounted) setCartCount(data ?? 0);
    }
    fetchCount();

    // ✅ 2. เปลี่ยนจาก any เป็น RealtimeChannel | null
    let channel: RealtimeChannel | null = null;

    if (user) {
      channel = supabase
        .channel(`public:cart_items:user=${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cart_items",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchCount()
        )
        .subscribe();
    }
    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const userAvatar = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center w-full">
          <Link
            href="/"
            className="text-3xl font-bold text-black tracking-wide font-sans"
          >
            Baan Kanom
          </Link>

          <div className="hidden md:flex items-center space-x-8 font-bold text-gray-800">
            <Link href="/" className="hover:text-black transition-colors">
              หน้าแรก
            </Link>
            <Link href="/menu" className="hover:text-black transition-colors">
              สินค้าทั้งหมด
            </Link>
            <Link
              href="/promotion"
              className="hover:text-black transition-colors"
            >
              โปรโมชั่น
            </Link>
            <Link
              href="/contact"
              className="hover:text-black transition-colors"
            >
              ติดต่อเรา
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm text-gray-400 hover:text-gray-600 hidden md:block"
            >
              Admin
            </Link>

            <Link href="/cart" className="relative group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-black group-hover:text-gray-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 group relative cursor-pointer">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-stone-200 relative bg-stone-100">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs font-bold">
                      {userName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <span className="text-sm font-medium text-stone-700 hidden lg:block max-w-[100px] truncate">
                  {userName}
                </span>

                <div className="absolute right-0 top-full mt-0 w-48 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-stone-50 bg-stone-50/50">
                    <p className="text-xs text-stone-400 font-medium">
                      เข้าสู่ระบบโดย
                    </p>
                    <p className="text-sm font-bold text-stone-800 truncate">
                      {userName}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span> แก้ไขโปรไฟล์
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-stone-50"
                  >
                    <span>🚪</span> ออกจากระบบ
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-black hover:text-gray-600"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl">
            <AuthForm onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </>
  );
};
