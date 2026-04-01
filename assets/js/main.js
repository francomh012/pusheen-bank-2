import { supabase } from './supabaseClient.js';

let selectedUser = "";

window.selectProfile = (user) => {
    selectedUser = user;
    document.getElementById('profile-selection').style.display = 'none';
    document.getElementById('login-title').innerText = `Hola, ${user} ✨`;
    document.getElementById('password-area').style.display = 'block';
};

window.backToProfiles = () => {
    document.getElementById('profile-selection').style.display = 'flex';
    document.getElementById('password-area').style.display = 'none';
    document.getElementById('create-password-area').style.display = 'none';
    document.getElementById('login-title').innerText = "¿Quién eres hoy? 🐾";
};

window.attemptLogin = async () => {
    const pass = document.getElementById('pass-input').value;
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', selectedUser)
        .eq('password', pass)
        .single();

    if (data) {
        if (pass === 'crear123') {
            document.getElementById('password-area').style.display = 'none';
            document.getElementById('create-password-area').style.display = 'block';
        } else {
            localStorage.setItem('pusheen_user', JSON.stringify(data));
            window.location.reload(); 
        }
    } else {
        alert("¡Miau! Contraseña incorrecta ❌");
    }
};

window.saveNewPassword = async () => {
    const newPass = document.getElementById('new-pass-input').value;
    if (newPass.length < 4) {
        alert("Mínimo 4 caracteres");
        return;
    }
    const { error } = await supabase.from('players').update({ password: newPass }).eq('username', selectedUser);
    if (!error) {
        const { data } = await supabase.from('players').select('*').eq('username', selectedUser).single();
        localStorage.setItem('pusheen_user', JSON.stringify(data));
        window.location.reload();
    }
};

window.logout = () => {
    localStorage.removeItem('pusheen_user');
    window.location.reload();
};

window.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('pusheen_user');
    if (session) {
        const user = JSON.parse(session);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('user-name-display').innerText = user.username;
        document.getElementById('user-coins').innerText = user.wallet_coins;
        
        // Actualizar barras de estado
        document.getElementById('bar-hunger').style.width = `${user.hunger}%`;
        document.getElementById('bar-happiness').style.width = `${user.happiness}%`;
    }
});

// Al inicio de main.js
let interactionTimer;

window.petPusheen = () => {
    const petImg = document.getElementById('pusheen-pet');
    
    // Cambiar al GIF de "feliz/acariciado"
    petImg.src = 'assets/img/pusheen_2.gif';
    
    // Efecto visual de corazones (opcional)
    spawnHearts();

    // Volver al GIF normal después de 2 segundos
    clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => {
        petImg.src = 'assets/img/pusheen_1.gif';
    }, 2000);
    
    // Subir felicidad en la DB
    updateStat('happiness', 1);
};

// Función para actualizar stats en Supabase
async function updateStat(stat, amount) {
    const user = JSON.parse(localStorage.getItem('pusheen_user'));
    const newValue = Math.min(100, user[stat] + amount);
    
    await supabase.from('players').update({ [stat]: newValue }).eq('username', user.username);
}