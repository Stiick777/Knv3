
import fetch from 'node-fetch'
let limit = 320
let handler = async (m, { conn, args, isPrems, isOwner, usedPrefix, command }) => {
	if (!args || !args[0]) throw `✳️ ${mssg.example} :\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`
    if (!args[0].match(/youtu/gi)) throw `❎ ${mssg.noLink('YouTube')}`
	 let chat = global.db.data.chats[m.chat]
	 m.react(rwait)  

try {
	    let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: args[0] }, 'apikey'))
		let data = await res.json()

	let { title, dl_url, thumb, size, sizeB, duration } = data.result
	let isLimit = limit * 1024 < sizeB 

 await conn.loadingMsg(m.chat, '📥 Descargando', ` ${isLimit ? `≡  *FG YTDL*\n\n▢ *⚖️${mssg.size}*: ${size}\n\n▢ _${mssg.limitdl}_ *+${limit} MB*` : '✅ Descarga Completada' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m)
 
  if(!isLimit) conn.sendFile(m.chat, dl_url, title + '.mp4', `
≡  *FG YTDL*

*📌${mssg.title}:* ${title}
*⚖️${mssg.size}:* ${size}
`.trim(), m, false, { asDocument: chat.useDocument })
	m.react(done) 
		
	} catch {
		await m.reply(`❎ ${mssg.error}`)
		} 
}
handler.help = ['ytmp4 <link yt>']
handler.tags = ['dl'] 
handler.command = ['ytmp4', 'fgmp4']
handler.diamond = false

export default handler
