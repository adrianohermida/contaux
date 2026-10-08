/**
 * site-modals.js — Sistema de modais do site institucional Contaux
 * Login, Cadastro, Redefinição de senha, Captação de leads, Newsletter.
 * Autoinicializável: basta incluir o script e adicionar data attributes.
 */
(function () {
  'use strict';

  var API = '/api';

  /* ===== Helpers ===== */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function post(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, data: j }; }); });
  }

  /* ===== Modal core ===== */
  function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
  }
  function closeModal(el) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    el.classList.remove('active');
    document.body.style.overflow = '';
    var alert = el.querySelector('.ctx-alert');
    if (alert) alert.classList.remove('active');
  }

  function showAlert(modal, type, msg) {
    var alert = modal.querySelector('.ctx-alert');
    if (!alert) return;
    alert.className = 'ctx-alert active ctx-alert-' + (type === 'error' ? 'error' : 'success');
    alert.textContent = msg;
  }
  function setBtnLoading(btn) {
    btn.dataset.origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Aguarde...';
  }
  function resetBtn(btn) {
    btn.disabled = false;
    btn.textContent = btn.dataset.origText || btn.textContent;
  }

  /* ===== Build modal HTML (injected once) ===== */
  function injectModals() {
    var logo = 'assets/images/contaux_blue.png';

    var html = ''
      // Overlay: Login
      + '<div class="ctx-overlay" id="ctx-login-modal">'
      +   '<div class="ctx-modal">'
      +     '<button class="ctx-modal-close" data-close>&times;</button>'
      +     '<div class="ctx-modal-header"><img src="' + logo + '" alt="Contaux"><h3>Acessar plataforma</h3><p>Entre com seus dados para acessar o dashboard</p></div>'
      +     '<div class="ctx-modal-body">'
      +       '<div class="ctx-alert"></div>'
      +       '<form id="ctx-login-form">'
      +         '<div class="ctx-field"><label>E-mail</label><input type="email" name="email" required placeholder="seu@email.com"></div>'
      +         '<div class="ctx-field"><label>Senha</label><input type="password" name="password" required placeholder="••••••••"></div>'
      +         '<div style="text-align:right;margin-bottom:14px;"><button type="button" class="ctx-link" data-open="ctx-reset-modal" data-close-parent="ctx-login-modal">Esqueci minha senha</button></div>'
      +         '<button type="submit" class="ctx-btn ctx-btn-primary">Entrar</button>'
      +       '</form>'
      +       '<div class="ctx-divider"><span>ou</span></div>'
      +       '<button class="ctx-btn ctx-btn-secondary" data-open="ctx-register-modal" data-close-parent="ctx-login-modal">Criar nova conta</button>'
      +     '</div>'
      +   '</div>'
      + '</div>'

      // Overlay: Cadastro
      + '<div class="ctx-overlay" id="ctx-register-modal">'
      +   '<div class="ctx-modal ctx-modal-lg">'
      +     '<button class="ctx-modal-close" data-close>&times;</button>'
      +     '<div class="ctx-modal-header"><img src="' + logo + '" alt="Contaux"><h3>Criar sua conta</h3><p>Cadastre-se para acessar o portal do cliente</p></div>'
      +     '<div class="ctx-modal-body">'
      +       '<div class="ctx-alert"></div>'
      +       '<form id="ctx-register-form">'
      +         '<div class="ctx-row">'
      +           '<div class="ctx-field"><label>Nome completo *</label><input type="text" name="name" required placeholder="Seu nome"></div>'
      +           '<div class="ctx-field"><label>Empresa / Escritório</label><input type="text" name="company_name" placeholder="Nome da empresa"></div>'
      +         '</div>'
      +         '<div class="ctx-row">'
      +           '<div class="ctx-field"><label>E-mail *</label><input type="email" name="email" required placeholder="seu@email.com"></div>'
      +           '<div class="ctx-field"><label>Telefone</label><input type="tel" name="phone" placeholder="(00) 00000-0000"></div>'
      +         '</div>'
      +         '<div class="ctx-row">'
      +           '<div class="ctx-field"><label>CPF/CNPJ</label><input type="text" name="document" placeholder="000.000.000-00"></div>'
      +           '<div class="ctx-field"><label>Senha *</label><input type="password" name="password" required minlength="6" placeholder="Mínimo 6 caracteres"></div>'
      +         '</div>'
      +         '<button type="submit" class="ctx-btn ctx-btn-primary" style="margin-top:4px;">Criar conta</button>'
      +       '</form>'
      +       '<p class="ctx-switch-text">Já tem conta? <a data-open="ctx-login-modal" data-close-parent="ctx-register-modal">Entrar</a></p>'
      +     '</div>'
      +   '</div>'
      + '</div>'

      // Overlay: Redefinir senha
      + '<div class="ctx-overlay" id="ctx-reset-modal">'
      +   '<div class="ctx-modal">'
      +     '<button class="ctx-modal-close" data-close>&times;</button>'
      +     '<div class="ctx-modal-header"><img src="' + logo + '" alt="Contaux"><h3>Redefinir senha</h3><p>Informe seu e-mail para receber as instruções</p></div>'
      +     '<div class="ctx-modal-body">'
      +       '<div class="ctx-alert"></div>'
      +       '<form id="ctx-forgot-form">'
      +         '<div class="ctx-field"><label>E-mail</label><input type="email" name="email" required placeholder="seu@email.com"></div>'
      +         '<button type="submit" class="ctx-btn ctx-btn-primary">Enviar instruções</button>'
      +       '</form>'
      +       '<p class="ctx-switch-text"><a data-open="ctx-login-modal" data-close-parent="ctx-reset-modal">Voltar para login</a></p>'
      +     '</div>'
      +   '</div>'
      + '</div>'

      // Overlay: Lead capture
      + '<div class="ctx-overlay" id="ctx-lead-modal">'
      +   '<div class="ctx-modal ctx-modal-lg">'
      +     '<button class="ctx-modal-close" data-close>&times;</button>'
      +     '<div class="ctx-modal-header"><img src="' + logo + '" alt="Contaux"><h3>Fale com um especialista</h3><p>Preencha o formulário e entraremos em contato</p></div>'
      +     '<div class="ctx-modal-body">'
      +       '<div class="ctx-alert"></div>'
      +       '<form id="ctx-lead-form">'
      +         '<div class="ctx-row">'
      +           '<div class="ctx-field"><label>Nome *</label><input type="text" name="name" required placeholder="Seu nome"></div>'
      +           '<div class="ctx-field"><label>Telefone</label><input type="tel" name="phone" placeholder="(00) 00000-0000"></div>'
      +         '</div>'
      +         '<div class="ctx-field"><label>E-mail *</label><input type="email" name="email" required placeholder="seu@email.com"></div>'
      +         '<div class="ctx-field"><label>Serviço de interesse</label><select name="service_interest">'
      +           '<option value="">Selecione...</option>'
      +           '<option>Abertura de PJ</option><option>Contabilidade mensal</option><option>Planejamento tributário</option>'
      +           '<option>Departamento pessoal</option><option>Consultoria jurídica</option><option>Outros</option>'
      +         '</select></div>'
      +         '<div class="ctx-field"><label>Mensagem</label><textarea name="message" placeholder="Conte-nos como podemos ajudar..."></textarea></div>'
      +         '<button type="submit" class="ctx-btn ctx-btn-primary">Enviar</button>'
      +       '</form>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    var container = document.createElement('div');
    container.innerHTML = html;
    while (container.firstChild) document.body.appendChild(container.firstChild);
  }

  /* ===== Event wiring ===== */
  function initEvents() {
    // Close on overlay click / close button
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('ctx-overlay')) { closeModal(e.target); return; }
      if (e.target.hasAttribute('data-close')) { closeModal(e.target.closest('.ctx-overlay')); return; }
      // Open via data-open
      var opener = e.target.closest('[data-open]');
      if (opener) {
        e.preventDefault();
        var cp = opener.getAttribute('data-close-parent');
        if (cp) closeModal(cp);
        openModal(opener.getAttribute('data-open'));
        return;
      }
      // Login button in header
      if (e.target.closest('[data-ctx-login]')) {
        e.preventDefault();
        openModal('ctx-login-modal');
      }
      // Lead button
      if (e.target.closest('[data-ctx-lead]')) {
        e.preventDefault();
        openModal('ctx-lead-modal');
      }
    });

    // Esc to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var open = document.querySelector('.ctx-overlay.active');
        if (open) closeModal(open);
      }
    });

    // Login form
    var loginForm = document.getElementById('ctx-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var modal = document.getElementById('ctx-login-modal');
        var btn = loginForm.querySelector('button[type=submit]');
        setBtnLoading(btn);
        post(API + '/auth/login', {
          email: loginForm.email.value,
          password: loginForm.password.value,
        }).then(function (res) {
          resetBtn(btn);
          if (res.ok && res.data.token) {
            localStorage.setItem('contaux-token', res.data.token);
            localStorage.setItem('contaux-user', JSON.stringify(res.data.user));
            showAlert(modal, 'success', 'Login realizado! Redirecionando...');
            var role = res.data.user.role;
            setTimeout(function () {
              window.location.href = (role === 'client') ? '/portal' : '/dashboard';
            }, 800);
          } else {
            showAlert(modal, 'error', res.data.error || 'Credenciais inválidas');
          }
        }).catch(function () {
          resetBtn(btn);
          showAlert(modal, 'error', 'Erro de conexão. Tente novamente.');
        });
      });
    }

    // Register form
    var regForm = document.getElementById('ctx-register-form');
    if (regForm) {
      regForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var modal = document.getElementById('ctx-register-modal');
        var btn = regForm.querySelector('button[type=submit]');
        setBtnLoading(btn);
        post(API + '/public/register', {
          name: regForm.name.value,
          email: regForm.email.value,
          password: regForm.password.value,
          phone: regForm.phone.value,
          company_name: regForm.company_name.value,
          document: regForm.document.value,
        }).then(function (res) {
          resetBtn(btn);
          if (res.ok && res.data.token) {
            localStorage.setItem('contaux-token', res.data.token);
            localStorage.setItem('contaux-user', JSON.stringify(res.data.user));
            showAlert(modal, 'success', 'Conta criada! Redirecionando...');
            setTimeout(function () { window.location.href = '/portal'; }, 800);
          } else {
            showAlert(modal, 'error', res.data.error || 'Erro ao criar conta');
          }
        }).catch(function () {
          resetBtn(btn);
          showAlert(modal, 'error', 'Erro de conexão. Tente novamente.');
        });
      });
    }

    // Forgot password form
    var forgotForm = document.getElementById('ctx-forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var modal = document.getElementById('ctx-reset-modal');
        var btn = forgotForm.querySelector('button[type=submit]');
        setBtnLoading(btn);
        post(API + '/public/forgot-password', { email: forgotForm.email.value }).then(function (res) {
          resetBtn(btn);
          if (res.ok) {
            showAlert(modal, 'success', res.data.message || 'Instruções enviadas para seu e-mail');
            forgotForm.reset();
          } else {
            showAlert(modal, 'error', res.data.error || 'Erro ao processar');
          }
        }).catch(function () {
          resetBtn(btn);
          showAlert(modal, 'error', 'Erro de conexão. Tente novamente.');
        });
      });
    }

    // Lead form
    var leadForm = document.getElementById('ctx-lead-form');
    if (leadForm) {
      leadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var modal = document.getElementById('ctx-lead-modal');
        var btn = leadForm.querySelector('button[type=submit]');
        setBtnLoading(btn);
        post(API + '/public/leads', {
          name: leadForm.name.value,
          email: leadForm.email.value,
          phone: leadForm.phone.value,
          service_interest: leadForm.service_interest.value,
          message: leadForm.message.value,
        }).then(function (res) {
          resetBtn(btn);
          if (res.ok) {
            showAlert(modal, 'success', 'Recebemos seu contato! Em breve entraremos em contato.');
            leadForm.reset();
            setTimeout(function () { closeModal(modal); }, 2000);
          } else {
            showAlert(modal, 'error', res.data.error || 'Erro ao enviar');
          }
        }).catch(function () {
          resetBtn(btn);
          showAlert(modal, 'error', 'Erro de conexão. Tente novamente.');
        });
      });
    }

    // Newsletter forms (inline)
    document.querySelectorAll('.newsletter-inner').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[name=EMAIL]');
        var btn = form.querySelector('button');
        var msg = form.querySelector('.ctx-newsletter-msg');
        if (!input || !input.value.trim()) return;
        if (btn) { setBtnLoading(btn); }
        post(API + '/public/newsletter', { email: input.value }).then(function (res) {
          if (btn) resetBtn(btn);
          if (!msg) {
            msg = document.createElement('div');
            msg.className = 'ctx-newsletter-msg';
            form.appendChild(msg);
          }
          msg.className = 'ctx-newsletter-msg active ' + (res.ok ? 'success' : 'error');
          msg.textContent = res.ok ? (res.data.message || 'Inscrição realizada!') : (res.data.error || 'Erro ao inscrever');
          if (res.ok) form.reset();
        }).catch(function () {
          if (btn) resetBtn(btn);
          if (!msg) {
            msg = document.createElement('div');
            msg.className = 'ctx-newsletter-msg';
            form.appendChild(msg);
          }
          msg.className = 'ctx-newsletter-msg active error';
          msg.textContent = 'Erro de conexão. Tente novamente.';
        });
      });
    });
  }

  /* ===== Reset password page (standalone) ===== */
  function initResetPage() {
    var form = document.getElementById('ctx-reset-page-form');
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    var token = params.get('token');
    if (!token) {
      form.innerHTML = '<div class="ctx-alert active ctx-alert-error">Link inválido. Solicite uma nova redefinição de senha.</div>';
      return;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var alert = form.querySelector('.ctx-alert');
      var pw = form.password.value;
      var pw2 = form.password_confirm.value;
      if (pw !== pw2) { alert.className = 'ctx-alert active ctx-alert-error'; alert.textContent = 'As senhas não coincidem'; return; }
      setBtnLoading(btn);
      post(API + '/public/reset-password', { token: token, password: pw }).then(function (res) {
        resetBtn(btn);
        if (res.ok) {
          alert.className = 'ctx-alert active ctx-alert-success';
          alert.textContent = 'Senha redefinida! Redirecionando para login...';
          setTimeout(function () { window.location.href = '/'; }, 1500);
        } else {
          alert.className = 'ctx-alert active ctx-alert-error';
          alert.textContent = res.data.error || 'Erro ao redefinir';
        }
      }).catch(function () {
        resetBtn(btn);
        alert.className = 'ctx-alert active ctx-alert-error';
        alert.textContent = 'Erro de conexão';
      });
    });
  }

  /* ===== Init ===== */
  function init() {
    injectModals();
    initEvents();
    initResetPage();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
