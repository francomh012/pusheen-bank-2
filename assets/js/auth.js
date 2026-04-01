import { supabase } from './supabaseClient.js'

// bcryptjs se importará cuando sea necesario (lazy loading)

/**
 * Hashea una contraseña usando bcryptjs
 * @param {string} password - Contraseña en plain text
 * @returns {Promise<string>} Contraseña hasheada
 */
export async function hashPassword(password) {
    if (password.length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres')
    }
    const bcrypt = await import('https://esm.sh/bcryptjs@2.4.3')
    return await bcrypt.hash(password, 8)
}

/**
 * Valida una contraseña contra su hash o contra contraseña plain text
 * (Soporta tanto contraseñas hasheadas como plain text para migración)
 * @param {string} password - Contraseña en plain text a validar
 * @param {string} hash - Hash almacenado en BD (puede ser bcrypt o plain text)
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
    try {
        const bcrypt = await import('https://esm.sh/bcryptjs@2.4.3')
        return await bcrypt.compare(password, hash)
    } catch (err) {
        // Si falla, intenta comparación directa (para contraseñas viejas en plain text)
        return password === hash
    }
}

/**
 * Busca un usuario por nombre
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
export async function getUserByUsername(username) {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('username', username)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // Usuario no encontrado
                return null
            }
            throw error
        }

        return data
    } catch (err) {
        console.error('❌ Error buscando usuario:', err)
        throw err
    }
}

/**
 * Intenta login con usuario y contraseña
 * Flujo:
 * 1. Si contraseña es "crear123" → Usuario nuevo, pedir nueva contraseña
 * 2. Si contraseña coincide → Login exitoso
 * 3. Si no coincide → Error
 * 
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{user: Object, isFirstLogin: boolean}>}
 * @throws {Error}
 */
export async function loginUser(username, password) {
    if (!username || !password) {
        throw new Error('Usuario y contraseña son requeridos')
    }

    try {
        const user = await getUserByUsername(username)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        // Si contraseña es "crear123", es primer login
        if (password === 'crear123' && user.password === 'crear123') {
            return { user, isFirstLogin: true }
        }

        // Comparar contraseña (soporta bcrypt y plain text)
        const isValid = await comparePassword(password, user.password)

        if (!isValid) {
            throw new Error('Contraseña incorrecta')
        }

        return { user, isFirstLogin: false }
    } catch (err) {
        console.error('❌ Error en login:', err.message)
        throw err
    }
}

/**
 * Actualiza la contraseña de un usuario existente (primer login)
 * @param {string} username
 * @param {string} newPassword
 * @returns {Promise<Object>} Usuario con contraseña actualizada
 */
export async function updatePassword(username, newPassword) {
    if (!newPassword || newPassword.length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres')
    }

    try {
        const hashedPassword = await hashPassword(newPassword)

        const { data, error } = await supabase
            .from('players')
            .update({ password: hashedPassword })
            .eq('username', username)
            .select()
            .single()

        if (error) {
            console.error('Error de Supabase:', error)
            throw new Error('Error al actualizar contraseña')
        }

        return data
    } catch (err) {
        console.error('❌ Error actualizando contraseña:', err.message)
        throw err
    }
}

/**
 * Registra un nuevo usuario (crear usuario nuevo desde cero)
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Datos del usuario creado
 * @throws {Error} Si el usuario ya existe
 */
export async function registerUser(username, password) {
    if (!username || !password) {
        throw new Error('Usuario y contraseña son requeridos')
    }

    if (password.length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres')
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await getUserByUsername(username)
        if (existingUser) {
            throw new Error('Este usuario ya existe')
        }

        // Hashear contraseña
        const hashedPassword = await hashPassword(password)

        // Crear usuario con valores iniciales
        const { data, error } = await supabase
            .from('players')
            .insert({
                username,
                password: hashedPassword,
                wallet_coins: 100,
                hunger: 100,
                happiness: 100,
                energy: 100,
                claimed_paws: []
            })
            .select()
            .single()

        if (error) {
            console.error('❌ Error de Supabase:', error)
            throw new Error('Error al crear el usuario')
        }

        return data
    } catch (err) {
        console.error('❌ Error en registro:', err.message)
        throw err
    }
}

/**
 * Actualiza un stat del usuario
 * @param {string} username
 * @param {string} stat - Nombre del stat (hunger, happiness, wallet_coins, energy)
 * @param {number} value - Nuevo valor
 * @returns {Promise<Object>} Datos actualizados
 */
export async function updateUserStat(username, stat, value) {
    const validStats = ['hunger', 'happiness', 'wallet_coins', 'energy']
    if (!validStats.includes(stat)) {
        throw new Error(`Stat inválido: ${stat}. Válidos: ${validStats.join(', ')}`)
    }

    // Clampear valores entre 0-100 (excepto monedas)
    let finalValue = value
    if (stat !== 'wallet_coins') {
        finalValue = Math.max(0, Math.min(100, value))
    } else {
        // Monedas no pueden ser negativas
        finalValue = Math.max(0, value)
    }

    try {
        const { data, error } = await supabase
            .from('players')
            .update({ [stat]: finalValue })
            .eq('username', username)
            .select()
            .single()

        if (error) throw error

        return data
    } catch (err) {
        console.error(`❌ Error actualizando ${stat}:`, err.message)
        throw err
    }
}

/**
 * Obtiene todos los datos actualizados del usuario
 * @param {string} username
 * @returns {Promise<Object>}
 */
export async function refreshUserData(username) {
    try {
        const user = await getUserByUsername(username)
        if (!user) {
            throw new Error('Usuario no encontrado')
        }
        return user
    } catch (err) {
        console.error('❌ Error refrescando datos:', err.message)
        throw err
    }
}