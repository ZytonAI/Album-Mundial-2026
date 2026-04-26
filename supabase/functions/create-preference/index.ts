import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id requerido' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: 'MP_ACCESS_TOKEN no configurado' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const rawUrl = Deno.env.get('APP_URL') || 'https://album-mundial-2026.vercel.app'
    const APP_URL = rawUrl.replace(/\/+$/, '') // quita barras finales
    const preference = {
      items: [{
        title: 'Álbum Mundial 2026 — Premium',
        unit_price: 7000,
        quantity: 1,
        currency_id: 'COP',
      }],
      external_reference: user_id,
      payer: { email: email || '' },
      back_urls: {
        success: `${APP_URL}/?success=1`,
        failure: `${APP_URL}/?cancelled=1`,
        pending: `${APP_URL}/?pending=1`,
      },
      auto_return: 'approved',
      notification_url: 'https://liquqsfnooegfioqkfvt.supabase.co/functions/v1/mp-webhook',
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    const mpData = await mpRes.json()

    if (!mpRes.ok) {
      return new Response(JSON.stringify({ error: mpData.message || 'Error de MercadoPago' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ init_point: mpData.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
