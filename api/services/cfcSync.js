/**
 * Sincronização das Normas Brasileiras de Contabilidade (CFC) → Base de Conhecimento.
 * Rastreia a página índice + categorias, baixa PDFs/DOCX, extrai o texto e grava em knowledge_base.
 * - incremental: processa só normas novas (diário)
 * - full: reprocessa tudo (anual)
 */
const { query } = require('../db');

const INDEX_URL = 'https://cfc.org.br/tecnica/normas-brasileiras-de-contabilidade/';
const UA = { 'User-Agent': 'Mozilla/5.0 (ContauxKB sync)' };
const CONCURRENCY = 4;
const MAX_TEXT = 400000;

const state = { running: false, mode: null, progress: null, last: null };

async function fetchBuf(url) {
  const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}
const fetchText = async (url) => (await fetchBuf(url)).toString('utf8');

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&nbsp;/g, ' ');
}
function links(html, base) {
  const out = new Set();
  for (const m of html.matchAll(/href="([^"#]+)"/gi)) {
    try { out.add(new URL(decode(m[1]), base).href); } catch { /* ignora */ }
  }
  return [...out];
}

/** Coleta todos os links relevantes (páginas de categoria + documentos) */
async function discover() {
  const docs = new Map(); // code → { url, kind }
  const seen = new Set([INDEX_URL]);
  const queue = [{ url: INDEX_URL, depth: 0 }];
  const prefix = '/tecnica/normas-brasileiras-de-contabilidade/';
  while (queue.length) {
    const { url, depth } = queue.shift();
    let html;
    try { html = await fetchText(url); } catch (e) { console.warn('[cfc] falha', e.message); continue; }
    for (const l of links(html, url)) {
      if (/detalhes_sre\.aspx/i.test(l)) {
        const code = (new URL(l).searchParams.get('Codigo') || new URL(l).searchParams.get('codigo') || '').trim();
        if (code && !docs.has(code.toLowerCase())) docs.set(code.toLowerCase(), { code, url: l, kind: 'sre' });
      } else if (/cfc\.org\.br\/wp-content\/uploads\/.+\.(pdf|docx?)$/i.test(l)) {
        const code = 'file:' + decodeURIComponent(l.split('/uploads/')[1]);
        if (!docs.has(code.toLowerCase())) docs.set(code.toLowerCase(), { code, url: l, kind: 'file' });
      } else if (depth < 2 && new URL(l).hostname.endsWith('cfc.org.br') && new URL(l).pathname.startsWith(prefix) && !seen.has(l)) {
        seen.add(l);
        queue.push({ url: l, depth: depth + 1 });
      }
    }
  }
  return [...docs.values()];
}

async function extractText(buf, url) {
  try {
    if (/\.pdf$/i.test(url) || buf.slice(0, 4).toString() === '%PDF') {
      return (await require('pdf-parse')(buf)).text;
    }
    if (/\.docx$/i.test(url)) {
      return (await require('mammoth').extractRawText({ buffer: buf })).value;
    }
  } catch (e) { console.warn('[cfc] extração falhou', url, e.message); }
  return '';
}

function tagsFor(title) {
  const t = ['Contábil', 'NBC'];
  const m = title.match(/NBC\s+(P[GAP]|T[A-Z]+)/i);
  if (m) t.push('NBC ' + m[1].toUpperCase());
  if (/revis[aã]o/i.test(title)) t.push('Revisão NBC');
  if (/errata/i.test(title)) t.push('Errata');
  return t;
}

async function processDoc(d) {
  let title = d.code, summary = '', source = d.code, pdfUrl = d.url, published = null;
  if (d.kind === 'sre') {
    // Páginas SRE em www1 retornam tabela vazia — sempre usar www2
    const sreUrl = d.url.replace('://www1.cfc.org.br', '://www2.cfc.org.br');
    const html = await fetchText(sreUrl);
    const raw = (label) => {
      const m = html.match(new RegExp(label + '[^<]*</td>\\s*<td[^>]*>([\\s\\S]*?)</td>', 'i'));
      return m ? decode(m[1]).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' ').replace(/[ \t\r]+/g, ' ').replace(/\n\s*/g, '\n').trim() : '';
    };
    const field = (label) => raw(label).replace(/\s+/g, ' ');
    // SRE usa "Descrição:" (não "Ementa:") como campo principal
    const descricao = field('Descri');
    const revoked = /^SIM/i.test(field('foi revogada'));
    const pdf = (html.match(/href="([^"]+\.pdf)"/i) || [])[1];
    const doc = (html.match(/href="([^"]+\.docx?)"/i) || [])[1];
    pdfUrl = pdf || doc || null;
    // Fallback: usar parâmetro "arquivo" da URL se não houver link de download na página
    if (!pdfUrl) {
      const arquivo = new URL(sreUrl).searchParams.get('arquivo');
      if (arquivo) pdfUrl = `https://www1.cfc.org.br/sisweb/SRE/docs/${arquivo}`;
    }
    const firstLine = descricao.split('\n').find((x) => x.trim()) || '';
    title = (firstLine.replace(/,\s*DE\s.*$/i, '') || d.code).slice(0, 200);
    summary = descricao.slice(0, 500);
    published = field('Data de Publica');
    source = `CFC ${d.code}` + (published ? ` — DOU ${published}` : '') + (revoked ? ' (REVOGADA)' : '');
    d.revoked = revoked;
  } else {
    title = decodeURIComponent(d.url.split('/').pop()).replace(/\.\w+$/, '').replace(/[_-]+/g, ' ');
  }
  let text = '';
  let fileUrl = pdfUrl;
  if (pdfUrl) {
    try {
      const abs = new URL(pdfUrl, d.url).href;
      fileUrl = abs;
      text = (await extractText(await fetchBuf(abs), abs)).replace(/\u0000/g, '').trim().slice(0, MAX_TEXT);
    } catch (e) { console.warn('[cfc] download falhou', pdfUrl, e.message); }
  }
  await query(
    `INSERT INTO knowledge_base (title, type, content, summary, tags, file_url, file_name, visibility, author, source, status, source_url, external_code)
     VALUES ($1,'legislation',$2,$3,$4,$5,$6,'public','Conselho Federal de Contabilidade',$7,'published',$8,$9)
     ON CONFLICT (external_code) WHERE external_code IS NOT NULL
     DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, summary=EXCLUDED.summary, tags=EXCLUDED.tags,
       file_url=EXCLUDED.file_url, file_name=EXCLUDED.file_name, source=EXCLUDED.source, source_url=EXCLUDED.source_url, updated_at=now()`,
    [title, text, summary, JSON.stringify(tagsFor(title).concat(d.revoked ? ['Revogada'] : [])), fileUrl, fileUrl ? decodeURIComponent(fileUrl.split('/').pop()) : null, source, d.url, d.code.toLowerCase()],
  );
  return !!text;
}

async function run(mode = 'incremental') {
  if (state.running) return { started: false, reason: 'Sincronização já em andamento' };
  state.running = true; state.mode = mode;
  state.progress = { total: 0, done: 0, withText: 0, errors: 0, skipped: 0 };
  const log = (await query('INSERT INTO kb_sync_log (mode) VALUES ($1) RETURNING id', [mode])).rows[0];
  (async () => {
    try {
      const found = await discover();
      let todo = found;
      if (mode !== 'full') {
        const have = new Set((await query('SELECT external_code FROM knowledge_base WHERE external_code IS NOT NULL')).rows.map((r) => r.external_code));
        todo = found.filter((d) => !have.has(d.code.toLowerCase()));
        state.progress.skipped = found.length - todo.length;
      }
      state.progress.total = todo.length;
      let i = 0;
      await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
        while (i < todo.length) {
          const d = todo[i++];
          try { if (await processDoc(d)) state.progress.withText++; } catch (e) { state.progress.errors++; console.warn('[cfc]', d.code, e.message); }
          state.progress.done++;
        }
      }));
    } catch (e) {
      console.error('[cfc] sync erro:', e.message);
      state.progress.fatal = e.message;
    } finally {
      state.last = { ...state.progress, mode, finished_at: new Date().toISOString() };
      await query('UPDATE kb_sync_log SET finished_at=now(), stats=$2 WHERE id=$1', [log.id, JSON.stringify(state.last)]).catch(() => {});
      state.running = false;
    }
  })();
  return { started: true, mode };
}

/** Agenda: checagem diária (novas normas) + reprocessamento completo anual */
function schedule() {
  if (process.env.BASE44_PREVIEW_MODE === '1' || process.env.KB_SYNC_AUTO === '0') return;
  const tick = async () => {
    try {
      const last = (await query("SELECT MAX(started_at) AS t FROM kb_sync_log WHERE mode='full'")).rows[0].t;
      const needFull = !last || Date.now() - new Date(last).getTime() > 365 * 86400000;
      await run(needFull ? 'full' : 'incremental');
    } catch (e) { console.warn('[cfc] agendamento:', e.message); }
  };
  setTimeout(tick, 60000);
  setInterval(tick, 24 * 3600 * 1000);
}

async function status() {
  const count = (await query("SELECT COUNT(*)::int AS n FROM knowledge_base WHERE external_code IS NOT NULL")).rows[0].n;
  return { ...state, imported: count };
}

module.exports = { run, status, schedule };
