import fetch from 'node-fetch'  
let handler = async (m, { conn, text, usedPrefix, command }) => {  

  let lang = global.db.data.users[m.sender].language  
  if (!text) throw '✳️ Debes escribir un mensaje para que el bot responda.'  
  m.react('🗣️')   

  try {   
    let res = await fetch('https://api.simsimi.vn/v1/simtalk', {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
      body: `text=${encodeURIComponent(text)}&lc=${lang}&key=`  
    })  
    let json = await res.json()  
    m.reply(json.message.replace(/simsimi/gi, botName), null, fwc)  
  } catch {  
    m.reply('❎ Intenta de nuevo más tarde. La API de SimSimi no está disponible.')  
  }  

}  
handler.help = ['bot']  
handler.tags = ['game']  
handler.command = ['bot', 'simi']   
handler.group = true  
export default handler
