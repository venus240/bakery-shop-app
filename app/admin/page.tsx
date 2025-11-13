"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminPage() {
  const router = useRouter();

  // --- State ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isCustom, setIsCustom] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Logic ---

  async function fetchProducts() {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching products:", error);
    else setProducts(data || []);
    setLoadingProducts(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ [FIX] ฟังก์ชันอัปโหลดรูปที่แก้ปัญหาภาษาไทยแล้ว
  const uploadImage = async (file: File): Promise<string> => {
    // 1. ดึงนามสกุลไฟล์
    const fileExt = file.name.split(".").pop();
    // 2. ตั้งชื่อไฟล์ใหม่ (random) เพื่อเลี่ยงภาษาไทย
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `cakes/${fileName}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const deleteImage = async (imageUrl: string) => {
    const imagePath = imageUrl.split("/").slice(-2).join("/");
    const { error } = await supabase.storage
      .from("product-images")
      .remove([imagePath]);
    if (error) console.error("Error removing old image:", error);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setIsCustom(false);
    setImage(null);
    setEditingProduct(null);
    setLoading(false);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price);
    setIsCustom(product.is_custom || false);
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      return alert("กรุณากรอกชื่อ และ ราคา");
    }
    if (!image && !editingProduct) {
      return alert("กรุณาเลือกรูปภาพสำหรับสินค้าใหม่");
    }

    setLoading(true);
    try {
      let imageUrl = editingProduct?.image_url || null;

      if (image) {
        imageUrl = await uploadImage(image);
        if (editingProduct && editingProduct.image_url) {
          await deleteImage(editingProduct.image_url);
        }
      }

      const productData: Omit<Product, "id" | "created_at" | "category"> = {
        name,
        price: Number(price),
        image_url: imageUrl,
        description: description || null,
        is_custom: isCustom,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
        alert("อัปเดตสินค้าเรียบร้อยแล้ว!");
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
        alert("เพิ่มสินค้าเรียบร้อยแล้ว!");
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error("Full Error:", JSON.stringify(err, null, 2));

      if (err instanceof Error) {
        alert(err.message);
      } else {
        // ลองดึง message จาก object แปลกๆ
        alert(JSON.stringify(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${product.name}"?`)) {
      return;
    }
    try {
      const { error: dbError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);
      if (dbError) throw dbError;

      if (product.image_url) {
        await deleteImage(product.image_url);
      }

      alert("ลบสินค้าเรียบร้อยแล้ว");
      setProducts(products.filter((p) => p.id !== product.id));
      if (editingProduct?.id === product.id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดขณะลบ");
    }
  };

  // --- Render UI (Theme Baan Kanom) ---
  return (
    <div className="min-h-screen bg-[#FBF9F6] py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- ส่วนที่ 1: ฟอร์มจัดการสินค้า --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {" "}
            {/* ทำให้ฟอร์มค้างอยู่ด้านบนเมื่อเลื่อน */}
            <h1 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              {editingProduct ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่"}
            </h1>
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                  placeholder="เช่น ครัวซองต์อัลมอนด์"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                  rows={3}
                  placeholder="รายละเอียดสินค้า..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  ราคา (บาท)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                  placeholder="0.00"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  รูปภาพ{" "}
                  {editingProduct && (
                    <span className="text-xs font-normal text-stone-500">
                      (อัปโหลดใหม่เพื่อเปลี่ยน)
                    </span>
                  )}
                </label>
                <label className="w-full flex items-center justify-center px-4 py-8 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                  <div className="text-center">
                    <span className="text-3xl block mb-2">📷</span>
                    <span className="text-sm text-stone-500 truncate max-w-[200px] block">
                      {image ? image.name : "คลิกเพื่อเลือกรูปภาพ"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center p-3 bg-stone-50 rounded-xl">
                <input
                  id="isCustom"
                  type="checkbox"
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  className="w-5 h-5 text-stone-600 border-stone-300 rounded focus:ring-stone-500 accent-stone-700"
                />
                <label
                  htmlFor="isCustom"
                  className="ml-3 block text-sm font-medium text-stone-700 cursor-pointer select-none"
                >
                  เปิดให้ลูกค้าปรับแต่งหน้าเค้กได้ 🎨
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold shadow-md hover:bg-stone-900 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "กำลังบันทึก..."
                    : editingProduct
                    ? "💾 บันทึกการแก้ไข"
                    : "✨ เพิ่มสินค้า"}
                </button>

                {editingProduct && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-3 bg-white border-2 border-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-all"
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* --- ส่วนที่ 2: รายการสินค้า --- */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-stone-800 mb-6">
            📦 สินค้าทั้งหมด ({products.length})
          </h1>

          {loadingProducts ? (
            <div className="flex justify-center py-10 text-stone-500">
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row items-center gap-5 transition-all hover:shadow-md ${
                    editingProduct?.id === product.id
                      ? "ring-2 ring-stone-400 bg-stone-50"
                      : ""
                  }`}
                >
                  {/* รูปภาพ */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-stone-200">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-stone-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* ข้อมูล */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-stone-800 text-lg">
                      {product.name}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-1">
                      {product.description || "-"}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md font-bold">
                        ฿{product.price}
                      </span>
                      {product.is_custom && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ปุ่มจัดการ */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(product)}
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 font-medium transition-colors disabled:opacity-50"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="text-center py-10 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200">
                  ยังไม่มีสินค้าในร้าน
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
