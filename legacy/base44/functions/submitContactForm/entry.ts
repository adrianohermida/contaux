import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, phone, subject, message } = await req.json();

    // Validar campos obrigatórios
    if (!name || !email || !subject || !message) {
      return Response.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    // 1. Verificar se existe ContactSubmission para este email
    const existingContact = await base44.asServiceRole.entities.ContactSubmission.filter({
      contact_email: email
    });

    let contactSubmission;
    let ticketId;

    if (existingContact.length > 0) {
      // Contato já existe - usar ticket existente
      contactSubmission = existingContact[0];
      ticketId = contactSubmission.ticket_id;

      // Incrementar contador de mensagens
      await base44.asServiceRole.entities.ContactSubmission.update(contactSubmission.id, {
        message_count: (contactSubmission.message_count || 1) + 1,
        last_message_id: null // será atualizado após criar mensagem
      });
    } else {
      // Novo contato - criar Ticket no módulo de suporte
      const ticket = await base44.asServiceRole.entities.Ticket.create({
        title: subject,
        description: message,
        client_email: email,
        client_name: name,
        client_phone: phone || '',
        status: 'open',
        priority: 'normal',
        source: 'contact_form'
      });

      ticketId = ticket.id;

      // Criar ContactSubmission para rastreamento
      contactSubmission = await base44.asServiceRole.entities.ContactSubmission.create({
        contact_email: email,
        contact_name: name,
        contact_phone: phone || '',
        ticket_id: ticketId,
        subject: subject,
        status: 'open',
        message_count: 1
      });
    }

    // 2. Salvar mensagem no banco
    const messageRecord = await base44.asServiceRole.entities.ContactMessage.create({
      name: name,
      email: email,
      phone: phone || '',
      subject: subject,
      message: message,
      contact_submission_id: contactSubmission.id,
      ticket_id: ticketId,
      status: 'new'
    });

    // Atualizar referência primeira/última mensagem
    if (existingContact.length > 0) {
      await base44.asServiceRole.entities.ContactSubmission.update(contactSubmission.id, {
        last_message_id: messageRecord.id
      });
    } else {
      await base44.asServiceRole.entities.ContactSubmission.update(contactSubmission.id, {
        first_message_id: messageRecord.id,
        last_message_id: messageRecord.id
      });
    }

    // 3. Enviar email de confirmação ao remetente
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Confirmação de recebimento: ${subject}`,
      body: `Olá ${name},\n\nRecebemos sua mensagem e criaremos um ticket de suporte para acompanhamento.\n\nReferência do Ticket: ${ticketId}\n\nEntraremos em contato em breve.\n\nAtenciosamente,\nContaux Contabilidade`
    });

    return Response.json({
      success: true,
      message: existingContact.length > 0 ? 'Mensagem adicionada ao ticket existente' : 'Mensagem enviada e ticket criado',
      id: messageRecord.id,
      ticket_id: ticketId,
      contact_submission_id: contactSubmission.id
    });
  } catch (error) {
    console.error('Erro:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});