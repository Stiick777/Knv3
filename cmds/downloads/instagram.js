import fetch from 'node-fetch'

export default {
  command: ['instagram', 'ig', 'reel'],
  category: 'downloads',
  description: 'Descargar un reel de Instagram.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    if (!args[0]) {
      return msg.reply('《✧》 Por favor, ingrese un enlace de Instagram.')
    }

    if (!args[0].match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
      return msg.reply('《✧》 El enlace no parece *válido*. Asegúrate de que sea de *Instagram*.')
    }

    try {
      const data = await getInstagramMedia(args[0])

      if (!data) {
        return msg.reply('《✧》 No se pudo obtener el contenido.')
      }

      const caption = `ㅤ۟∩　ׅ　★ ໌　ׅ　🅘𝖦 🅓ownload　ׄᰙ

${data.title ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Usuario* › ${data.title}\n` : ''}${data.caption ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Descripción* › ${data.caption}\n` : ''}${data.like ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Likes* › ${data.like}\n` : ''}${data.views ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Vistas* › ${data.views}\n` : ''}${data.duration ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Duración* › ${data.duration}\n` : ''}${data.format ? `𖣣ֶㅤ֯⌗ ❀  ⬭ *Formato* › ${data.format}\n` : ''}𖣣ֶㅤ֯⌗ ❀  ⬭ *Enlace* › ${args[0]}`

      if (data.type === 'video') {
        await sock.sendMessage(
          msg.chat,
          {
            video: { url: data.url },
            caption,
            mimetype: 'video/mp4',
            fileName: 'ig.mp4'
          },
          { quoted: msg }
        )
      } else if (data.type === 'image') {
        await sock.sendMessage(
          msg.chat,
          {
            image: { url: data.url },
            caption
          },
          { quoted: msg }
        )
      } else {
        throw new Error('Contenido no soportado.')
      }
    } catch (e) {
      await msg.reply(
        `> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`
      )
    }
  }
}

async function getInstagramMedia(url) {
  try {
    const endpoint = `https://anabot.my.id/api/download/instagram?url=${encodeURIComponent(url)}&apikey=freeApikey`

    const res = await fetch(endpoint).then(r => r.json())

    if (
      !res.success ||
      !res.data ||
      !Array.isArray(res.data.result) ||
      !res.data.result.length
    ) {
      return null
    }

    const media = res.data.result[0]

    if (!media?.url) {
      return null
    }

    const isVideo = media.url.toLowerCase().endsWith('.mp4')

    return {
      type: isVideo ? 'video' : 'image',
      title: null,
      caption: null,
      like: null,
      views: null,
      duration: null,
      resolution: null,
      format: isVideo ? 'mp4' : 'jpg',
      url: media.url,
      thumbnail: media.thumbnail || null
    }
  } catch (e) {
    return null
  }
}
