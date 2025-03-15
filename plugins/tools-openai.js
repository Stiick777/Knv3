import fetch from 'node-fetch'
let handler = async (m, { conn, text }) => {
if (!text) throw `✳️ ${mssg.notext}`
m.react('💬')

    let syst = `Eres Senna Bot, un gran modelo de lenguaje entrenado por OpenAI. Siga cuidadosamente las instrucciones del usuario. Responde usando Markdown.`
     try {
       let gpt = await fetch(`https://skynex.boxmine.xyz/docs/ai/myprompt?text=${text}&prompt=${syst}&apikey=Dylux`)
        let res = await gpt.json()
        await m.reply(res.answer, null, fwc)
	} catch {
        m.reply(`❎ Error: intenta más tarde`)
     }
}
handler.help = ['ai <text>']
handler.tags = ['tools']
handler.command = ['ia', 'ai', 'chatgpt', 'openai', 'gpt']

export default handler
