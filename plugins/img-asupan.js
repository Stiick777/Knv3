 
import fetch from "node-fetch"
let handler = async (m, { conn, args, usedPrefix, command }) => {
    
      
     let img = await conn.getFile(global.API('fgmods', '/api/img/asupan-la', { }, 'apikey'))
    let asupan = img.data

  
    conn.sendFile(m.chat, asupan, 'vid.mp4', `✅ ${mssg.result}`, m)

    //conn.sendButton(m.chat, `✅ ${mssg.result}`, mssg.ig, asupan, [['SIGUIENTE', `${usedPrefix + command}`]], m)
  
    
    m.react('🤓')
  
}
handler.help = ['tvid']
handler.tags = ['img']
handler.command = ['asupan', 'tvid', 'videos', 'vid', 'video']
handler.premium = false
handler.diamond = true
 
export default handler
