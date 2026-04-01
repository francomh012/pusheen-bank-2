/**
 * main.js
 * Punto de entrada - orquesta toda la aplicación
 * La mayoría de la lógica está en los módulos específicos
 */

import { gameState } from './gameState.js'
import { showLoginScreen, showGameScreen, setupLoginHandlers, setupGameHandlers } from './ui.js'

/**
 * Inicializa toda la aplicación cuando carga el DOM
 */
function initializeApp() {
    console.log('🎮 Iniciando Pusheen Bank...')

    // Restaurar estado desde localStorage
    gameState.init()

    // Conectar event listeners
    setupLoginHandlers()
    setupGameHandlers()

    // Mostrar pantalla correspondiente
    if (gameState.isAuthenticated()) {
        console.log('✅ Sesión activa, mostrando juego...')
        showGameScreen()
    } else {
        console.log('📝 Sin sesión, mostrando login...')
        showLoginScreen()
    }
}

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', initializeApp)

// Exportar para debugging
window.__DEBUG__ = {
    gameState,
    showLoginScreen,
    showGameScreen
}