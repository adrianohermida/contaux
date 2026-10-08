import React, { useState } from 'react';
import { Phone, Loader } from 'lucide-react';
import { useVoxImplant } from '../hooks/useVoxImplant';

export default function LoginForm() {
  const { login, sdkReady } = useVoxImplant();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!sdkReady) {
        throw new Error('SDK não está pronto. Aguarde o carregamento.');
      }

      const success = await login(username, password);
      if (!success) {
        setError('Usuário ou senha inválidos');
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Phone className="w-6 h-6 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Contaux VoIP</h1>
        <p className="text-slate-600 text-center mb-6">
          Faça login para acessar chamadas e chat
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu_usuario"
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="sua_senha"
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* SDK Status */}
          {!sdkReady && (
            <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Carregando SDK...
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !sdkReady}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Conectando...' : 'Entrar'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Sistema de comunicação Voximplant integrado
        </p>
      </div>
    </div>
  );
}