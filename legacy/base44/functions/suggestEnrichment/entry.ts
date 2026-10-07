import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, contact_id } = await req.json();
    
    if (!workspace_id) {
      return Response.json({ error: 'Missing workspace_id' }, { status: 400 });
    }

    // Fetch contacts and opportunities
    const contacts = await base44.asServiceRole.entities.Client.filter({ workspace_id });
    const opportunities = await base44.asServiceRole.entities.SalesOpportunity.filter({ workspace_id });
    
    const suggestions = [];

    if (contact_id) {
      // Single contact enrichment
      const contact = contacts.find(c => c.id === contact_id);
      if (contact) {
        suggestions.push(...analyzeContactGaps(contact, contacts, opportunities));
      }
    } else {
      // All contacts
      for (const contact of contacts) {
        suggestions.push(...analyzeContactGaps(contact, contacts, opportunities));
      }
    }

    return Response.json({ suggestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function analyzeContactGaps(contact, allContacts, opportunities) {
  const suggestions = [];
  
  // Missing field detection
  const fields = [
    { key: 'phone', label: 'Phone number', benefit: 'Better contact rate' },
    { key: 'email', label: 'Email', benefit: 'Easier communication' },
    { key: 'cep', label: 'CEP/Postal code', benefit: 'Complete address data' }
  ];
  
  for (const field of fields) {
    if (!contact[field.key]) {
      suggestions.push({
        contact_id: contact.id,
        type: 'missing_field',
        field_name: field.key,
        description: `Add ${field.label}`,
        benefit: field.benefit,
        impact_score: field.key === 'email' ? 0.9 : 0.7
      });
    }
  }

  // Cross-sell/Upsell opportunities
  const contactOpportunities = opportunities.filter(o => o.contact_id === contact.id);
  
  if (contactOpportunities.length === 0) {
    suggestions.push({
      contact_id: contact.id,
      type: 'cross_sell',
      description: 'No active opportunities',
      benefit: 'Generate new revenue stream',
      impact_score: 0.8
    });
  } else if (contactOpportunities.some(o => o.pipeline_stage === 'won')) {
    suggestions.push({
      contact_id: contact.id,
      type: 'upsell',
      description: 'Upsell opportunity after recent win',
      benefit: 'Increase customer lifetime value',
      impact_score: 0.85
    });
  }

  // Related contacts
  const sameCNPJ = allContacts.filter(c => 
    c.cnpj === contact.cnpj && c.id !== contact.id && contact.cnpj
  );
  
  if (sameCNPJ.length > 0) {
    suggestions.push({
      contact_id: contact.id,
      type: 'related_contact',
      description: `${sameCNPJ.length} related contacts in same company`,
      benefit: 'Map company hierarchy',
      impact_score: 0.75,
      related_id: sameCNPJ[0].id
    });
  }

  return suggestions;
}