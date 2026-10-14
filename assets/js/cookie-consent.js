/**
 * Cookie Consent — Contaux Contadoria
 * Controle efetivo de consentimento para cookies analíticos.
 * A navegação continuada NÃO presume consentimento (LGPD art. 8º §2º).
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'contaux_cookie_consent';
    var GA_ID = 'G-NJDCLRY9PJ';

    function getConsent() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) { /* ignore */ }
    }

    function loadGA() {
        if (typeof gtag === 'function') return; // já carregado
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', GA_ID, { 'anonymize_ip': true });
    }

    function unloadGA() {
        // Remove cookies do GA se o usuário revogar o consentimento
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var name = cookies[i].split('=')[0].trim();
            if (name.indexOf('_ga') === 0 || name.indexOf('_gid') === 0 || name.indexOf('_gat') === 0) {
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
            }
        }
    }

    function createBanner() {
        var existing = document.getElementById('cookie-consent-banner');
        if (existing) existing.remove();

        var banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML =
            '<div class="cookie-consent-inner">' +
                '<div class="cookie-consent-text">' +
                    '<p>Usamos cookies essenciais para o funcionamento do site e cookies analíticos para entender a utilização. ' +
                    'Você pode aceitar ou recusar os cookies analíticos a qualquer momento. ' +
                    'Consulte nossa <a href="/politica-de-privacidade.html">Política de Privacidade</a>.</p>' +
                '</div>' +
                '<div class="cookie-consent-buttons">' +
                    '<button type="button" class="cookie-btn cookie-btn-accept" id="cookie-accept">Aceitar</button>' +
                    '<button type="button" class="cookie-btn cookie-btn-refuse" id="cookie-refuse">Recusar</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(banner);

        document.getElementById('cookie-accept').addEventListener('click', function () {
            setConsent('accepted');
            loadGA();
            banner.remove();
        });

        document.getElementById('cookie-refuse').addEventListener('click', function () {
            setConsent('refused');
            unloadGA();
            banner.remove();
        });
    }

    function init() {
        var consent = getConsent();

        if (consent === 'accepted') {
            loadGA();
        } else if (consent === 'refused') {
            // não carrega GA
        } else {
            // Sem consentimento registrado — mostrar banner (não presume consentimento)
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', createBanner);
            } else {
                createBanner();
            }
        }

        // Botão de revogação na página de privacidade
        var revokeBtn = document.getElementById('cookie-revoke');
        if (revokeBtn) {
            revokeBtn.addEventListener('click', function () {
                setConsent('refused');
                unloadGA();
                var label = document.getElementById('cookie-revoke-status');
                if (label) label.textContent = 'Consentimento revogado. Os cookies analíticos foram removidos.';
            });
        }
    }

    init();
})();
