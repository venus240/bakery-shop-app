"use client"; 

 import { useState } from "react"; 
 import { useAlert } from "@/components/AlertProvider"; 

 export default function ContactPage() { 
   const [form, setForm] = useState({ name: "", email: "", message: "" }); 
   const { showAlert } = useAlert(); 

   const handleSubmit = (e: React.FormEvent) => { 
     e.preventDefault(); 
     showAlert( 
       "ส่งข้อความเรียบร้อย", 
       `ขอบคุณครับคุณ ${form.name} เราได้รับข้อความแล้ว! (ระบบจำลอง)`, 
       "success" 
     ); 
     setForm({ name: "", email: "", message: "" }); 
   }; 

   return ( 
    // ✅ พื้นหลัง: เปลี่ยนเป็นสีครีมอ่อน (amber-50)
     <div className="min-h-screen bg-amber-50 py-12 px-4"> 
       <div className="container mx-auto max-w-5xl"> 
          
         <div className="text-center mb-12"> 
           <h1 className="text-4xl font-bold text-amber-900 mb-3">ติดต่อเรา</h1> 
           <p className="text-amber-600 text-lg">สอบถามข้อมูล สั่งทำเค้ก หรือติชมบริการ</p> 
         </div> 

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10"> 
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-200 h-fit"> 
             <h3 className="text-2xl font-bold text-amber-900 mb-6">ช่องทางการติดต่อ</h3> 
              
             <div className="space-y-6"> 
               <div className="flex items-start gap-4"> 

                 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">📍</div> 
                 <div> 

                   <h4 className="font-bold text-amber-800">ที่อยู่ร้าน</h4> 

                   <p className="text-amber-700 text-sm mt-1"> 
                     123 ถนนสุขุมวิท แขวงคลองเตย <br /> เขตคลองเตย กรุงเทพมหานคร 10110 
                   </p> 
                 </div> 
               </div> 

               <div className="flex items-center gap-4"> 


                 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">📞</div> 
                 <div> 

                   <h4 className="font-bold text-amber-800">เบอร์โทรศัพท์</h4> 

                   <p className="text-amber-700 text-sm mt-1">081-234-5678</p> 
                 </div> 
               </div> 

               <div className="flex items-center gap-4"> 


                 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">💬</div> 
                 <div> 

                   <h4 className="font-bold text-amber-800">LINE Official</h4> 

                   <p className="text-amber-700 text-sm mt-1">@baankanom</p> 
                 </div> 
               </div> 

               <div className="flex items-center gap-4"> 

                 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">⏰</div> 
                 <div> 

                   <h4 className="font-bold text-amber-800">เวลาทำการ</h4> 

                   <p className="text-amber-700 text-sm mt-1">เปิดทุกวัน: 08:00 - 20:00 น.</p> 
                 </div> 
               </div>
             </div>

             {/* แผนที่จำลอง */}

             <div className="mt-8 h-48 w-full bg-amber-200 rounded-xl flex items-center justify-center overflow-hidden relative"> 
                <div className="absolute text-amber-600 font-bold">🗺️ แผนที่ Google Maps</div>
                {/* ถ้าจะใส่ iframe ของ Google Maps จริงๆ ให้ใส่ตรงนี้ */}
             </div>
           </div>

           {/* ฝั่งขวา: ฟอร์มส่งข้อความ */}
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-200">
             <h3 className="text-2xl font-bold text-amber-900 mb-6">ส่งข้อความถึงเรา</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-amber-800 mb-1">ชื่อของคุณ</label>
                 <input 
                   type="text"
                   required
                   value={form.name}
                   onChange={(e) => setForm({...form, name: e.target.value})} 

    // ✅ Input: พื้นหลังครีม (amber-50), ขอบน้ำตาลอ่อน (amber-300), Focus Ring น้ำตาล (amber-500), ข้อความน้ำตาลเข้ม (amber-900)
                   className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-amber-900" 
                   placeholder="ชื่อ-นามสกุล" 
                 /> 
               </div> 
               <div> 
                 <label className="block text-sm font-bold text-amber-800 mb-1">อีเมล</label> 
                 <input  
                   type="email"  
                   required 
                   value={form.email} 
                   onChange={(e) => setForm({...form, email: e.target.value})} 

    // ✅ Input: พื้นหลังครีม (amber-50), ขอบน้ำตาลอ่อน (amber-300), Focus Ring น้ำตาล (amber-500), ข้อความน้ำตาลเข้ม (amber-900)
                   className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-amber-900" 
                   placeholder="example@email.com" 
                 /> 
               </div> 
               <div> 

                 <label className="block text-sm font-bold text-amber-800 mb-1">ข้อความ</label> 
                 <textarea  
                   required 
                   rows={5} 
                   value={form.message} 
                   onChange={(e) => setForm({...form, message: e.target.value})} 

    // ✅ Input: พื้นหลังครีม (amber-50), ขอบน้ำตาลอ่อน (amber-300), Focus Ring น้ำตาล (amber-500), ข้อความน้ำตาลเข้ม (amber-900)
                   className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-amber-900" 
                   placeholder="พิมพ์ข้อความของคุณที่นี่..." 
                 /> 
               </div> 
               <button  
                 type="submit"  

    // ✅ ปุ่ม: พื้นหลังน้ำตาลเข้ม (amber-900), ข้อความครีม (amber-50), Hover น้ำตาลกลาง (amber-800)
                 className="w-full py-3 bg-amber-900 text-amber-50 font-bold rounded-xl shadow-md hover:bg-amber-800 transition-all transform active:scale-95" 
               > 
                 ส่งข้อความ 
               </button> 
             </form> 
           </div> 

         </div> 
       </div> 
     </div> 
   ); 
 }