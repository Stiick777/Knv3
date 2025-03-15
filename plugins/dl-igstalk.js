
import fetch from 'node-fetch'
let handler= async (m, { conn, args, text, usedPrefix, command }) => {
	
    if (!args[0]) throw `✳️ ${mssg.noUsername}\n\n📌${mssg.example} : ${usedPrefix + command} fg98_ff` 
    try {
    let pon = await fetch(global.API('fgmods', '/api/search/igstalk', { username: args[0] }, 'apikey'))
    let res = await pon.json()
    let te = `
┌──「 *STALKING* 
▢ *🔖${mssg.name}:* ${res.result.name} 
▢ *🔖${mssg.username}:* ${res.result.username}
▢ *👥${mssg.followers}:* ${res.result.followers}
▢ *🫂${mssg.follows}:* ${res.result.following}
▢ *📌${mssg.bio}:* ${res.result.description}
▢ *🏝️${mssg.posts}:* ${res.result.posts}
▢ *🔗${mssg.link}:* https://instagram.com/${res.result.username.replace(/^@/, '')}
└────────────`

     await conn.sendFile(m.chat, res.result.profile, 'igstalk.png', te, m)
    } catch {
        m.reply(`✳️ ${mssg.error}`)
      }
     
}
handler.help = ['igstalk']
handler.tags = ['dl']
handler.command = ['igstalk'] 

export default handler
