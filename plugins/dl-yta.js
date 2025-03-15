
import fetch from 'node-fetch'
let handler = async (m, { conn, text, args, isPrems, isOwner, usedPrefix, command }) => {
  if (!args || !args[0]) throw `✳️ ${mssg.example} :\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`
  if (!args[0].match(/youtu/gi)) throw `❎ ${mssg.noLink('YouTube')}`
   m.react(rwait)
 let chat = global.db.data.chats[m.chat]

 try {
 
		let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: args[0] }, 'apikey'))
		let data = await res.json()
		
		let { title, dl_url, thumb, size, sizeB, duration } = data.result
		conn.sendFile(m.chat, dl_url, title + '.mp3', `
 ≡  *FG YTDL*
  
▢ *📌${mssg.title}* : ${title}
`.trim(), m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument })
		m.react(done)

        } catch {
			await m.reply(`❎ ${mssg.error}`)
} 


}
handler.help = ['ytmp3 <url>']
handler.tags = ['dl']
handler.command = ['ytmp3', 'fgmp3'] 
handler.diamond = false

export default handler
