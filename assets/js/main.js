import { supabase } from './supabaseClient.js'

// Escuchar cambios en la tabla 'bank'
supabase
  .channel('schema-db-changes')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'bank' }, 
    (payload) => {
      console.log('¡El banco cambió!', payload.new)
      // Aquí actualizas el texto de las monedas en tu pantalla principal
      document.getElementById('total-bank-coins').textContent = payload.new.total_coins;
    }
  )
  .subscribe()