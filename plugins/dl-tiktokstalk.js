import axios from 'axios'

let handler = async (m, { conn, text, args }) => {	
 if (!text) throw `✳️ ${mssg.noUsername}`  
 try {  	
  let pon = await axios.get(`https://skynex.boxmine.xyz/docs/stalk/tiktok?username=${text}&apikey=Dylux`)
  let res = await pon.data;
    
  let txt = `
┌──「 *TIKTOK STALK* 
▢ *🔖${mssg.name}:* ${res.data.nickname}
▢ *🔖${mssg.username}:* ${res.data.username}
▢ *👥${mssg.followers}:* ${res.data.followers}
▢ *🫂${mssg.follows}:* ${res.data.following}
▢ *📌${mssg.desc}:* ${res.data.description}
▢ *🔗${mssg.link}:* https://tiktok.com/@${res.data.username}
└────────────`
	 
await conn.sendFile(m.chat, res.data.avatar, 'tt.png', txt, m)
} catch {
  m.reply(`✳️ ${mssg.error}`)
}

}
handler.help = ['tiktokstalk']
handler.tags = ['dl']
handler.command = /^t(tstalk|iktokstalk)$/i

export default handler;
