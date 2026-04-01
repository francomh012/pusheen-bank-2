import { supabase } from './supabaseClient.js';

let selectedUser = "";

// 1. Seleccionar Perfil (esto se activa al tocar la cara de Pusheen)
window.selectProfile = (user) => {
    selectedUser = user;
    document.getElementById('profile-selection').style.display = 'none';
    document.getElementById('login-title').innerText = `Hola, ${user} ✨`;
    document.getElementById('password-area').style.display = 'block';
};

// 2. Volver a la selección
window.backToProfiles = () => {
    document.getElementById('profile-selection').style.display = 'flex';
    document.getElementById('password-area').style.display = 'none';
    document.getElementById('login-title').innerText = "¿Quién eres hoy? 🐾";
};

// 3. El intento de entrar (esto usa el SQL de arriba)
window.attemptLogin = async () => {
    const pass = document.getElementById('pass-input').value;
    
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', selectedUser)
        .eq('password', pass)
        .single();

    if (data) {
        localStorage.setItem('pusheen_user', JSON.stringify(data));
        window.location.reload(); 
    } else {
        alert("¡Miau! Contraseña incorrecta ❌");
    }
};

// 4. Lógica al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('pusheen_user');
    if (session) {
        const user = JSON.parse(session);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('user-name-display').innerText = user.username;
        document.getElementById('user-coins').innerText = user.wallet_coins;
    }
});