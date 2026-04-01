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

// contraseña 

import { supabase } from './supabaseClient.js';

async function handleLogin() {
    const user = document.getElementById('user-input').value;
    const pass = document.getElementById('pass-input').value;

    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', user)
        .eq('password', pass) // Validación simple
        .single();

    if (data) {
        startPusheenGame(data);
    } else {
        alert("¡Miau! Contraseña o usuario incorrecto 🐾");
    }
}

function startPusheenGame(player) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Al hacerle clic a Pusheen, gana 1 moneda (como Pou)
    document.getElementById('pusheen-pet').onclick = () => {
        playMeowSound();
        spawnHeartEffect();
        updateCoinsInDB(1);
    };
}