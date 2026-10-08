/**
 * parceiros.js — Formulário progressivo de interesse (Entrega A)
 * Cadastro de interesse sem compromisso. Não simula sucesso.
 * Confirma somente após persistência real no servidor.
 */
(function () {
  'use strict';

  var API = '/api';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  function showFieldError(name, show, msg) {
    var input = document.querySelector('[name="' + name + '"]');
    var errEl = document.querySelector('[data-error="' + name + '"]');
    if (input) input.classList.toggle('err', show);
    if (errEl) {
      errEl.classList.toggle('show', show);
      if (msg) errEl.textContent = msg;
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getCheckedInterests() {
    return Array.from(document.querySelectorAll('input[name="interest"]:checked'))
      .map(function (c) { return c.value; });
  }

  function getCheckedProfile() {
    var checked = document.querySelector('input[name="profile"]:checked');
    return checked ? checked.value : null;
  }

  function showAlert(msg) {
    var alert = $('#parceiros-form-alert');
    if (alert) {
      alert.textContent = msg;
      alert.classList.add('show', 'error');
    }
  }

  function hideAlert() {
    var alert = $('#parceiros-form-alert');
    if (alert) {
      alert.classList.remove('show', 'error');
    }
  }

  function setSubmitting(btn, loading) {
    if (loading) {
      btn.dataset.origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.origText || 'Quero ser parceiro';
    }
  }

  function showSuccess() {
    var formCard = $('#parceiros-form-card');
    var successDiv = $('#parceiros-form-success');
    if (formCard && successDiv) {
      formCard.style.display = 'none';
      successDiv.classList.add('show');
    }
  }

  function initForm() {
    var form = $('#parceiros-interest-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert();

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var phone = form.querySelector('[name="phone"]').value.trim();
      var profile = getCheckedProfile();
      var interests = getCheckedInterests();
      var marketing = document.querySelector('[name="marketing_opt_in"]');
      var btn = form.querySelector('.btn-submit');

      var hasError = false;

      // Validate name
      if (!name) {
        showFieldError('name', true, 'Informe seu nome');
        hasError = true;
      } else {
        showFieldError('name', false);
      }

      // Validate email
      if (!email) {
        showFieldError('email', true, 'Informe seu e-mail profissional');
        hasError = true;
      } else if (!validateEmail(email)) {
        showFieldError('email', true, 'E-mail inválido');
        hasError = true;
      } else {
        showFieldError('email', false);
      }

      // Validate profile
      if (!profile) {
        showFieldError('profile', true, 'Selecione seu perfil');
        hasError = true;
      } else {
        showFieldError('profile', false);
      }

      // Validate at least one interest
      if (interests.length === 0) {
        showFieldError('interest', true, 'Selecione ao menos um interesse');
        hasError = true;
      } else {
        showFieldError('interest', false);
      }

      if (hasError) return;

      setSubmitting(btn, true);

      fetch(API + '/public/partner-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone || null,
          profile: profile,
          interest: interests,
          marketing_opt_in: marketing ? marketing.checked : false,
        }),
      })
        .then(function (r) {
          return r.json().then(function (j) { return { ok: r.ok, data: j }; });
        })
        .then(function (res) {
          setSubmitting(btn, false);
          if (res.ok && res.data.success) {
            showSuccess();
          } else {
            showAlert(res.data.error || 'Erro ao registrar interesse. Tente novamente.');
          }
        })
        .catch(function () {
          setSubmitting(btn, false);
          showAlert('Erro de conexão. Verifique sua internet e tente novamente.');
        });
    });

    // Clear field errors on input
    ['name', 'email', 'phone'].forEach(function (field) {
      var el = form.querySelector('[name="' + field + '"]');
      if (el) {
        el.addEventListener('input', function () { showFieldError(field, false); });
      }
    });

    // Clear profile/interest errors on change
    document.querySelectorAll('input[name="profile"]').forEach(function (el) {
      el.addEventListener('change', function () { showFieldError('profile', false); });
    });
    document.querySelectorAll('input[name="interest"]').forEach(function (el) {
      el.addEventListener('change', function () { showFieldError('interest', false); });
    });
  }

  // Smooth scroll for nav links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target && target.id) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initForm();
    initSmoothScroll();
  });
})();
