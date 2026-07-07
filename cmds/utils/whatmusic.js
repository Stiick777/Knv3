import fs from 'fs'
import acrcloud from 'acrcloud'

let acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

export default {
  command: ['quemusica', 'quemusicaes', 'whatmusic'],
  category: 'tools',
  description: '',
  run: async ({ msg }) => {
    try {
      let q = msg.quoted ? msg.quoted : msg
      let mime = (q.msg || q).mimetype || ''

      if (/audio|video/.test(mime)) {
        if ((q.msg || q).seconds > 20) {
          return msg.reply(
            '᥀·࣭࣪̇˖⚙️◗ 𝙀𝙡 𝙖𝙧𝙘𝙝𝙞𝙫𝙤 𝙚𝙨 𝙙𝙚𝙢𝙖𝙨𝙞𝙖𝙙𝙤 𝙜𝙧𝙖𝙣𝙙𝙚, 𝙧𝙚𝙘𝙤𝙧𝙩𝙚𝙡𝙤 𝙢𝙞𝙣𝙞𝙢𝙤 𝙙𝙚 10 𝙖 20 𝙨𝙚𝙜𝙪𝙣𝙙𝙤𝙨 𝙥𝙖𝙧𝙖 𝙗𝙪𝙨𝙘𝙖𝙧 𝙧𝙚𝙨𝙪𝙡𝙩𝙖𝙙𝙤𝙨.'
          )
        }

        await msg.reply('⏳ Procesando el audio/video, por favor espera...')

        let media = await q.download()
        let ext = mime.split('/')[1]
        let filePath = `./tmp/${msg.sender}.${ext}`

        fs.writeFileSync(filePath, media)

        let res = await acr.identify(fs.readFileSync(filePath))

        fs.unlinkSync(filePath)

        let { code, msg: statusMsg } = res.status

        if (code !== 0) {
          return msg.reply(`❌ Error *Use /whatm2*: ${statusMsg}`)
        }

        let {
          title,
          artists,
          album,
          genres,
          release_date
        } = res.metadata.music[0]

        let txt = `
𝐍𝐎𝐌𝐁𝐑𝐄: ${title}
𝐀𝐑𝐓𝐈𝐒𝐓𝐀: ${artists ? artists.map(v => v.name).join(', ') : 'No encontrado'}
𝐀𝐋𝐁𝐔𝐌: ${album ? album.name : 'Desconocido'}
𝐆𝐄𝐍𝐄𝐑𝐎: ${genres ? genres.map(v => v.name).join(', ') : 'No encontrado'}
𝐅𝐄𝐂𝐇𝐀 𝐃𝐄 𝐋𝐀𝐍𝐙𝐀𝐌𝐈𝐄𝐍𝐓𝐎: ${release_date || 'Desconocida'}

> Provided by *KanBot*
        `.trim()

        return msg.reply(txt)
      }

      return msg.reply(
        '᥀·࣭࣪̇˖⛔◗ 𝙊𝙘𝙪𝙧𝙧𝙞𝙤 𝙪𝙣 𝙚𝙧𝙧𝙤𝙧 𝙞𝙣𝙚𝙨𝙥𝙚𝙧𝙖𝙙𝙤, 𝙞𝙣𝙩𝙚𝙣𝙩𝙖𝙡𝙤 𝙙𝙚 𝙣𝙪𝙚𝙫𝙤, 𝙧𝙚𝙨𝙥𝙤𝙣𝙙𝙚 𝙖 𝙪𝙣 𝙖𝙪𝙙𝙞𝙤 𝙤 𝙫𝙞𝙙𝙚𝙤.'
      )

    } catch (e) {
      return msg.reply(`⚠️ Error inesperado *use /whatm2*: ${e.message}`)
    }
  },
}
