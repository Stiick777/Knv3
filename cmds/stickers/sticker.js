
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import exif from '#core/exif';
import db from '#db';

const { writeExif } = exif;

const MAX_VIDEO_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_VIDEO_DURATION = 10; // segundos
const MAX_STICKER_SIZE = 1 * 1024 * 1024; // 1 MB
const FFMPEG_TIMEOUT = 15000; // 15 segundos

const TMP_DIR = './tmp';

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

export default {
  command: ['sticker', 's'],
  category: 'stickers',
  description: 'Convertir una imagen o video a sticker.',

  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      if (args[0] === '-list') {
        let helpText = `ꕥ Lista de Formas y Efectos Disponibles para *imagen*:\n\n✦ *Formas:*\n- -c : Crea un sticker circular\n- -t : Crea un sticker triangular\n- -s : Crea un sticker con forma de estrella\n- -r : Crea un sticker con esquinas redondeadas\n- -h : Crea un sticker hexagonal\n- -d : Crea un sticker con forma de diamante\n- -f : Crea un sticker con un marco\n- -b : Crea un sticker con un borde\n- -w : Crea un sticker con forma de onda\n- -m : Crea un sticker espejado\n- -o : Crea un sticker octogonal\n- -y : Crea un sticker pentagonal\n- -e : Crea un sticker elíptico\n- -z : Crea un sticker en forma de cruz\n- -v : Crea un sticker con forma de corazón\n- -x : Crea un sticker expandido (cover)\n- -i : Crea un sticker expandido (contain)\n\n✧ *Efectos:*\n- -blur : Aplica un efecto de desenfoque\n- -sepia : Aplica un efecto sepia\n- -sharpen : Aplica un efecto de nitidez\n- -brighten : Aumenta el brillo\n- -darken : Disminuye el brillo\n- -invert : Invierte los colores\n- -grayscale : Aplica escala de grises\n- -rotate90 : Rota la imagen 90 grados\n- -rotate180 : Rota la imagen 180 grados\n- -flip : Invierte la imagen horizontalmente\n- -flop : Invierte la imagen verticalmente\n- -normalice : Normaliza la imagen\n- -negate : Negatiza la imagen\n- -tint : Aplica un tinte de color a la imagen (rojo por defecto)\n\n> Ejemplo: *${usedPrefix + command} -c -blur Pack | Autor*`;

        return sock.reply(msg.chat, helpText, msg);
      }

      const quoted = msg.quoted || msg;
      const mediaInfo = quoted.msg || quoted;
      const mime = mediaInfo.mimetype || '';

      let user = db.getUser(msg.sender);

      const name = user.name;
      const meta1 = user.metadatos ? String(user.metadatos).trim() : '';
      const meta2 = user.metadatos2 ? String(user.metadatos2).trim() : '';

      let texto1 = meta1 || `✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰`;
      let texto2 = meta1 ? (meta2 || '') : `@${name}`;

      let urlArg = null;
      let argsWithoutUrl = [];

      for (let arg of args) {
        if (isUrl(arg)) {
          urlArg = arg;
        } else {
          argsWithoutUrl.push(arg);
        }
      }

      let filteredText = argsWithoutUrl.join(' ').replace(/-\w+/g, '').trim();
      let marca = filteredText.split(/[\u2022|]/).map(part => part.trim());

      let pack = marca[0] || texto1;
      let author = marca.length > 1
        ? marca[1]
        : (filteredText ? (meta1 ? texto2 : '') : texto2);

      const shapeArgs = {
        '-c': 'circle',
        '-t': 'triangle',
        '-s': 'star',
        '-r': 'roundrect',
        '-h': 'hexagon',
        '-d': 'diamond',
        '-f': 'frame',
        '-b': 'border',
        '-w': 'wave',
        '-m': 'mirror',
        '-o': 'octagon',
        '-y': 'pentagon',
        '-e': 'ellipse',
        '-z': 'cross',
        '-v': 'heart',
        '-x': 'cover',
        '-i': 'contain'
      };

      const effectArgs = {
        '-blur': 'blur',
        '-sepia': 'sepia',
        '-sharpen': 'sharpen',
        '-brighten': 'brighten',
        '-darken': 'darken',
        '-invert': 'invert',
        '-grayscale': 'grayscale',
        '-rotate90': 'rotate90',
        '-rotate180': 'rotate180',
        '-flip': 'flip',
        '-flop': 'flop',
        '-normalice': 'normalise',
        '-negate': 'negate',
        '-tint': 'tint'
      };

      const effects = [];

      for (const arg of argsWithoutUrl) {
        if (shapeArgs[arg]) {
          effects.push({ type: 'shape', value: shapeArgs[arg] });
        } else if (effectArgs[arg]) {
          effects.push({ type: 'effect', value: effectArgs[arg] });
        }
      }

      // Ejecutar FFmpeg con tiempo máximo
      const runFFmpeg = (ffmpegArgs, timeout = FFMPEG_TIMEOUT) => {
        return new Promise((resolve, reject) => {
          const p = spawn('ffmpeg', ffmpegArgs, {
            stdio: ['ignore', 'ignore', 'pipe']
          });

          let err = '';
          let finished = false;

          const timer = setTimeout(() => {
            if (finished) return;

            finished = true;
            p.kill('SIGKILL');

            reject(new Error('La conversión superó el tiempo máximo permitido.'));
          }, timeout);

          p.stderr.on('data', d => {
            err += d.toString();
            if (err.length > 12000) {
              err = err.slice(-12000);
            }
          });

          p.on('error', error => {
            if (finished) return;

            finished = true;
            clearTimeout(timer);
            reject(error);
          });

          p.on('close', code => {
            if (finished) return;

            finished = true;
            clearTimeout(timer);

            if (code === 0) {
              resolve();
            } else {
              reject(new Error(
                err.includes('File is too large')
                  ? 'El sticker supera el límite de 1 MB.'
                  : 'No se pudo convertir el archivo: ' + err.slice(-1000)
              ));
            }
          });
        });
      };

      // Obtener duración real mediante ffprobe
      const getVideoDuration = async (inputPath) => {
        return new Promise((resolve, reject) => {
          const p = spawn('ffprobe', [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            inputPath
          ], {
            stdio: ['ignore', 'pipe', 'pipe']
          });

          let output = '';
          let finished = false;

          const timer = setTimeout(() => {
            if (finished) return;

            finished = true;
            p.kill('SIGKILL');
            reject(new Error('No se pudo comprobar la duración del video.'));
          }, 5000);

          p.stdout.on('data', d => output += d.toString());

          p.on('error', error => {
            if (finished) return;

            finished = true;
            clearTimeout(timer);
            reject(error);
          });

          p.on('close', code => {
            if (finished) return;

            finished = true;
            clearTimeout(timer);

            const duration = parseFloat(output.trim());

            if (code !== 0 || !Number.isFinite(duration)) {
              reject(new Error('No se pudo leer la duración del video.'));
            } else {
              resolve(duration);
            }
          });
        });
      };

      // Enviar sticker con metadatos
      const sendWebpWithExif = async (webpBuffer) => {
        if (!webpBuffer || !webpBuffer.length) {
          throw new Error('El sticker está vacío.');
        }

        if (webpBuffer.length > MAX_STICKER_SIZE) {
          throw new Error('El sticker supera el límite de 1 MB.');
        }

        const media = {
          mimetype: 'webp',
          data: webpBuffer
        };

        const metadata = {
          packname: pack,
          author: author,
          categories: ['']
        };

        let stickerPath;

        try {
          stickerPath = await writeExif(media, metadata);

          await sock.sendMessage(
            msg.chat,
            { sticker: { url: stickerPath } },
            { quoted: msg }
          );
        } finally {
          if (stickerPath && fs.existsSync(stickerPath)) {
            fs.unlinkSync(stickerPath);
          }
        }
      };

      // Convertir GIF
      const convertToGif = async (inputPath) => {
        const gifPath = path.join(TMP_DIR, `conv-${Date.now()}.gif`);

        try {
          await runFFmpeg([
            '-y',
            '-i', inputPath,
            '-t', String(MAX_VIDEO_DURATION),
            '-vf',
            'fps=10,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
            '-loop', '0',
            gifPath
          ]);

          return gifPath;
        } catch (e) {
          if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
          throw e;
        }
      };

      // Procesar imagen o video
      const processWithFFmpeg = async (inputPath, isVideo = false) => {
        const outputPath = path.join(TMP_DIR, `sticker-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`);

        try {
          const vf = buildFFmpegFilters(effects);

          const ffmpegArgs = [
            '-y',
            '-i', inputPath,
            '-t', String(isVideo ? MAX_VIDEO_DURATION : 30),
            '-vf', isVideo ? `${vf},fps=10` : vf,
            '-an',
            '-c:v', 'libwebp_anim',
            '-preset', 'picture',
            '-compression_level', '6',
            '-q:v', '50',
            '-loop', '0',
            '-threads', '2',
            '-fs', String(MAX_STICKER_SIZE),
            outputPath
          ];

          await runFFmpeg(ffmpegArgs);

          if (!fs.existsSync(outputPath)) {
            throw new Error('No se generó el sticker.');
          }

          const stats = fs.statSync(outputPath);

          if (stats.size > MAX_STICKER_SIZE) {
            throw new Error('El sticker supera el límite de 1 MB.');
          }

          const data = fs.readFileSync(outputPath);

          await sendWebpWithExif(data);

        } finally {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        }
      };

      const isAnimatedWebp = (buffer) => {
        if (!Buffer.isBuffer(buffer) || buffer.length < 32) return false;

        return buffer.indexOf(Buffer.from('ANIM')) !== -1 ||
          buffer.indexOf(Buffer.from('ANMF')) !== -1;
      };

      // Procesar WebP recibido
      const handleWebpBuffer = async (buffer) => {
        if (buffer.length > MAX_STICKER_SIZE) {
          throw new Error('El archivo WebP supera el límite de 1 MB.');
        }

        const animated = isAnimatedWebp(buffer);
        const inputPath = path.join(TMP_DIR, `in-${Date.now()}.webp`);

        try {
          fs.writeFileSync(inputPath, buffer);

          if (animated && effects.length > 0) {
            let gifPath;

            try {
              gifPath = await convertToGif(inputPath);
              await processWithFFmpeg(gifPath, true);
            } finally {
              if (gifPath && fs.existsSync(gifPath)) {
                fs.unlinkSync(gifPath);
              }
            }
          } else if (animated && effects.length === 0) {
            await sendWebpWithExif(buffer);
          } else {
            await processWithFFmpeg(inputPath);
          }
        } finally {
          if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
        }
      };

      // Descargar archivos desde URL con límite de peso
      const downloadLimited = async (url, maxSize) => {
        const response = await fetch(url, {
          timeout: 15000,
          size: maxSize
        });

        if (!response.ok) {
          throw new Error('No pude descargar ese archivo desde la URL.');
        }

        const contentLength = Number(response.headers.get('content-length'));

        if (contentLength && contentLength > maxSize) {
          throw new Error('El archivo de la URL supera el límite de 1 MB.');
        }

        const chunks = [];
        let totalSize = 0;

        for await (const chunk of response.body) {
          totalSize += chunk.length;

          if (totalSize > maxSize) {
            response.body.destroy();
            throw new Error('El archivo supera el límite de 1 MB.');
          }

          chunks.push(chunk);
        }

        return Buffer.concat(chunks);
      };

      // IMÁGENES Y WEBP
      if (/image/.test(mime) || /webp/.test(mime)) {
        const buffer = await quoted.download();

        if (!buffer || !buffer.length) {
          throw new Error('No se pudo descargar la imagen.');
        }

        if (/webp/.test(mime)) {
          await handleWebpBuffer(buffer);
        } else {
          const ext = /png/i.test(mime)
            ? 'png'
            : /jpe?g/i.test(mime)
              ? 'jpg'
              : /gif/i.test(mime)
                ? 'gif'
                : 'img';

          const inputPath = path.join(TMP_DIR, `in-${Date.now()}.${ext}`);

          try {
            fs.writeFileSync(inputPath, buffer);
            await processWithFFmpeg(inputPath, /gif/i.test(mime));
          } finally {
            if (fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);
            }
          }
        }

      // VIDEOS ADJUNTOS
      } else if (/video/.test(mime)) {
        const seconds = Number(mediaInfo.seconds || 0);
        const fileLength = Number(mediaInfo.fileLength || 0);

        if (seconds > MAX_VIDEO_DURATION) {
          return msg.reply(
            `《✧》 El video es demasiado largo.\n\n` +
            `• Duración máxima: 10 segundos.\n` +
            `• Duración recibida: ${seconds} segundos.`
          );
        }

        if (fileLength > MAX_VIDEO_SIZE) {
          return msg.reply(
            `《✧》 El video supera el peso permitido.\n\n` +
            `• Peso máximo: 1 MB.`
          );
        }

        const buffer = await quoted.download();

        if (!buffer || !buffer.length) {
          throw new Error('No se pudo descargar el video.');
        }

        if (buffer.length > MAX_VIDEO_SIZE) {
          return msg.reply('《✧》 El video supera el límite de 1 MB.');
        }

        const inputPath = path.join(TMP_DIR, `video-${Date.now()}.mp4`);

        try {
          fs.writeFileSync(inputPath, buffer);

          const duration = await getVideoDuration(inputPath);

          if (duration > MAX_VIDEO_DURATION) {
            return msg.reply(
              '《✧》 El video supera la duración máxima de 10 segundos.'
            );
          }

          await processWithFFmpeg(inputPath, true);

        } finally {
          if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
        }

      // URL
      } else if (urlArg) {
        const url = urlArg;

        if (!url.match(/\.(jpe?g|png|gif|webp|mp4|mov|avi|mkv|webm)(\?.*)?$/i)) {
          return sock.reply(
            msg.chat,
            '《✧》 La URL debe ser de una imagen (jpg, png, gif, webp) o video (mp4, mov, avi, mkv, webm).',
            msg
          );
        }

        const isVideo = /\.(mp4|mov|avi|mkv|webm)(\?.*)?$/i.test(url);

        const buffer = await downloadLimited(url, isVideo ? MAX_VIDEO_SIZE : 20 * 1024 * 1024);

        if (/\.webp(\?.*)?$/i.test(url)) {
          await handleWebpBuffer(buffer);

        } else if (/\.(jpe?g|png|gif)(\?.*)?$/i.test(url)) {
          const ext = /\.gif/i.test(url) ? 'gif' : 'img';
          const inputPath = path.join(TMP_DIR, `url-${Date.now()}.${ext}`);

          try {
            fs.writeFileSync(inputPath, buffer);
            await processWithFFmpeg(inputPath, /\.gif/i.test(url));
          } finally {
            if (fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);
            }
          }

        } else if (isVideo) {
          const inputPath = path.join(TMP_DIR, `urlvid-${Date.now()}.mp4`);

          try {
            fs.writeFileSync(inputPath, buffer);

            const duration = await getVideoDuration(inputPath);

            if (duration > MAX_VIDEO_DURATION) {
              return msg.reply(
                '《✧》 El video supera la duración máxima de 10 segundos.'
              );
            }

            await processWithFFmpeg(inputPath, true);

          } finally {
            if (fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);
            }
          }
        }

      } else {
        return sock.reply(
          msg.chat,
          `《✧》 Por favor, envía una imagen, video, sticker o URL para hacer un sticker.\n> Usa *${usedPrefix + command} -list* para ver formas y efectos`,
          msg
        );
      }

    } catch (e) {
      return msg.reply(
        `《✧》 No se pudo crear el sticker.\n> Error: *${e.message}*`
      );
    }
  }
};

const isUrl = (text) => {
  return text.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
      'gi'
    )
  );
};

const buildFFmpegFilters = (effects, isVideo = false) => {
  const W = 512;
  const H = 512;
  const filters = [];

  const shape = effects.find(e => e.type === 'shape')?.value;
  const effectList = effects.filter(e => e.type === 'effect').map(e => e.value);

  if (shape === 'cover') {
    filters.push(`scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`);
  } else {
    filters.push(`scale=${W}:${H}:force_original_aspect_ratio=decrease`);
    filters.push(`pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`);
  }

  filters.push('format=rgba');

  for (const effect of effectList) {
    switch (effect) {
      case 'blur':
        filters.push('gblur=sigma=5');
        break;
      case 'sepia':
        filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
        break;
      case 'sharpen':
        filters.push('unsharp=5:5:1.0:5:5:0.0');
        break;
      case 'brighten':
        filters.push('eq=brightness=0.05');
        break;
      case 'darken':
        filters.push('eq=brightness=-0.05');
        break;
      case 'invert':
      case 'negate':
        filters.push('negate');
        break;
      case 'grayscale':
        filters.push('hue=s=0');
        break;
      case 'rotate90':
        filters.push('transpose=1');
        break;
      case 'rotate180':
        filters.push('rotate=PI');
        break;
      case 'flip':
        filters.push('hflip');
        break;
      case 'flop':
        filters.push('vflip');
        break;
      case 'normalise':
        filters.push('normalize');
        break;
      case 'tint':
        filters.push('colorchannelmixer=1:0:0:0:0:0.5:0:0:0:0:0.5');
        break;
    }
  }

  if (shape === 'mirror') filters.push('hflip');

  if (shape && !['cover', 'contain', 'mirror', 'border', 'frame'].includes(shape)) {
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) / 2;

    let alphaExpr = '';

    switch (shape) {
      case 'circle':
        alphaExpr = `if(lte((X-${cx})*(X-${cx})+(Y-${cy})*(Y-${cy}),${r * r}),255,0)`;
        break;

      case 'triangle':
        alphaExpr = `if(gte(Y,${H * 0.1})*lte(Y,${H * 0.9})*lte(abs(X-${cx}),((${H * 0.9}-Y)*0.6)),255,0)`;
        break;

      case 'star':
        alphaExpr = `if(lte(hypot(X-${cx},Y-${cy}),${W * 0.25}+${W * 0.1}*cos(5*atan2(Y-${cy},X-${cx}))),255,0)`;
        break;

      case 'roundrect': {
        const rad = 50;

        alphaExpr = `if(lte(if(gte(X,${rad})*lte(X,${W - rad})*gte(Y,0)*lte(Y,${H}),0,if(gte(Y,${rad})*lte(Y,${H - rad})*gte(X,0)*lte(X,${W}),0,if(lte(X,${rad})*lte(Y,${rad}),(X-${rad})*(X-${rad})+(Y-${rad})*(Y-${rad}),if(gte(X,${W - rad})*lte(Y,${rad}),(X-${W - rad})*(X-${W - rad})+(Y-${rad})*(Y-${rad}),if(lte(X,${rad})*gte(Y,${H - rad}),(X-${rad})*(X-${rad})+(Y-${H - rad})*(Y-${H - rad}),(X-${W - rad})*(X-${W - rad})+(Y-${H - rad})*(Y-${H - rad})))))),${rad * rad}),255,0)`;
        break;
      }

      case 'hexagon':
        alphaExpr = `if(lte(hypot(X-${cx},Y-${cy}),${W * 0.4}*cos(PI/6)/cos(mod(atan2(Y-${cy},X-${cx}),PI/3)-PI/6)),255,0)`;
        break;

      case 'diamond':
        alphaExpr = `if(lte(abs(X-${cx})+abs(Y-${cy}),${r}),255,0)`;
        break;

      case 'wave':
        alphaExpr = `if(lte(abs(Y-(${cy}+${H * 0.05}*sin(X*0.05))),${H * 0.4}),255,0)`;
        break;

      case 'octagon':
        alphaExpr = `if(lte(hypot(X-${cx},Y-${cy}),${W * 0.4}*cos(PI/8)/cos(mod(atan2(Y-${cy},X-${cx}),PI/4)-PI/8)),255,0)`;
        break;

      case 'pentagon':
        alphaExpr = `if(lte(hypot(X-${cx},Y-${cy}),${W * 0.4}*cos(PI/5)/cos(mod(atan2(Y-${cy},X-${cx}),2*PI/5)-PI/5)),255,0)`;
        break;

      case 'ellipse':
        alphaExpr = `if(lte(((X-${cx})*(X-${cx}))/(${(W * 0.45) * (W * 0.45)})+((Y-${cy})*(Y-${cy}))/(${(H * 0.4) * (H * 0.4)}),1),255,0)`;
        break;

      case 'cross':
        alphaExpr = `if(gt(lte(abs(X-${cx}),${W * 0.15})*lte(abs(Y-${cy}),${H * 0.45})+lte(abs(Y-${cy}),${H * 0.15})*lte(abs(X-${cx}),${W * 0.45}),0),255,0)`;
        break;

      case 'heart':
        alphaExpr = `if(lte(pow((X-${cx})/(${W * 0.3})*(X-${cx})/(${W * 0.3})+(Y-${cy})/(${H * 0.3})*(Y-${cy})/(${H * 0.3})-1,3)-((X-${cx})/(${W * 0.3})*(X-${cx})/(${W * 0.3}))*pow((Y-${cy})/(${H * 0.3}),3),0),255,0)`;
        break;
    }

    if (alphaExpr) {
      filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='${alphaExpr}'`);
    }
  }

  if (shape === 'border') {
    filters.push(`drawbox=x=0:y=0:w=${W}:h=${H}:color=white@0.9:t=10`);
  }

  if (shape === 'frame') {
    filters.push(`drawbox=x=15:y=15:w=${W - 30}:h=${H - 30}:color=white@0.7:t=8`);
  }

  filters.push('format=yuva420p');

  return filters.join(',');
};
