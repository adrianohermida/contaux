import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { company_name, contact_name, email, phone, plan_type, company_type, description } = body;

    // Validar campos obrigatórios
    if (!company_name || !contact_name || !email || !phone || !plan_type || !company_type || !description) {
      return Response.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Salvar no banco
    await base44.entities.QuoteRequest.create({
      company_name,
      contact_name,
      email,
      phone,
      plan_type,
      company_type,
      description,
      status: 'novo'
    });

    // Enviar email de confirmação ao cliente
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Solicitação de Orçamento Recebida - Contaux',
      body: `Olá ${contact_name},\n\nRecebemos sua solicitação de orçamento com sucesso.\n\nPlano de Interesse: ${plan_type}\nTipo de Empresa: ${company_type}\n\nNossa equipe analisará sua solicitação e entrará em contato em breve com uma proposta personalizada.\n\nAtenciosamente,\nEquipe Contaux Contabilidade`
    });

    // Enviar notificação para admin (ou para um email de suporte)
    await base44.integrations.Core.SendEmail({
      to: 'contato@hermidamaia.adv.br',
      subject: `Novo Orçamento Solicitado - ${company_name}`,
      body: `Nova solicitação de orçamento:\n\nEmpresa: ${company_name}\nContato: ${contact_name}\nEmail: ${email}\nTelefone: ${phone}\nPlano: ${plan_type}\nTipo: ${company_type}\n\nDescrição:\n${description}`
    });

    return Response.json({
      success: true,
      message: 'Solicitação de orçamento recebida com sucesso'
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});