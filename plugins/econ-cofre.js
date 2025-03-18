const handler = async (m, { isPrems, conn }) => {  
  const time = global.db.data.users[m.sender].lastcofre + 86400000; // 24 Horas  
  if (new Date() - global.db.data.users[m.sender].lastcofre < 86400000) {  
    const tiempoRestante = msToTime(time - new Date());  
    const mensaje = `🎁 Ya reclamaste tu cofre\n⏰️ Regresa en: *${tiempoRestante}* para volver a reclamar`;  

    const fkontak = {  
      'key': {  
        'participants': '0@s.whatsapp.net',  
        'remoteJid': 'status@broadcast',  
        'fromMe': false,  
        'id': 'Halo',  
      },  
      'message': {  
        'contactMessage': {  
          'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,  
        },  
      },  
      'participant': '0@s.whatsapp.net',  
    };  

    return await conn.sendMessage(m.chat, { text: mensaje }, { quoted: fkontak });  
  }  

  const img = 'https://telegra.ph/file/62ba6688963b0ad407edd.png';  
  const dia = Math.floor(Math.random() * 30);  
  const tok = Math.floor(Math.random() * 10);  
  const ai = Math.floor(Math.random() * 4000);  
  const coin = Math.floor(Math.random() * 5000);  
  const diamond = Math.floor(Math.random() * 1000) + 1; // Diamantes aleatorios (1 - 1000)  

  global.db.data.users[m.sender].coin += coin;  
  global.db.data.users[m.sender].diamond += diamond; // Se suman diamantes al usuario  

  const texto = `  
╭━〔 ${global.botname} 〕⬣  
┃🎁 *¡Has obtenido un Cofre!*  
┃💰 *${coin} Coins*  
┃💎 *${diamond} Diamantes*  
╰━━━━━━━━━━━━⬣`;  

  await conn.sendFile(m.chat, img, 'cofre.jpg', texto, fkontak);  
  global.db.data.users[m.sender].lastcofre = new Date() * 1;  
};  

handler.help = ['cofre'];  
handler.tags = ['econ'];  
handler.command = ['coffer', 'cofre', 'abrircofre', 'cofreabrir'];  
handler.group = true;  
export default handler;  

function msToTime(duration) {  
  let seconds = Math.floor((duration / 1000) % 60);  
  let minutes = Math.floor((duration / (1000 * 60)) % 60);  
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);  

  hours = (hours < 10) ? '0' + hours : hours;  
  minutes = (minutes < 10) ? '0' + minutes : minutes;  
  seconds = (seconds < 10) ? '0' + seconds : seconds;  

  return hours + ' Horas ' + minutes + ' Minutos';  
}