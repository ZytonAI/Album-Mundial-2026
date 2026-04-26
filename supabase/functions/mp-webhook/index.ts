import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    // Also handle JSON body (MP sends both styles)
    let paymentId = id
    if (!paymentId && req.method === 'POST') {
      try {
        const body = await req.json()
        paymentId = body?.data?.id || body?.id
      } catch {}
    }

    if (topic !== 'payment' && topic !== 'merchant_order') {
      return new Response('ok', { status: 200 })
    }
    if (!paymentId) {
      return new Response('missing id', { status: 400 })
    }

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) {
      return new Response('MP_ACCESS_TOKEN no configurado', { status: 500 })
    }

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    })
    const payment = await paymentRes.json()

    if (payment.status !== 'approved') {
      return new Response('ok — pago no aprobado', { status: 200 })
    }

    const userId = payment.external_reference
    if (!userId) {
      return new Response('missing external_reference', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      is_premium: true,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      return new Response(`supabase error: ${error.message}`, { status: 500 })
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    return new Response(`error: ${err.message}`, { status: 500 })
  }
})
