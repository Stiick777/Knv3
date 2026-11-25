
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

import {
  proto,
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from 'baileys';

import {
  installStickerAudioPatch,
  attachAudio,
  detachAudio,
  createAudioMessage
} from '../core/sticker-audio.js';

installStickerAudioPatch();

const TEMP = './tmp';
const MAX_SECONDS = 25;
const MAX_STICKER_SIZE = 500 * 1024;
const AUDIO_MIME = 'audio/ogg; codecs=opus';

fs.mkdirSync(TEMP, { recursive: true });

function ffmpeg(args, outputBuffer = false) {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-y',
      ...args
    ]);

    const stdout = [];
    let stderr = '';

    p.stdout.on('data', d => stdout.push(d));
    p.stderr.on('data', d => stderr += d.toString());

    p.on('error', reject);

    p.on('close', code => {
      if (code !== 0) {
        return reject(new Error(stderr || `FFmpeg: ${code}`));
      }

      resolve(outputBuffer ? Buffer.concat(stdout) : true);
    });
  });
}

function getMedia(msg) {
  return (msg?.msg || msg || {});
}

async function downloadMedia(message) {
  if (!message) throw new Error('No se encontró el mensaje multimedia.');

  if (typeof message.download === 'function') {
    return await message.download();
  }

  if (typeof message.downloadMedia === 'function') {
    return await message.downloadMedia();
  }

  throw new Error(
    'No se pudo descargar el medio. Comprueba el método download() de tu serialize.'
  );
}

async function makeAudio(input, output) {
  await ffmpeg([
    '-i', input,
    '-vn',
    '-t', String(MAX_SECONDS),
    '-map', '0:a:0',
    '-ac', '1',
    '-ar', '48000',
    '-c:a', 'libopus',
    '-b:a', '32k',
    '-map_metadata', '-1',
    output
  ]);
}

async function getDuration(file) {
  const data = await ffmpeg([
    '-i', file,
    '-vn',
    '-f', 's16le',
    '-ac', '1',
    '-ar', '8000',
    'pipe:1'
  ], true);

  return data.length / (8000 * 2);
}

async function createWaveform(file) {
  const pcm = await ffmpeg([
    '-i', file,
    '-vn',
    '-f', 's16le',
    '-ac', '1',
    '-ar', '8000',
    'pipe:1'
  ], true);

  const count = Math.floor(pcm.length / 2);
  const bars = 64;
  const values = [];

  if (!count) return Uint8Array.from(values);

  const chunk = Math.max(1, Math.floor(count / bars));

  for (let b = 0; b < bars; b++) {
    const start = b * chunk;
    const end = Math.min(count, start + chunk);

    let sum = 0;

    for (let i = start; i < end; i++) {
      sum += Math.abs(pcm.readInt16LE(i * 2));
    }

    values.push(end > start ? sum / (end - start) : 0);
  }

  const peak = Math.max(...values) || 1;

  return Uint8Array.from(
    values.map(v => Math.round(v / peak * 100))
  );
}

async function createSticker(input, output, animated = false) {
  const qualities = [80, 65, 50, 35, 20, 10];

  for (const quality of qualities) {
    await ffmpeg([
      '-i', input,
      '-an',
      '-vf',
      'fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=yuva420p',
      '-c:v', animated ? 'libwebp_anim' : 'libwebp',
      '-preset', 'picture',
      '-compression_level', '4',
      '-q:v', String(quality),
      '-loop', '0',
      output
    ]);

    if (fs.statSync(output).size <= MAX_STICKER_SIZE) {
      return;
    }
  }

  throw new Error('El sticker supera el límite de 500 KB.');
}

async function createVideoSticker(input, webp, ogg) {
  // Comprobar que el video contiene audio.
  const audioFile = ogg;

  await ffmpeg([
    '-i', input,
    '-vn',
    '-t', String(MAX_SECONDS),
    '-map', '0:a:0',
    '-ac', '1',
    '-ar', '48000',
    '-c:a', 'libopus',
    '-b:a', '32k',
    audioFile
  ]);

  await createSticker(input, webp, true);
}

async function createImageSticker(input, webp) {
  await createSticker(input, webp, false);
}

async function sendSoundSticker(sock, chat, webp, ogg, quoted, animated) {
  const options = {
    upload: sock.waUploadToServer
  };

  const uploadedAudio = await prepareWAMessageMedia({
    audio: fs.readFileSync(ogg),
    mimetype: AUDIO_MIME
  }, options);

  const uploadedSticker = await prepareWAMessageMedia({
    sticker: fs.readFileSync(webp),
    isAnimated: animated
  }, options);

  const audio = uploadedAudio.audioMessage;
  const seconds = Math.max(1, Math.ceil(await getDuration(ogg)));
  const waveform = await createWaveform(ogg);

  const audioBytes = createAudioMessage(
    audio,
    seconds,
    waveform
  );

  const sticker = uploadedSticker.stickerMessage;

  sticker.isAnimated = animated;
  sticker.width = 512;
  sticker.height = 512;

  attachAudio(sticker.fileSha256, audioBytes);

  try {
    const me = sock.user || {};

    const userJid = chat.endsWith('@lid') && me.lid
      ? me.lid
      : me.id;

    const message = generateWAMessageFromContent(
      chat,
      { stickerMessage: sticker },
      { quoted, userJid }
    );

    // Verificar que el campo 26 se encuentre realmente integrado.
    const encoded = Buffer.from(
  proto.Message.encode(message.message).finish()
);

if (!verifyEmbeddedAudio(encoded)) {
  throw new Error('El audio no quedó integrado en el sticker.');
}

    
function readVarint(buffer, state) {
  let value = 0;
  let shift = 0;

  while (state.pos < buffer.length) {
    const byte = buffer[state.pos++];
    value += (byte & 0x7f) * (2 ** shift);

    if (!(byte & 0x80)) return value;
    shift += 7;

    if (shift > 49) throw new Error('Protobuf varint inválido.');
  }

  throw new Error('Protobuf incompleto.');
}

function findBytesField(buffer, wantedField) {
  const state = { pos: 0 };

  while (state.pos < buffer.length) {
    const tag = readVarint(buffer, state);
    const field = Math.floor(tag / 8);
    const wire = tag & 7;

    if (wire === 0) {
      readVarint(buffer, state);
    } else if (wire === 1) {
      state.pos += 8;
    } else if (wire === 2) {
      const length = readVarint(buffer, state);
      const start = state.pos;
      state.pos += length;

      if (state.pos > buffer.length) return null;

      if (field === wantedField) {
        return buffer.subarray(start, start + length);
      }
    } else if (wire === 5) {
      state.pos += 4;
    } else {
      return null;
    }

    if (state.pos > buffer.length) return null;
  }

  return null;
}

function verifyEmbeddedAudio(encoded) {
  const stickerBytes = findBytesField(encoded, 26);

  if (!stickerBytes) return false;

  const audioBytes = findBytesField(stickerBytes, 26);

  return Boolean(audioBytes?.length);
}


    await sock.relayMessage(
      chat,
      message.message,
      { messageId: message.key.id }
    );

  } finally {
    detachAudio(sticker.fileSha256);
  }
}

export default {
  command: ['sticker-audio', 'sa', 'saudio'],
  category: 'stickers',
  description: 'Crear stickers con audio.',

  run: async ({ msg, sock, usedPrefix, command }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const inputPath = path.join(TEMP, `${id}-input`);
    const webpPath = path.join(TEMP, `${id}.webp`);
    const oggPath = path.join(TEMP, `${id}.ogg`);

    const files = [inputPath, webpPath, oggPath];

    try {
      const quoted = msg.quoted;
      const current = getMedia(msg);
      const quotedMedia = getMedia(quoted);

      const currentMime = current.mimetype || '';
      const quotedMime = quotedMedia.mimetype || '';

      let stickerSource;
      let audioSource;
      let animated = false;
      let mode = '';

      // MODO 1: responder a un video.
      if (/video/.test(quotedMime)) {
        stickerSource = quoted;
        audioSource = quoted;
        animated = true;
        mode = 'video';
      }

      // También permite enviar video directamente con el comando.
      else if (/video/.test(currentMime)) {
        stickerSource = msg;
        audioSource = msg;
        animated = true;
        mode = 'video';
      }

      // MODO 2: responder a audio y mandar imagen.
      else if (
        /audio/.test(quotedMime) &&
        /image/.test(currentMime)
      ) {
        stickerSource = msg;
        audioSource = quoted;
        mode = 'image-audio';
      }

      // MODO 3: responder a imagen/sticker y mandar audio.
      else if (
        /audio/.test(currentMime) &&
        (/image|webp/.test(quotedMime))
      ) {
        stickerSource = quoted;
        audioSource = msg;
        mode = 'image-audio';
      }

      else {
        return msg.reply(
          `《✧》 No pude reconocer los medios.\n\n` +
          `1. Responde a un video.\n` +
          `2. Responde a un audio y envía una imagen con ${usedPrefix + command}.\n` +
          `3. Responde a una imagen/sticker y envía un audio con ${usedPrefix + command}.`
        );
      }

      const stickerBuffer = await downloadMedia(stickerSource);
      const audioBuffer = mode === 'video'
        ? null
        : await downloadMedia(audioSource);

      fs.writeFileSync(inputPath, stickerBuffer);

      if (mode === 'video') {
        await createVideoSticker(
          inputPath,
          webpPath,
          oggPath
        );
      } else {
        const audioPath = path.join(TEMP, `${id}-audio-input`);
        files.push(audioPath);

        fs.writeFileSync(audioPath, audioBuffer);

        await makeAudio(audioPath, oggPath);
        await createImageSticker(inputPath, webpPath);
      }

      await sock.sendMessage(msg.chat, {
        react: { text: '🕓', key: msg.key }
      });

      await sendSoundSticker(
        sock,
        msg.chat,
        webpPath,
        oggPath,
        msg,
        animated
      );

      await sock.sendMessage(msg.chat, {
        react: { text: '✅', key: msg.key }
      });

    } catch (e) {
      await sock.sendMessage(msg.chat, {
        react: { text: '❌', key: msg.key }
      });

      return msg.reply(
        `《✧》 Error creando el sticker con audio:\n\n${e.message}`
      );

    } finally {
      for (const file of files) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }
    }
  }
};
