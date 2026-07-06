export default {
  command: ['apk', 'apkdl', 'modapk'],
  category: 'downloads',
  description: '',
  run: async ({ msg, sock, args }) => {
    if (!args[0]) {
      return msg.reply(
        '[ 🌟 ] Ingresa el nombre de la aplicación que quieres descargar.\nEjemplo:\n.apk simcity'
      )
    }

    const query = encodeURIComponent(args.join(' '))
    const MAX_SIZE_MB = 100

    try {
      await msg.react('🕛')

      const res = await fetch(`https://api.delirius.store/download/apk?query=${query}`)
      const json = await res.json()

      if (!json.status || !json.data) throw new Error('No encontrado')

      const {
        name,
        size,
        image,
        download,
        developer,
        publish,
        id
      } = json.data

      const texto = `❯───「 𝗔𝗣𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 」───❮
✦ 𝐍𝐨𝐦𝐛𝐫𝐞 : ⇢ ${name} 📛
✦ 𝐓𝐚𝐦𝐚𝐧̃𝐨 : ⇢ ${size} ⚖️
✦ 𝐃𝐞𝐬𝐚𝐫𝐫𝐨𝐥𝐥𝐚𝐝𝐨𝐫 : ⇢ ${developer} 🛠️
✦ 𝐈𝐃 : ⇢ ${id} 🆔
✦ 𝐅𝐞𝐜𝐡𝐚 : ⇢ ${publish} 📅

⌛ Enviando aplicación...`

      await sock.sendFile(
        msg.chat,
        image,
        `${name}.jpg`,
        texto,
        msg
      )

      await sock.sendMessage(
        msg.chat,
        {
          document: { url: download },
          mimetype: 'application/vnd.android.package-archive',
          fileName: `${name}.apk`
        },
        { quoted: msg }
      )

      await msg.react('✅')

    } catch (e) {
      console.log('Error Delirius:', e)

      await msg.react('❌')
      await msg.reply('❗ No se pudo encontrar la aplicación solicitada.')
    }
  },
}
