/**
 * Validação de MIME para anexos do assistente (CQ-06).
 * Verifica magic number (assinatura de arquivo) — não confia no Content-Type do cliente.
 *
 * Gate: MIME falso bloqueado.
 */

const ALLOWED = {
  pdf:    { mime: 'application/pdf', magic: [[0x25, 0x50, 0x44, 0x46]] }, // %PDF
  png:    { mime: 'image/png',        magic: [[0x89, 0x50, 0x4E, 0x47]] }, // \x89PNG
  jpg:    { mime: 'image/jpeg',       magic: [[0xFF, 0xD8, 0xFF]] },       // \xFF\xD8\xFF
  gif:    { mime: 'image/gif',        magic: [[0x47, 0x49, 0x46, 0x38]] }, // GIF8
  webp:   { mime: 'image/webp',       magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF (webp/zip)
  zip:    { mime: 'application/zip',  magic: [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]] }, // PK
  doc:    { mime: 'application/msword', magic: [[0xD0, 0xCF, 0x11, 0xE0]] }, // OLE2
  txt:    { mime: 'text/plain',       magic: null }, // sem magic — aceita por extensão
  csv:    { mime: 'text/csv',         magic: null },
};

// DOCX/XLSX são ZIP-based — validados pelo magic de ZIP + extensão
const ZIP_MIME_EXT = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

/**
 * Valida um arquivo pelo magic number e extensão.
 * @returns { valid: boolean, mime?: string, error?: string }
 */
function validateFile(buffer, declaredMime, filename) {
  // 1. MIME declarado deve estar na allowlist
  const allMimes = [
    ...Object.values(ALLOWED).map((t) => t.mime),
    ...Object.keys(ZIP_MIME_EXT),
  ];
  if (!allMimes.includes(declaredMime)) {
    return { valid: false, error: `Tipo não permitido: ${declaredMime}` };
  }

  // 2. DOCX/XLSX: magic de ZIP + extensão correta
  if (ZIP_MIME_EXT[declaredMime]) {
    const isZip = checkMagic(buffer, ALLOWED.zip.magic);
    if (!isZip) return { valid: false, error: 'Conteúdo não corresponde ao tipo declarado' };
    const expectedExt = ZIP_MIME_EXT[declaredMime];
    if (!filename?.toLowerCase().endsWith(expectedExt)) {
      return { valid: false, error: `Extensão deve ser ${expectedExt}` };
    }
    return { valid: true, mime: declaredMime };
  }

  // 3. Tipos com magic number
  const entry = Object.values(ALLOWED).find((t) => t.mime === declaredMime);
  if (entry && entry.magic) {
    if (!checkMagic(buffer, entry.magic)) {
      return { valid: false, error: 'Conteúdo não corresponde ao tipo declarado (MIME falso)' };
    }
  }

  return { valid: true, mime: declaredMime };
}

function checkMagic(buffer, magicList) {
  for (const magic of magicList) {
    if (buffer.length < magic.length) continue;
    let match = true;
    for (let i = 0; i < magic.length; i++) {
      if (buffer[i] !== magic[i]) { match = false; break; }
    }
    if (match) return true;
  }
  return false;
}

module.exports = { validateFile, ALLOWED };
