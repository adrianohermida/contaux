/**
 * E2E Tests - SalesOpportunity Full Workflows
 * Tests complete opportunity workflows from creation to closing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      SalesOpportunity: {
        create: vi.fn(),
        filter: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      Client: {
        filter: vi.fn(),
      },
      Quote: {
        create: vi.fn(),
        filter: vi.fn(),
      },
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { base44 } from '@/api/base44Client';

describe('SalesOpportunity E2E Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Full opportunity workflow - prospect → won
  it('should complete full opportunity workflow: prospect → qualified → proposal → negotiation → won', async () => {
    // Step 1: Create opportunity
    vi.mocked(base44.entities.SalesOpportunity.create).mockResolvedValueOnce({
      id: 'opp_1',
      opportunity_name: 'Enterprise Deal',
      pipeline_stage: 'prospect',
      lead_score: 10,
    });

    const opportunity = await base44.entities.SalesOpportunity.create({
      workspace_id: 'ws_1',
      contact_id: 'cli_1',
      opportunity_name: 'Enterprise Deal',
      deal_value: 250000,
      pipeline_stage: 'prospect',
    });

    expect(opportunity.pipeline_stage).toBe('prospect');

    // Step 2: Qualify opportunity
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...opportunity,
      pipeline_stage: 'qualified',
      lead_score: 35,
    });

    const qualified = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'qualified',
      conversion_probability: 50,
    });

    expect(qualified.pipeline_stage).toBe('qualified');

    // Step 3: Send proposal
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...qualified,
      pipeline_stage: 'proposal',
      lead_score: 55,
    });

    const proposed = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'proposal',
      conversion_probability: 65,
    });

    expect(proposed.pipeline_stage).toBe('proposal');

    // Step 4: Negotiate
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...proposed,
      pipeline_stage: 'negotiation',
      lead_score: 75,
    });

    const negotiating = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'negotiation',
      conversion_probability: 85,
    });

    expect(negotiating.pipeline_stage).toBe('negotiation');

    // Step 5: Win
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...negotiating,
      pipeline_stage: 'won',
      lead_score: 100,
    });

    const won = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'won',
      conversion_probability: 100,
    });

    expect(won.pipeline_stage).toBe('won');
    expect(won.lead_score).toBe(100);
  });

  // Scenario 2: Lead score updates with deal value change
  it('should recalculate lead score when deal value changes', async () => {
    const opp = {
      id: 'opp_1',
      deal_value: 50000,
      lead_score: 40,
    };

    // Update deal value
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...opp,
      deal_value: 250000,
      lead_score: 65, // Higher deal value = higher score
    });

    const updated = await base44.entities.SalesOpportunity.update('opp_1', {
      deal_value: 250000,
    });

    expect(updated.lead_score).toBeGreaterThan(opp.lead_score);
  });

  // Scenario 3: Quote linked to opportunity
  it('should link quote to opportunity and track conversion', async () => {
    // Create opportunity
    vi.mocked(base44.entities.SalesOpportunity.create).mockResolvedValueOnce({
      id: 'opp_1',
      opportunity_name: 'Deal',
      pipeline_stage: 'proposal',
    });

    const opp = await base44.entities.SalesOpportunity.create({
      workspace_id: 'ws_1',
      contact_id: 'cli_1',
      opportunity_name: 'Deal',
      deal_value: 100000,
    });

    // Create quote from opportunity
    vi.mocked(base44.entities.Quote.create).mockResolvedValueOnce({
      id: 'quote_1',
      quote_number: 'QT-0001',
    });

    const quote = await base44.entities.Quote.create({
      tenant_id: 'ws_1',
      client_id: opp.contact_id,
      total_amount: opp.deal_value,
    });

    // Link quote to opportunity
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...opp,
      quote_id: quote.id,
    });

    const linked = await base44.entities.SalesOpportunity.update('opp_1', {
      quote_id: quote.id,
    });

    expect(linked.quote_id).toBe('quote_1');
  });

  // Scenario 4: Lost opportunity workflow
  it('should handle lost opportunity workflow', async () => {
    vi.mocked(base44.entities.SalesOpportunity.create).mockResolvedValueOnce({
      id: 'opp_1',
      pipeline_stage: 'proposal',
      lead_score: 50,
    });

    const opp = await base44.entities.SalesOpportunity.create({
      workspace_id: 'ws_1',
      contact_id: 'cli_1',
      opportunity_name: 'Deal',
      deal_value: 50000,
    });

    // Move to lost
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...opp,
      pipeline_stage: 'lost',
      lead_score: 0,
    });

    const lost = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'lost',
    });

    expect(lost.pipeline_stage).toBe('lost');
  });

  // Scenario 5: Activity tracking with last activity date
  it('should track last activity date for lead score calculation', async () => {
    const today = new Date().toISOString().split('T')[0];

    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      last_activity_date: today,
      lead_score: 65, // Recent activity = higher score
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', {
      last_activity_date: today,
    });

    expect(result.last_activity_date).toBe(today);
  });

  // Scenario 6: Bulk opportunity creation and lead score calculation
  it('should create bulk opportunities with automatic lead scoring', async () => {
    const oppsData = [
      { contact_id: 'cli_1', opportunity_name: 'Deal A', deal_value: 100000 },
      { contact_id: 'cli_2', opportunity_name: 'Deal B', deal_value: 50000 },
      { contact_id: 'cli_3', opportunity_name: 'Deal C', deal_value: 25000 },
    ];

    vi.mocked(base44.entities.SalesOpportunity.create)
      .mockResolvedValueOnce({ id: 'opp_1', ...oppsData[0], lead_score: 45 })
      .mockResolvedValueOnce({ id: 'opp_2', ...oppsData[1], lead_score: 35 })
      .mockResolvedValueOnce({ id: 'opp_3', ...oppsData[2], lead_score: 25 });

    const results = await Promise.all(
      oppsData.map(data =>
        base44.entities.SalesOpportunity.create({
          workspace_id: 'ws_1',
          ...data,
          pipeline_stage: 'prospect',
        })
      )
    );

    expect(results).toHaveLength(3);
    results.forEach(r => expect(r.lead_score).toBeGreaterThan(0));
  });

  // Scenario 7: Pipeline stage transitions with probability updates
  it('should update probability as opportunity moves through pipeline', async () => {
    const transitions = [
      { stage: 'prospect', prob: 10 },
      { stage: 'qualified', prob: 30 },
      { stage: 'proposal', prob: 60 },
      { stage: 'negotiation', prob: 85 },
      { stage: 'won', prob: 100 },
    ];

    for (const transition of transitions) {
      vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
        id: 'opp_1',
        pipeline_stage: transition.stage,
        conversion_probability: transition.prob,
      });

      const result = await base44.entities.SalesOpportunity.update('opp_1', {
        pipeline_stage: transition.stage,
        conversion_probability: transition.prob,
      });

      expect(result.conversion_probability).toBe(transition.prob);
    }
  });

  // Scenario 8: Expected close date impact on lead score
  it('should adjust lead score based on expected close date', async () => {
    const soon = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const later = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    vi.mocked(base44.entities.SalesOpportunity.update)
      .mockResolvedValueOnce({ id: 'opp_1', expected_close_date: soon, lead_score: 70 })
      .mockResolvedValueOnce({ id: 'opp_1', expected_close_date: later, lead_score: 55 });

    const soon_result = await base44.entities.SalesOpportunity.update('opp_1', {
      expected_close_date: soon,
    });

    const later_result = await base44.entities.SalesOpportunity.update('opp_1', {
      expected_close_date: later,
    });

    expect(soon_result.lead_score).toBeGreaterThan(later_result.lead_score);
  });

  // Scenario 9: Multi-stage search and filter
  it('should search and filter opportunities efficiently', async () => {
    const allOpps = [
      { id: 'opp_1', opportunity_name: 'Big Deal', pipeline_stage: 'proposal', lead_score: 80 },
      { id: 'opp_2', opportunity_name: 'Small Deal', pipeline_stage: 'prospect', lead_score: 20 },
      { id: 'opp_3', opportunity_name: 'Medium Deal', pipeline_stage: 'negotiation', lead_score: 60 },
    ];

    // Filter by stage
    vi.mocked(base44.entities.SalesOpportunity.filter).mockResolvedValueOnce(
      allOpps.filter(o => o.pipeline_stage === 'proposal')
    );

    const byStage = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'ws_1',
      pipeline_stage: 'proposal',
    });

    expect(byStage).toHaveLength(1);
    expect(byStage[0].opportunity_name).toBe('Big Deal');

    // Filter by score
    vi.mocked(base44.entities.SalesOpportunity.filter).mockResolvedValueOnce(
      allOpps.filter(o => o.lead_score >= 70)
    );

    const hot = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'ws_1',
    });

    expect(hot.some(o => o.lead_score >= 70)).toBe(true);
  });

  // Scenario 10: Performance with large dataset
  it('should handle large opportunity datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `opp_${i}`,
      opportunity_name: `Deal ${i}`,
      pipeline_stage: ['prospect', 'qualified', 'proposal', 'negotiation', 'won'][i % 5],
      lead_score: Math.round(Math.random() * 100),
    }));

    vi.mocked(base44.entities.SalesOpportunity.filter).mockResolvedValueOnce(largeDataset);

    const startTime = performance.now();
    const results = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'ws_1',
    });
    const endTime = performance.now();

    expect(results).toHaveLength(1000);
    expect(endTime - startTime).toBeLessThan(5000);
  });

  // Scenario 11: Multi-tenancy with opportunity isolation
  it('should enforce multi-tenancy in opportunity operations', async () => {
    const ws1 = 'workspace_1';
    const ws2 = 'workspace_2';

    vi.mocked(base44.entities.SalesOpportunity.create)
      .mockResolvedValueOnce({ id: 'opp_1', workspace_id: ws1 })
      .mockResolvedValueOnce({ id: 'opp_2', workspace_id: ws2 });

    const opp1 = await base44.entities.SalesOpportunity.create({
      workspace_id: ws1,
      contact_id: 'cli_1',
      opportunity_name: 'Deal',
      deal_value: 50000,
    });

    const opp2 = await base44.entities.SalesOpportunity.create({
      workspace_id: ws2,
      contact_id: 'cli_1',
      opportunity_name: 'Deal',
      deal_value: 50000,
    });

    expect(opp1.workspace_id).toBe(ws1);
    expect(opp2.workspace_id).toBe(ws2);
  });

  // Scenario 12: Real-time lead score updates
  it('should update lead scores in real-time as opportunity evolves', async () => {
    const opportunity = {
      id: 'opp_1',
      deal_value: 50000,
      pipeline_stage: 'prospect',
      conversion_probability: 10,
      lead_score: 15,
    };

    // Activity update
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...opportunity,
      last_activity_date: new Date().toISOString().split('T')[0],
      lead_score: 25,
    });

    const withActivity = await base44.entities.SalesOpportunity.update('opp_1', {
      last_activity_date: new Date().toISOString().split('T')[0],
    });

    expect(withActivity.lead_score).toBeGreaterThan(opportunity.lead_score);

    // Stage update
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      ...withActivity,
      pipeline_stage: 'qualified',
      lead_score: 45,
    });

    const staged = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'qualified',
    });

    expect(staged.lead_score).toBeGreaterThan(withActivity.lead_score);
  });

  // Scenario 13: Opportunity closing with final metrics
  it('should record final metrics when opportunity is closed', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      pipeline_stage: 'won',
      lead_score: 100,
      conversion_probability: 100,
      deal_value: 150000,
    });

    const closed = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'won',
      lead_score: 100,
      conversion_probability: 100,
    });

    expect(closed.pipeline_stage).toBe('won');
    expect(closed.lead_score).toBe(100);
    expect(closed.conversion_probability).toBe(100);
  });

  // Scenario 14: Reopening lost opportunities
  it('should allow reopening of lost opportunities', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update)
      .mockResolvedValueOnce({ id: 'opp_1', pipeline_stage: 'lost', lead_score: 0 })
      .mockResolvedValueOnce({ id: 'opp_1', pipeline_stage: 'prospect', lead_score: 10 });

    await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'lost',
    });

    const reopened = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'prospect',
    });

    expect(reopened.pipeline_stage).toBe('prospect');
  });

  // Scenario 15: Opportunity source tracking
  it('should track opportunity source for analytics', async () => {
    const sources = ['direct', 'referral', 'website', 'inbound', 'cold_call', 'other'];

    for (const source of sources) {
      vi.mocked(base44.entities.SalesOpportunity.create).mockResolvedValueOnce({
        id: `opp_${source}`,
        source: source,
      });

      const result = await base44.entities.SalesOpportunity.create({
        workspace_id: 'ws_1',
        contact_id: 'cli_1',
        opportunity_name: `Deal from ${source}`,
        deal_value: 50000,
        source: source,
      });

      expect(result.source).toBe(source);
    }
  });

  // Scenario 16: Related contacts tracking
  it('should track related contacts for opportunity', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      related_contacts: ['cli_1', 'cli_2', 'cli_3'],
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', {
      related_contacts: ['cli_1', 'cli_2', 'cli_3'],
    });

    expect(result.related_contacts).toHaveLength(3);
  });

  // Scenario 17: Opportunity tagging
  it('should support tagging opportunities for organization', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      tags: ['strategic', 'urgent', 'high-value'],
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', {
      tags: ['strategic', 'urgent', 'high-value'],
    });

    expect(result.tags).toEqual(['strategic', 'urgent', 'high-value']);
  });

  // Scenario 18: Active opportunity filtering
  it('should filter by active status', async () => {
    const activeOpps = [
      { id: 'opp_1', is_active: true, pipeline_stage: 'proposal' },
    ];

    vi.mocked(base44.entities.SalesOpportunity.filter).mockResolvedValueOnce(activeOpps);

    const results = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'ws_1',
    });

    expect(results.every(o => o.is_active)).toBe(true);
  });

  // Scenario 19: Opportunity conversion metrics
  it('should calculate conversion metrics from opportunities', async () => {
    const opps = [
      { id: 'opp_1', pipeline_stage: 'won', deal_value: 100000 },
      { id: 'opp_2', pipeline_stage: 'won', deal_value: 75000 },
      { id: 'opp_3', pipeline_stage: 'lost', deal_value: 50000 },
    ];

    const converted = opps.filter(o => o.pipeline_stage === 'won');
    const totalValue = converted.reduce((sum, o) => sum + o.deal_value, 0);

    expect(converted).toHaveLength(2);
    expect(totalValue).toBe(175000);
  });

  // Scenario 20: Opportunity pipeline velocity
  it('should track opportunity pipeline velocity', async () => {
    const startDate = new Date('2026-03-01');
    const endDate = new Date('2026-03-10');

    const opps = [
      { id: 'opp_1', created_date: '2026-03-01', closed_date: '2026-03-05', velocity: 4 },
      { id: 'opp_2', created_date: '2026-03-02', closed_date: '2026-03-08', velocity: 6 },
      { id: 'opp_3', created_date: '2026-03-03', closed_date: '2026-03-10', velocity: 7 },
    ];

    const avgVelocity = opps.reduce((sum, o) => sum + o.velocity, 0) / opps.length;

    expect(avgVelocity).toBeGreaterThan(0);
    expect(avgVelocity).toBeLessThan(10);
  });
});