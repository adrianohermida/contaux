/**
 * Widget de Atendimento — Site Público Contaux.
 * Botão flutuante que abre um chat limpo para captar leads e responder dúvidas.
 * Self-contained (vanilla JS + CSS inline), sem dependências.
 */
(function () {
  'use strict';

  var BRAND = '#3763EB';
  var BRAND_HOVER = '#2b50c4';
  var isOpen = false;
  var messages = [];
  var loading = false;

  // ===== Estilos =====
  var css = `
    .contaux-chat-btn{position:fixed;bottom:20px;right:20px;z-index:99998;width:56px;height:56px;
      border-radius:50%;background:${BRAND};color:#fff;border:none;cursor:pointer;
      box-shadow:0 4px 16px rgba(55,99,235,.4);display:flex;align-items:center;justify-content:center;
      transition:transform .2s,background .2s;font-size:24px}
    .contaux-chat-btn:hover{background:${BRAND_HOVER};transform:scale(1.05)}
    .contaux-chat-panel{position:fixed;bottom:20px;right:20px;z-index:99999;width:360px;max-width:calc(100vw - 40px);
      height:520px;max-height:calc(100vh - 40px);background:#fff;border-radius:16px;
      box-shadow:0 8px 32px rgba(0,0,0,.15);display:none;flex-direction:column;overflow:hidden;
      font-family:'Spartan',sans-serif}
    .contaux-chat-panel.open{display:flex;animation:contaux-slide-up .2s ease}
    @keyframes contaux-slide-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .contaux-chat-header{padding:14px 16px;background:${BRAND};color:#fff;display:flex;
      align-items:center;justify-content:space-between;flex-shrink:0}
    .contaux-chat-header h3{margin:0;font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px}
    .contaux-chat-close{background:none;border:none;color:#fff;cursor:pointer;font-size:20px;padding:0;line-height:1;opacity:.8}
    .contaux-chat-close:hover{opacity:1}
    .contaux-chat-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;
      background:#f8f9fb}
    .contaux-chat-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5}
    .contaux-chat-msg.user{align-self:flex-end;background:${BRAND};color:#fff;border-bottom-right-radius:4px}
    .contaux-chat-msg.bot{align-self:flex-start;background:#fff;color:#333;border:1px solid #e8e8e8;border-bottom-left-radius:4px}
    .contaux-chat-msg.bot a{color:${BRAND}}
    .contaux-chat-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px;background:#fff;
      border:1px solid #e8e8e8;border-radius:12px;border-bottom-left-radius:4px}
    .contaux-chat-typing span{width:6px;height:6px;border-radius:50%;background:#aaa;animation:contaux-bounce 1s infinite}
    .contaux-chat-typing span:nth-child(2){animation-delay:.15s}
    .contaux-chat-typing span:nth-child(3){animation-delay:.3s}
    @keyframes contaux-bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}
    .contaux-chat-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 8px;background:#f8f9fb}
    .contaux-chat-quick button{font-size:12px;padding:6px 12px;border:1px solid ${BRAND}40;
      background:${BRAND}0d;color:${BRAND};border-radius:16px;cursor:pointer;transition:background .15s}
    .contaux-chat-quick button:hover{background:${BRAND}1a}
    .contaux-chat-input-area{padding:10px 12px;border-top:1px solid #eee;background:#fff;flex-shrink:0;
      display:flex;gap:8px;align-items:flex-end}
    .contaux-chat-input{flex:1;border:1px solid #ddd;border-radius:20px;padding:10px 14px;
      font-size:13px;font-family:inherit;outline:none;resize:none;max-height:80px;line-height:1.4}
    .contaux-chat-input:focus{border-color:${BRAND}}
    .contaux-chat-send{width:38px;height:38px;border-radius:50%;background:${BRAND};color:#fff;
      border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
      font-size:16px;flex-shrink:0;transition:background .15s}
    .contaux-chat-send:hover{background:${BRAND_HOVER}}
    .contaux-chat-send:disabled{background:#ccc;cursor:not-allowed}
    @media(max-width:480px){
      .contaux-chat-panel{bottom:0;right:0;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:0}
    }
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ===== DOM =====
  var btn = document.createElement('button');
  btn.className = 'contaux-chat-btn';
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  btn.setAttribute('aria-label', 'Abrir chat de atendimento');
  btn.title = 'Fale conosco';
  document.body.appendChild(btn);

  var panel = document.createElement('div');
  panel.className = 'contaux-chat-panel';
  panel.innerHTML = `
    <div class="contaux-chat-header">
      <h3>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        Atendimento Contaux
      </h3>
      <button class="contaux-chat-close" aria-label="Fechar chat">&times;</button>
    </div>
    <div class="contaux-chat-body" id="contaux-chat-body"></div>
    <div class="contaux-chat-quick" id="contaux-chat-quick"></div>
    <div class="contaux-chat-input-area">
      <textarea class="contaux-chat-input" id="contaux-chat-input" rows="1" placeholder="Digite sua mensagem..."></textarea>
      <button class="contaux-chat-send" id="contaux-chat-send" aria-label="Enviar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  var body = panel.querySelector('#contaux-chat-body');
  var input = panel.querySelector('#contaux-chat-input');
  var sendBtn = panel.querySelector('#contaux-chat-send');
  var closeBtn = panel.querySelector('.contaux-chat-close');
  var quickArea = panel.querySelector('#contaux-chat-quick');

  // ===== Estado inicial =====
  var QUICK_REPLIES = [
    'Quero saber sobre serviços',
    'Como funciona o atendimento?',
    'Quero ser parceiro',
    'Falar com um contador',
  ];

  function addMessage(text, role) {
    var div = document.createElement('div');
    div.className = 'contaux-chat-msg ' + (role === 'user' ? 'user' : 'bot');
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'contaux-chat-typing';
    div.id = 'contaux-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById('contaux-typing');
    if (t) t.remove();
  }

  function showQuickReplies() {
    quickArea.innerHTML = '';
    QUICK_REPLIES.forEach(function (q) {
      var b = document.createElement('button');
      b.textContent = q;
      b.onclick = function () {
        quickArea.innerHTML = '';
        sendMessage(q);
      };
      quickArea.appendChild(b);
    });
  }

  function sendMessage(text) {
    if (!text.trim() || loading) return;
    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';
    loading = true;
    sendBtn.disabled = true;
    showTyping();

    fetch('/api/public/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        loading = false;
        sendBtn.disabled = false;
        addMessage(data.answer || 'Desculpe, não consegui processar sua mensagem. Tente novamente.', 'bot');
        if (data.collectContact) {
          addMessage('Deixe seu email para que nossa equipe entre em contato: <a href="/contato.html" style="color:' + BRAND + ';font-weight:600">Falar com a Contaux</a>', 'bot');
        }
      })
      .catch(function () {
        hideTyping();
        loading = false;
        sendBtn.disabled = false;
        addMessage('Estamos com dificuldades técnicas no momento. Tente novamente em alguns instantes ou acesse nossa <a href="/contato.html">página de contato</a>.', 'bot');
      });
  }

  // ===== Eventos =====
  btn.addEventListener('click', function () {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    btn.style.display = isOpen ? 'none' : 'flex';
    if (isOpen && messages.length === 0) {
      addMessage('Olá! Sou o assistente virtual da Contaux. Como posso ajudar você hoje?', 'bot');
      showQuickReplies();
      setTimeout(function () { input.focus(); }, 100);
    }
  });

  closeBtn.addEventListener('click', function () {
    isOpen = false;
    panel.classList.remove('open');
    btn.style.display = 'flex';
  });

  sendBtn.addEventListener('click', function () {
    sendMessage(input.value);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });
})();
