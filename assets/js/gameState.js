/**
 * gameState.js
 * Objeto centralizado para manejar el estado de la aplicación
 * Evita variables globales sueltas y localStorage directo
 */

const STORAGE_KEY = 'pusheen_user'

export const gameState = {
    // Estado actual
    currentUser: null,
    selectedProfile: null,
    isLoggedIn: false,

    /**
     * Inicializa el estado desde localStorage
     */
    init() {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored)
                this.isLoggedIn = true
            } catch (err) {
                console.error('Error parsando usuario guardado:', err)
                localStorage.removeItem(STORAGE_KEY)
            }
        }
    },

    /**
     * Guarda el usuario actual en estado y localStorage
     * @param {Object} user - Datos del usuario
     */
    setCurrentUser(user) {
        if (!user || !user.username) {
            throw new Error('Usuario inválido')
        }
        this.currentUser = user
        this.isLoggedIn = true
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    },

    /**
     * Obtiene el usuario actual
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser
    },

    /**
     * Actualiza un stat del usuario en memoria
     * (Llama a auth.updateUserStat() para persistir en BD)
     * @param {string} stat - hunger, happiness, wallet_coins
     * @param {number} value
     */
    updateUserStat(stat, value) {
        if (!this.currentUser) {
            throw new Error('No hay usuario logueado')
        }

        let finalValue = value
        if (stat !== 'wallet_coins') {
            finalValue = Math.max(0, Math.min(100, value))
        }

        this.currentUser[stat] = finalValue
        this.saveCurrentUser()
    },

    /**
     * Actualiza múltiples stats a la vez
     * @param {Object} updates - { stat: value, ... }
     */
    updateMultipleStats(updates) {
        if (!this.currentUser) {
            throw new Error('No hay usuario logueado')
        }

        Object.entries(updates).forEach(([stat, value]) => {
            this.updateUserStat(stat, value)
        })
    },

    /**
     * Guarda el usuario actual en localStorage
     */
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser))
        }
    },

    /**
     * Limpia el estado y localStorage (logout)
     */
    clear() {
        this.currentUser = null
        this.selectedProfile = null
        this.isLoggedIn = false
        localStorage.removeItem(STORAGE_KEY)
    },

    /**
     * Selecciona un perfil durante login
     * @param {string} username
     */
    selectProfile(username) {
        this.selectedProfile = username
    },

    /**
     * Obtiene el perfil seleccionado
     * @returns {string|null}
     */
    getSelectedProfile() {
        return this.selectedProfile
    },

    /**
     * Verifica si hay usuario logueado
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.isLoggedIn && this.currentUser !== null
    }
}

// Inicializar al cargar el módulo
gameState.init()
