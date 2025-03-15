
import fg from 'senna-fg'
let handler = async (m, { conn, text }) => {
  if (!text) throw '✳️ Ingrese el nombre de un paquete';
  let img = 'https://i.ibb.co/HxNbmxd/npm2.png'
  m.react(rwait)
  try {
  let pkg = await fg.npmSearch(text);
  let caption = `
▢ *Nombre del paquete:* ${pkg.name}
▢ *Versión:* ${pkg.version}
▢ *Dueño:* ${pkg.owner}
▢ *Publicado:* ${pkg.publishedDate}
▢ *Descripción:* ${pkg.description}
▢ *Página:* ${pkg.homepage} 
▢ *Link:* ${pkg.packageLink} 
`;
 await conn.sendFile(m.chat, img, 'npm.png', caption, m)
 await conn.sendFile(m.chat, pkg.downloadLink, `${pkg.packageName}-${pkg.version}.tgz`, '', m, null, { mimetype: 'application/zip', asDocument: true })
 m.react(done)
} catch (err) {
	m.reply(`✳️ Error: revisa que el nombre de paquete exista en https://www.npmjs.com`)
	}
	
};
handler.help = ['npm'];
handler.tags = ['tools'];
handler.command = ['npm', 'npmdl', 'npmsearch'];

export default handler;
