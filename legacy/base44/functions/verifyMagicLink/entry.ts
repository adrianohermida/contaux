import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, code } = await req.json();

    if (!email || !code) {
      return Response.json({ error: 'Email e código são obrigatórios' }, { status: 400 });
    }

    // Buscar usuário pelo email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    
    if (users.length === 0) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = users[0];

    // Verificar se tem código armazenado e se ainda é válido
    if (!user.magic_link_code || !user.magic_link_expires) {
      return Response.json({ error: 'Código não encontrado ou expirado' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(user.magic_link_expires);

    if (now > expiresAt) {
      return Response.json({ error: 'Código expirado' }, { status: 400 });
    }

    if (user.magic_link_code !== code) {
      return Response.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Código válido - limpar código usado
    await base44.asServiceRole.entities.User.update(user.id, {
      magic_link_code: null,
      magic_link_expires: null
    });

    // Criar sessão de autenticação (Base44 gerencia isso automaticamente)
    return Response.json({ 
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});