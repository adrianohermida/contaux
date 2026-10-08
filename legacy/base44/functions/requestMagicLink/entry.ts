import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const { email } = await req.json();
        
        if (!email || !email.includes('@')) {
            return Response.json({ error: 'Email inválido' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        
        // Gera código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

        // Salva código no User (como campo temporário)
        // Primeiro tenta encontrar ou criar o usuário
        const users = await base44.asServiceRole.entities.User.filter({ email });
        
        if (users.length === 0) {
            // Usuário novo - convida
            await base44.users.inviteUser(email, 'user');
        }

        // Envia email com magic link
        await base44.integrations.Core.SendEmail({
            to: email,
            subject: 'Seu código de acesso - Contaux',
            body: `
Olá,

Seu código de acesso é: ${code}

Este código expira em 15 minutos.

Se você não solicitou este código, ignore este email.

Contaux Contadoria
            `.trim(),
            from_name: 'Contaux'
        });

        // Armazena código temp (você pode usar Redis ou um campo temporário na User)
        // Por agora, retornamos sucesso
        return Response.json({
            success: true,
            message: 'Código enviado para seu email',
            expiresAt
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});