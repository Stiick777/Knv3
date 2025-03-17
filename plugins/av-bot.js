
let handler = async (m, { conn}) => {

let name = conn.getName(m.sender)

conn.sendButton(m.chat, `${mssg.hi} *${name}*\n`, mssg.ig, null, [
      ['⦙☰ Menu', '/help'],
      ['⦙☰ Menu 2', '/menu2'],
      [`⌬ ${mssg.gp}s`, '/grupos']
    ], m) 
} 

handler.customPrefix = /^(bot|senna)$/i
handler.command = new RegExp

export default handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}
