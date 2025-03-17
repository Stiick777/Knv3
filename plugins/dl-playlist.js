
import yts from 'yt-search';
let handler = async (m, { conn, usedPrefix, text, args, command }) => {
    if (!text) throw `✳️ ${mssg.example} *${usedPrefix + command}* Lil Peep hate my life`;
    m.react('📀');
    
    let result = await yts(text);
    let ytres = result.videos;
    

    let listSections = [];
    for (let index in ytres) {
        let v = ytres[index];
        listSections.push({
            title: `${index}┃ ${v.title}`,
            rows: [
                {
                    header: '🎶 MP3',
                    title: "",
                    description: `▢ ⌚ *${mssg.duration}:* ${v.timestamp}\n▢ 👀 *${mssg.views}:* ${v.views}\n▢ 📌 *${mssg.title}* : ${v.title}\n▢ 📆 *${mssg.aploud}:* ${v.ago}\n`, 
                    id: `${usedPrefix}yta ${v.url}`
                },
                {
                    header: "🎥 MP4",
                    title: "" ,
                    description: `▢ ⌚ *${mssg.duration}:* ${v.timestamp}\n▢ 👀 *${mssg.views}:* ${v.views}\n▢ 📌 *${mssg.title}* : ${v.title}\n▢ 📆 *${mssg.aploud}:* ${v.ago}\n`, 
                    id: `${usedPrefix}ytv ${v.url}`
                }
            ]
        });
    }

    await conn.sendList(m.chat, '  ≡ *YT-SEARCH MUSIC*🔎', `\n 📀 Resultados de: *${text}*\n\nKanBot by Stiiven`, `Click Aqui`, ytres[0].image, listSections, m);
};

handler.help = ['yts']
handler.tags = ['dl']
handler.command = ['yts', 'ytsearch'] 
handler.disabled = false
handler.group = true

export default handler
