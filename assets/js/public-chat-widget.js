/**
 * Widget de Atendimento — Site Público Contaux (CQ-04).
 * Botão flutuante que abre um chat limpo para captar leads e responder dúvidas.
 * Suporta conversas persistentes (visitor_token) e handoff IA→humano.
 * Self-contained (vanilla JS + CSS inline), sem dependências.
 */
(function () {
  'use strict';

  var BRAND = '#3763EB';
  var BRAND_HOVER = '#2b50c4';
  var isOpen = false;
  var loading = false;
  var visitorToken = null;
  var conversationStatus = 'active';
  var pollInterval = null;

  // Persiste visitor_token em localStorage
  try {
    visitorToken = localStorage.getItem('contaux-visitor-token');
  } catch (e) {}

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
    .contaux-chat-status{font-size:11px;opacity:.85;margin-top:2px}
    .contaux-chat-close{background:none;border:none;color:#fff;cursor:pointer;font-size:20px;padding:0;line-height:1;opacity:.8}
    .contaux-chat-close:hover{opacity:1}
    .contaux-chat-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;
      background:#f8f9fb}
    .contaux-chat-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5}
    .contaux-chat-msg.user{align-self:flex-end;background:${BRAND};color:#fff;border-bottom-right-radius:4px}
    .contaux-chat-msg.bot{align-self:flex-start;background:#fff;color:#333;border:1px solid #e8e8e8;border-bottom-left-radius:4px}
    .contaux-chat-msg.human{align-self:flex-start;background:#e8f5e9;color:#1b5e20;border:1px solid #c8e6c9;border-bottom-left-radius:4px}
    .contaux-chat-msg.system{align-self:center;max-width:90%;background:#fff3cd;color:#856404;border:1px solid #ffeaa7;border-radius:16px;font-size:11px;text-align:center}
    .contaux-chat-msg.bot a,.contaux-chat-msg.human a{color:${BRAND}}
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
    .contaux-chat-handoff{display:flex;justify-content:center;padding:4px 12px 8px;background:#f8f9fb}
    .contaux-chat-handoff button{font-size:12px;padding:6px 16px;border:1px solid ${BRAND};
      background:#fff;color:${BRAND};border-radius:20px;cursor:pointer;font-weight:600;transition:background .15s}
    .contaux-chat-handoff button:hover{background:${BRAND}0d}
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
      <div>
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Atendimento Contaux
        </h3>
        <div class="contaux-chat-status" id="contaux-chat-status">Assistente virtual</div>
      </div>
      <button class="contaux-chat-close" aria-label="Fechar chat">&times;</button>
    </div>
    <div class="contaux-chat-body" id="contaux-chat-body"></div>
    <div class="contaux-chat-quick" id="contaux-chat-quick"></div>
    <div class="contaux-chat-handoff" id="contaux-chat-handoff" style="display:none"></div>
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
  var handoffArea = panel.querySelector('#contaux-chat-handoff');
  var statusEl = panel.querySelector('#contaux-chat-status');

  // ===== Estado inicial =====
  var QUICK_REPLIES = [
    'Quero saber sobre serviços',
    'Como funciona o atendimento?',
    'Quero ser parceiro',
    'Falar com um contador',
  ];

  function addMessage(text, role, authorName) {
    var div = document.createElement('div');
    var cls = role === 'user' ? 'user' : role === 'system' ? 'system' : role === 'human' ? 'human' : 'bot';
    div.className = 'contaux-chat-msg ' + cls;
    if (authorName && role === 'human') {
      div.innerHTML = '<strong style="font-size:11px;display:block;margin-bottom:2px">' + authorName + '</strong>' + text;
    } else {
      div.innerHTML = text;
    }
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

  function updateStatus(status) {
    conversationStatus = status;
    if (status === 'waiting_human') {
      statusEl.textContent = 'Aguardando atendente...';
      statusEl.style.color = '#ffd54f';
    } else if (status === 'with_human') {
      statusEl.textContent = 'Com atendente';
      statusEl.style.color = '#81c784';
    } else if (status === 'closed') {
      statusEl.textContent = 'Atendimento encerrado';
      statusEl.style.color = '#e0e0e0';
    } else {
      statusEl.textContent = 'Assistente virtual';
      statusEl.style.color = '';
    }
  }

  function showHandoffButton() {
    handoffArea.innerHTML = '';
    var b = document.createElement('button');
    b.textContent = '🎧 Falar com atendente';
    b.onclick = function () {
      handoffArea.innerHTML = '';
      requestHandoff();
    };
    handoffArea.appendChild(b);
    handoffArea.style.display = 'flex';
  }

  function hideHandoffButton() {
    handoffArea.style.display = 'none';
    handoffArea.innerHTML = '';
  }

  // Polling para mensagens do staff quando em handoff
  var lastPoll = Date.now();
  function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(function () {
      if (!visitorToken) return;
      fetch('/api/public/chat/status?visitor_token=' + encodeURIComponent(visitorToken) + '&since=' + lastPoll)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.status && data.status !== conversationStatus) {
            updateStatus(data.status);
            if (data.status === 'with_human') {
              addMessage('Um atendente assumiu sua conversa!', 'system');
            } else if (data.status === 'closed') {
              addMessage('Atendimento encerrado. Obrigado pelo contato!', 'system');
              hideHandoffButton();
              stopPolling();
            }
          }
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach(function (m) {
              if (m.role === 'system') {
                addMessage(m.text, 'system');
              } else if (m.role === 'user' && m.author_name && m.author_name !== 'Visitante') {
                addMessage(m.text, 'human', m.author_name);
              } else if (m.role === 'assistant') {
                addMessage(m.text.replace(/\n/g, '<br>'), 'bot');
              }
            });
            lastPoll = Date.now();
          }
        })
        .catch(function () {});
    }, 5000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
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
      body: JSON.stringify({ message: text, visitor_token: visitorToken }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        loading = false;
        sendBtn.disabled = false;

        // Persiste visitor_token
        if (data.visitor_token) {
          visitorToken = data.visitor_token;
          try { localStorage.setItem('contaux-visitor-token', visitorToken); } catch (e) {}
        }

        // Atualiza status
        if (data.status) {
          updateStatus(data.status);
          if (data.status === 'waiting_human' || data.status === 'with_human') {
            startPolling();
          }
        }

        addMessage(data.answer || 'Desculpe, não consegui processar sua mensagem. Tente novamente.', data.ai_paused ? 'system' : 'bot');

        if (data.collectContact) {
          addMessage('Deixe seu email para que nossa equipe entre em contato: <a href="/contato.html" style="color:' + BRAND + ';font-weight:600">Falar com a Contaux</a>', 'bot');
        }

        // Mostra botão de handoff após primeira interação
        if (data.status === 'active' && !data.ai_paused) {
          showHandoffButton();
        } else {
          hideHandoffButton();
        }
      })
      .catch(function () {
        hideTyping();
        loading = false;
        sendBtn.disabled = false;
        addMessage('Estamos com dificuldades técnicas no momento. Tente novamente em alguns instantes ou acesse nossa <a href="/contato.html">página de contato</a>.', 'bot');
      });
  }

  function requestHandoff() {
    if (!visitorToken) return;
    addMessage('Solicitando atendimento humano...', 'system');
    fetch('/api/public/chat/handoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_token: visitorToken }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status) {
          updateStatus(data.status);
          addMessage('Você está na fila de atendimento. Um atendente responderá em breve.', 'system');
          startPolling();
        }
      })
      .catch(function () {
        addMessage('Não foi possível solicitar atendimento agora. Tente novamente.', 'system');
      });
  }

  // ===== Eventos =====
  btn.addEventListener('click', function () {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    btn.style.display = isOpen ? 'none' : 'flex';
    if (isOpen && body.children.length === 0) {
      addMessage('Olá! Sou o assistente virtual da Contaux. Como posso ajudar você hoje?', 'bot');
      showQuickReplies();
      // Se já tem conversa com handoff, retoma polling
      if (visitorToken && (conversationStatus === 'waiting_human' || conversationStatus === 'with_human')) {
        startPolling();
      }
      setTimeout(function () { input.focus(); }, 100);
    }
  });

  closeBtn.addEventListener('click', function () {
    isOpen = false;
    panel.classList.remove('open');
    btn.style.display = 'flex';
    stopPolling();
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
