let cooldowns = {}

let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let senderId = m.sender
    let senderName = conn.getName(senderId)
    let tiempo = 5 * 60 * 1000 // 5 minutos en milisegundos

    // Verificar cooldown
    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo) {
        let tiempoRestante = Math.ceil((cooldowns[senderId] + tiempo - Date.now()) / 1000)
        return m.reply(`💡 Ya has cometido un crimen recientemente, espera ⏱️ *${segundosAHMS(tiempoRestante)}* para intentarlo de nuevo.`)
    }
    cooldowns[senderId] = Date.now()

    // Asegurar que el usuario tenga el campo de diamantes
    users[senderId].diamond = users[senderId].diamond || 0

    let randomUserId = obtenerVictima(users, senderId)
    if (!randomUserId) return m.reply("🚫 No hay suficientes usuarios disponibles para robar.")

    users[randomUserId].diamond = users[randomUserId].diamond || 0

    let minAmount = 15, maxAmount = 50
    let amountTaken = numeroAleatorio(minAmount, maxAmount)
    let resultado = Math.floor(Math.random() * 3) // 0: éxito total, 1: atrapado, 2: éxito parcial

    switch (resultado) {
        case 0: { // Éxito total
            amountTaken = Math.min(amountTaken, users[randomUserId].diamond) // No puede robar más de lo que tiene la víctima
            users[senderId].diamond += amountTaken
            users[randomUserId].diamond = Math.max(0, users[randomUserId].diamond - amountTaken)
            conn.sendMessage(m.chat, {
                text: `🌥️ ¡Lograste cometer tu crimen con éxito! Robaste *${amountTaken} 💎 Diamantes* a @${randomUserId.split("@")[0]}.`,
                contextInfo: { mentionedJid: [randomUserId] }
            }, { quoted: m })
            break
        }
        case 1: { // Fallo, el usuario es atrapado
            let amountSubtracted = Math.min(numeroAleatorio(minAmount, maxAmount), users[senderId].diamond)
            users[senderId].diamond = Math.max(0, users[senderId].diamond - amountSubtracted)
            conn.reply(m.chat, `🔰 No fuiste cuidadoso y te atraparon. Perdiste *${amountSubtracted} 💎 Diamantes*`, m)
            break
        }
        case 2: { // Éxito parcial
            let smallAmountTaken = Math.min(numeroAleatorio(minAmount, maxAmount), users[randomUserId].diamond / 2)
            smallAmountTaken = Math.floor(smallAmountTaken) // Asegurar número entero
            users[senderId].diamond += smallAmountTaken
            users[randomUserId].diamond = Math.max(0, users[randomUserId].diamond - smallAmountTaken)
            conn.sendMessage(m.chat, {
                text: `⚡ Fuiste descubierto, pero lograste escapar con *${smallAmountTaken} 💎 Diamantes* de @${randomUserId.split("@")[0]}.`,
                contextInfo: { mentionedJid: [randomUserId] }
            }, { quoted: m })
            break
        }
    }

    global.db.write()
}

handler.tags = ['econ']
handler.help = ['crimen']
handler.command = ['crimen', 'crime']
handler.group = true

export default handler

// Función para obtener una víctima aleatoria diferente del atacante
function obtenerVictima(users, senderId) {
    let ids = Object.keys(users).filter(id => id !== senderId)
    return ids.length ? ids[Math.floor(Math.random() * ids.length)] : null
}

// Generador de números aleatorios en un rango
function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Formatear el tiempo restante
function segundosAHMS(segundos) {
    let minutos = Math.floor(segundos / 60)
    let segundosRestantes = segundos % 60
    return `${minutos} minutos y ${segundosRestantes} segundos`
}