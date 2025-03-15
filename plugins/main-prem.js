
let handler = async(m, { conn, usedPrefix, command }) => {
	
  let pre = `*≡ ALQUILER BOT Y PREMIUM*\n
▢ Grupo / 30 Días 
  *3$*
_El bot se une a 1 grupo por un mes_
      
▢ Premium
  *2$* = 30 Dias
  *15$* = Permanente
_Diamantes ilimitados + Desbloquea todos los comandos premium_
  
▢ Premium + Grupo / 30 Dias
  *4$*
_Obtienes premium y el bot se une a un grupo_

▢ *PayPal*
${fgpyp}
▢ *Owner*
wa.me/${global.owner[1]}
`
  let img = 'https://i.ibb.co/q0RXdYW/prem2.jpg'
     //conn.sendButton(m.chat, pre, msg.ig(), img, [['✆ Owner', `${usedPrefix}fgowner`]],m)
     conn.sendFile(m.chat, img, 'img.jpg', pre, m, null, rpl)
}
handler.help = ['premium']
handler.tags = ['main']
handler.command = ['alquiler', 'premium', 'alquilar']

export default handler
