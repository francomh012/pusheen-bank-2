import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Las credenciales vienen de variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciales de Supabase no configuradas. Verifica tu .env')
    throw new Error('Supabase configuration missing')
}

export const supabase = createClient(supabaseUrl, supabaseKey)