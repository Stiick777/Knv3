import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

//BETA: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
global.botNumber = '' //Ejemplo: 573218138672

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
// <-- Número @s.whatsapp.net -->
  ['5216645011701', 'Stiven', true],
  ['573028488839'],
  ['573204545069'],
  [''], 
  [''],
  
// <-- Número @lid -->
  ['35090453283048', 'Destroy', true],
  []
];

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.mods = []
global.suittag = [] 
global.prems = []

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '2.2.5'
global.nameqr = 'KanBot 
global.namebot = `✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰`
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 
global.yukiJadibts = true

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.packsticker = ``
global.packname = `✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰`
global.botname = `✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰`
global.wm = `✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰`
global.author = `《 𝙺𝚊𝚗𝙱𝚘𝚝 》\n【 By Stiiven 】 `;
global.dev = 'Provided by Stiiven'
global.textbot = '✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰'
global.etiqueta = '✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.gp4 = 'https://chat.whatsapp.com/HDoyT3SlpYzBlpawlWNpKw' //Grupo Oficial 
global.gp1 = 'https://chat.whatsapp.com/HDoyT3SlpYzBlpawlWNpKw' //Grupo 
global.gp2 = 'https://whatsapp.com/channel/0029VakhAHc5fM5hgaQ8ed2N'//
global.comunidad1 = 'https://chat.whatsapp.com/HDoyT3SlpYzBlpawlWNpKw' //Comunidad Megumin
global.channel = 'https://whatsapp.com/channel/0029VakhAHc5fM5hgaQ8ed2N' //Canal Oficial

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.imagen3 = fs.readFileSync('./src/menus/Menu3.jpg');
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: '✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰', orderTitle: 'Bang',  sellerJid: '0@s.whatsapp.net'}}}
global.ch = {
  ch1: '120363318891913110@newsletter',
  ch2: '120363318891913110@newsletter',
  }
global.multiplier = 60

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment   

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
