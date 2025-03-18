import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk' 
import { fileURLToPath } from 'url' 

global.owner = [
  ['5216645011701', 'FG', true],
  ['573028488839'],
  ['']
] //Numeros de owner 

global.mods = [''] 
global.prems = ['']
global.botNumber = [''] 
global.APIs = { // API Prefix
  // name: 'https://website' 
  nrtm: 'https://fg-nrtm.ddns.net',
  fgmods: 'https://api.fgmods.xyz'
}
global.APIKeys = { // APIKey Here
  // 'https://website': 'apikey'
  'https://api.fgmods.xyz': 'm2XBbNvzn' //--- 100 de límite diario --- Regístrese en https://api.fgmods.xyz/
}

// Sticker WM
global.packname = '' 
global.author = '《 𝙺𝚊𝚗𝙱𝚘𝚝 》\n【 By Stiiven 】' 

//--info FG
global.botName = '✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰'
global.fgig = '' 
global.fgsc = '' 
global.fgyt = ''
global.fgpyp = ''
global.fglog = 'https://files.catbox.moe/j6ng7d.jpg' 

//--- Grupos WA
global.id_canal = '120363318891913110@newsletter' //-ID de canal de WhatsApp
global.fgcanal = 'https://whatsapp.com/channel/0029VakhAHc5fM5hgaQ8ed2N'
global.bgp = 'https://chat.whatsapp.com/C5xsN9KcmIs8O1wNeOkcX9'
global.bgp2 = 'https://chat.whatsapp.com/C5xsN9KcmIs8O1wNeOkcX9'
global.bgp3 = 'https://chat.whatsapp.com/C5xsN9KcmIs8O1wNeOkcX9' //--GP NSFW

global.wait = '⌛ _Cargando..._\n*▬▬▬▭*'
global.rwait = '⌛'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌' 
global.xmoji = '🔥' 

global.multiplier = 69 
global.maxwarn = '2' // máxima advertencias

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
