 
let handler = async (m, { conn }) => {

m.reply(`
≡  *${botName}ᴮᴼᵀ ┃ SUPPORT*

◈ ━━━━━━━━━━━━━━━━━━━━ ◈
▢ Canal
${fgcanal}

▢ Grupo OFC
${bgp}

◈ ━━━━━━━━━━━━━━━━━━━━ ◈

 ▢ *PayPal*
• 

▢ *Dudas*
• wa.me/526645011701`)

}
handler.help = ['support']
handler.tags = ['main']
handler.command = ['grupos', 'groups', 'support'] 

export default handler
