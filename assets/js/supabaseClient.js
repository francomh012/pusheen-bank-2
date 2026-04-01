import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Credenciales - obtenidas de variables de entorno O hardcodeadas temporalmente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfxtbppffijltwucqewz.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHRicHBmZmlqbHR3dWNxZXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTgyMzksImV4cCI6MjA5MDYzNDIzOX0.7JQ4UpVt0Kl2pcO-fgdOJNwtcndWmLw55imPqDON568'

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciales de Supabase no configuradas')
    throw new Error('Supabase configuration missing')
}

export const supabase = createClient(supabaseUrl, supabaseKey)