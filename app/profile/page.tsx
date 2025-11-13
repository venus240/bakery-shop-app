"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSupabaseAuth } from "@/components/useSupabaseAuth";

export default function ProfilePage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลเก่ามาแสดงเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setImagePreview(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // แสดงรูปตัวอย่างทันที
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = user?.user_metadata?.avatar_url;

      // 1. ถ้ามีการเปลี่ยนรูป ให้อัปโหลดรูปใหม่
      if (image) {
        const fileExt = image.name.split(".").pop();
        // ตั้งชื่อไฟล์เป็นเวลาปัจจุบันเพื่อไม่ให้ซ้ำ
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        
        avatarUrl = publicUrlData.publicUrl;
      }

      // 2. อัปเดตข้อมูล User Metadata (ชื่อ + ลิงก์รูป)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          avatar_url: avatarUrl,
        },
      });

      if (updateError) throw updateError;

      alert("บันทึกข้อมูลสำเร็จ! 🎉");
      router.refresh(); // รีเฟรชเพื่อให้ Navbar อัปเดต
      window.location.reload(); // บังคับโหลดใหม่เพื่อให้รูปเปลี่ยนทันที

    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-stone-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-md border border-stone-100 overflow-hidden">
        
        {/* หัวข้อ */}
        <div className="bg-stone-800 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">แก้ไขโปรไฟล์ส่วนตัว</h1>
          <p className="text-stone-300 text-sm mt-1">จัดการข้อมูลบัญชีของคุณ</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
          
          {/* ส่วนรูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full border-4 border-stone-100 overflow-hidden bg-stone-50 shadow-inner relative">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">👤</div>
                )}
              </div>
              
              {/* ปุ่มเปลี่ยนรูปซ้อนอยู่ */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded-full">
                  เปลี่ยนรูป
                </span>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden absolute inset-0 cursor-pointer" />
            </div>
            <p className="text-xs text-stone-400 mt-2">คลิกที่รูปเพื่อเปลี่ยน</p>
          </div>

          {/* ฟอร์มกรอกข้อมูล */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">ชื่อที่ใช้แสดง</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 transition-all text-stone-800"
                placeholder="ชื่อเล่น หรือ ชื่อจริง"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">อีเมล (เปลี่ยนไม่ได้)</label>
              <input
                type="text"
                value={email}
                disabled
                className="w-full p-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-white border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 bg-stone-800 text-white font-bold rounded-xl shadow-md hover:bg-stone-900 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? "กำลังบันทึก..." : " บันทึกการแก้ไข"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}