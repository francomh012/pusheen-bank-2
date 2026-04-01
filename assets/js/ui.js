/**
 * ui.js
 * Maneja la renderización y actualización de la interfaz
 * Se comunica con gameState y auth
 */

import { gameState } from './gameState.js'
import { loginUser, updatePassword, updateUserStat } from './auth.js'

// ============== MOSTRAR/OCULTAR PANTALLAS ==============

export function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex'
    document.getElementById('game-screen').style.display = 'none'
}

export function showGameScreen() {
    document.getElementById('login-screen').style.display = 'none'
    document.getElementById('game-screen').style.display = 'block'
    updateGameUI()
}

export function showGameSection() {
    document.getElementById('bank-section').style.display = 'none'
}

export function showBankSection() {
    document.getElementById('bank-section').style.display = 'block'
}

// ============== ACTUALIZAR UI ==============

export function updateGameUI() {
    const user = gameState.getCurrentUser()
    if (!user) return

    document.getElementById('user-name-display').innerText = user.username
    document.getElementById('user-coins').innerText = user.wallet_coins
    document.getElementById('total-bank-coins').innerText = user.wallet_coins

    updateStatsUI(user)
}

function updateStatsUI(user) {
    const hungerPercent = Math.max(0, Math.min(100, user.hunger || 50))
    const happinessPercent = Math.max(0, Math.min(100, user.happiness || 50))

    document.getElementById('bar-hunger').style.width = `${hungerPercent}%`
    document.getElementById('bar-happiness').style.width = `${happinessPercent}%`
}

// ============== LOGIN FLOW ==============

export function setupLoginHandlers() {
    // Seleccionar perfil
    document.querySelectorAll('.profile-item').forEach(item => {
        item.addEventListener('click', async () => {
            const username = item.dataset.username
            selectProfile(username)
        })
    })

    // Botón "Atrás"
    document.getElementById('back-btn')?.addEventListener('click', backToProfiles)

    // Botón "Entrar"
    document.getElementById('login-btn')?.addEventListener('click', attemptLogin)

    // Botón "Guardar y Entrar"
    document.getElementById('register-btn')?.addEventListener('click', saveNewPassword)

    // Input de contraseña (Enter para enviar)
    document.getElementById('pass-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin()
    })

    document.getElementById('new-pass-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveNewPassword()
    })
}

export function selectProfile(username) {
    gameState.selectProfile(username)
    
    document.getElementById('profile-selection').style.display = 'none'
    document.getElementById('login-title').innerText = `Hola, ${username} ✨`
    document.getElementById('password-area').style.display = 'block'
    
    document.getElementById('pass-input').value = ''
    document.getElementById('pass-input').focus()
}

export function backToProfiles() {
    gameState.selectProfile(null)
    
    document.getElementById('profile-selection').style.display = 'flex'
    document.getElementById('password-area').style.display = 'none'
    document.getElementById('create-password-area').style.display = 'none'
    document.getElementById('login-title').innerText = '¿Quién eres hoy? 🐾'
}

export async function attemptLogin() {
    const username = gameState.getSelectedProfile()
    const password = document.getElementById('pass-input').value

    if (!username || !password) {
        showAlert('Por favor ingresa contraseña', 'error')
        return
    }

    try {
        setLoadingState(true)

        // Intentar login
        const { user, isFirstLogin } = await loginUser(username, password)

        // Si es primer login, mostrar pantalla de crear contraseña
        if (isFirstLogin) {
            document.getElementById('password-area').style.display = 'none'
            document.getElementById('create-password-area').style.display = 'block'
            document.getElementById('new-pass-input').value = ''
            document.getElementById('new-pass-input').focus()
            setLoadingState(false)
            return
        }

        // Si contraseña es correcta, guardar en estado
        gameState.setCurrentUser(user)
        showGameScreen()
        setLoadingState(false)

    } catch (err) {
        setLoadingState(false)
        showAlert('❌ ' + err.message, 'error')
        console.error('Login error:', err)
    }
}

export async function saveNewPassword() {
    const username = gameState.getSelectedProfile()
    const newPassword = document.getElementById('new-pass-input').value

    if (!newPassword) {
        showAlert('Ingresa una contraseña', 'error')
        return
    }

    if (newPassword.length < 4) {
        showAlert('Mínimo 4 caracteres', 'error')
        return
    }

    try {
        setLoadingState(true)

        // Actualizar contraseña del usuario existente
        const user = await updatePassword(username, newPassword)

        // Guardar en estado
        gameState.setCurrentUser(user)

        // Mostrar pantalla de juego
        showGameScreen()
        setLoadingState(false)

    } catch (err) {
        setLoadingState(false)
        showAlert('❌ ' + err.message, 'error')
        console.error('Register error:', err)
    }
}

// ============== GAME HANDLERS ==============

export function setupGameHandlers() {
    // Botón logout
    document.getElementById('logout-btn')?.addEventListener('click', logout)

    // Botón Pusheen
    document.getElementById('pusheen-pet')?.addEventListener('click', petInteraction)

    // Navegación
    document.getElementById('play-btn')?.addEventListener('click', showGameSection)
    document.getElementById('journey-btn')?.addEventListener('click', showGameSection)
    document.getElementById('bank-btn')?.addEventListener('click', showBankSection)
    document.getElementById('feed-btn')?.addEventListener('click', feedPusheen)

    // Botón volver del banco
    document.getElementById('bank-back-btn')?.addEventListener('click', showGameSection)
}

export function logout() {
    gameState.clear()
    showLoginScreen()
    backToProfiles()
}

export async function petInteraction() {
    const user = gameState.getCurrentUser()
    if (!user) return

    const petImg = document.getElementById('pusheen-pet')
    
    // Cambiar GIF
    const originalSrc = petImg.src
    petImg.src = 'assets/img/pusheen_2.gif'
    
    // Efecto de corazones
    spawnHearts()

    // Subir felicidad
    try {
        const newHappiness = Math.min(100, user.happiness + 5)
        gameState.updateUserStat('happiness', newHappiness)
        await updateUserStat(user.username, 'happiness', newHappiness)
        updateGameUI()
    } catch (err) {
        console.error('Error actualizando felicidad:', err)
    }

    // Volver al GIF normal
    setTimeout(() => {
        petImg.src = originalSrc
    }, 2000)
}

export async function feedPusheen() {
    const user = gameState.getCurrentUser()
    if (!user) return

    try {
        const newHunger = Math.max(0, user.hunger - 20)
        gameState.updateUserStat('hunger', newHunger)
        await updateUserStat(user.username, 'hunger', newHunger)
        
        showAlert('🍰 ¡Pusheen comió feliz!', 'success')
        updateGameUI()
    } catch (err) {
        console.error('Error alimentando:', err)
        showAlert('Error al alimentar', 'error')
    }
}

// ============== UTILIDADES ==============

function spawnHearts() {
    // TODO: Implementar animación de corazones
    console.log('💖 Corazones flotando...')
}

function setLoadingState(loading) {
    // Deshabilitar botones si es necesario
    const buttons = document.querySelectorAll('button')
    buttons.forEach(btn => btn.disabled = loading)
    
    if (loading) {
        console.log('⏳ Cargando...')
    }
}

export function showAlert(message, type = 'info') {
    // Usar alert() por ahora, pero aquí puedes implementar un modal custom
    if (type === 'error') {
        alert(message)
    } else if (type === 'success') {
        console.log('✅ ' + message)
        alert(message)
    } else {
        console.log('ℹ️ ' + message)
    }
}