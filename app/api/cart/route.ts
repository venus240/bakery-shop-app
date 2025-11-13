import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const fileName = `cakes/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type, // ระบุ content type ให้ถูกต้องด้วย
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { publicUrl } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path).data

  return NextResponse.json({ url: publicUrl })
}
