import { supabase } from './supabaseClient.js'

export let currentUser = null;

export async function loadUserData(username) {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .single()

    if (error) {
        console.error("Error cargando usuario:", error)
        return null
    }

    currentUser = data;
    return data;
}

// Función para actualizar monedas cuando gane en los juegos
export async function updateCoins(amount) {
    if (!currentUser) return;
    
    const newTotal = currentUser.wallet_coins + amount;
    
    const { error } = await supabase
        .from('players')
        .update({ wallet_coins: newTotal })
        .eq('username', currentUser.username)

    if (!error) currentUser.wallet_coins = newTotal;
}