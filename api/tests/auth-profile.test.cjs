const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadMeHandler() {
  const routes = new Map();
  const router = {};
  for (const method of ['get', 'post', 'delete']) {
    router[method] = (route, ...handlers) => routes.set(method + route, handlers.at(-1));
  }
  const source = fs.readFileSync(path.join(__dirname, '../routes/authRoutes.js'), 'utf8');
  const sandbox = {
    module: { exports: {} }, console, process: { env: {} },
    require(name) {
      if (name === 'express') return { Router: () => router };
      if (name === '../db') return { query: async (sql, params) => {
        assert.equal(params[0], 7);
        return { rows: [{ name: 'Empresa de teste' }] };
      }};
      if (name === '../middleware/auth') return { requireAuth() {}, requireRole() {} };
      if (['bcryptjs', 'jsonwebtoken', '../services/mfaService', 'qrcode'].includes(name)) return {};
      if (name === 'crypto') return require('node:crypto');
      throw new Error('Dependência inesperada: ' + name);
    },
  };
  vm.runInNewContext(source, sandbox);
  return routes.get('get/me');
}

for (const hasPin of [false, true]) {
  for (const hasMfa of [false, true]) {
    test('perfil preserva PIN=' + hasPin + ' e MFA=' + hasMfa + ' sem expor segredos', async () => {
      const handler = loadMeHandler();
      let profile;
      await handler({ user: {
        id: 12, tenant_id: 7, role: 'accountant', name: 'Teste',
        email: 'fixture@example.invalid', tenant_type: 'office',
        has_pin: hasPin, mfa_enabled: hasMfa,
      }}, { json(value) { profile = value; } });
      assert.equal(profile.has_pin, hasPin);
      assert.equal(profile.mfa_enabled, hasMfa);
      assert.equal(profile.id, '12');
      assert.equal(profile.tenant_id, 7);
      assert.equal(profile.role, 'accountant');
      assert.equal(profile.tenant_name, 'Empresa de teste');
      for (const key of ['pin_hash', 'password_hash', 'mfa_secret', 'mfa_backup_codes']) {
        assert.equal(Object.hasOwn(profile, key), false);
      }
    });
  }
}
