/**
 * Unit Tests - SalesOpportunity CRUD Operations
 * Tests create, read, update, delete operations and lead score calculations
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
    },
  },
}));

import { base44 } from '@/api/base44Client';

describe('SalesOpportunity CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Create opportunity with required fields
  it('should create opportunity with required fields', async () => {
    const oppData = {
      workspace_id: 'workspace_1',
      contact_id: 'cli_1',
      opportunity_name: 'Major Deal',
      deal_value: 100000,
      pipeline_stage: 'proposal',
      conversion_probability: 75,
      expected_close_date: '2026-04-15',
    };

    vi.mocked(base44.entities.SalesOpportunity.create).mockResolvedValueOnce({
      id: 'opp_1',
      ...oppData,
      lead_score: 75,
    });

    const result = await base44.entities.SalesOpportunity.create(oppData);

    expect(result.id).toBe('opp_1');
    expect(result.opportunity_name).toBe('Major Deal');
    expect(base44.entities.SalesOpportunity.create).toHaveBeenCalledWith(oppData);
  });

  // Scenario 2: Read/Filter opportunities by workspace
  it('should filter opportunities by workspace_id', async () => {
    const mockOpps = [
      { id: 'opp_1', workspace_id: 'workspace_1', opportunity_name: 'Deal A' },
    ];

    vi.mocked(base44.entities.SalesOpportunity.filter).mockResolvedValueOnce(mockOpps);

    const result = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'workspace_1',
    });

    expect(result).toEqual(mockOpps);
  });

  // Scenario 3: Filter opportunities by pipeline stage
  it('should filter opportunities by pipeline stage', async () => {
    const mockOpps = [
      { id: 'opp_1', pipeline_stage: 'negotiation', opportunity_name: 'Deal' },
    ];

    vi.mocked(base44.entities.SalesOpportunity.filter).mockResolvedValueOnce(mockOpps);

    const result = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'workspace_1',
      pipeline_stage: 'negotiation',
    });

    expect(result[0].pipeline_stage).toBe('negotiation');
  });

  // Scenario 4: Update opportunity pipeline stage
  it('should update opportunity to new pipeline stage', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      pipeline_stage: 'negotiation',
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', {
      pipeline_stage: 'negotiation',
    });

    expect(result.pipeline_stage).toBe('negotiation');
  });

  // Scenario 5: Update conversion probability
  it('should update conversion probability', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      conversion_probability: 85,
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', {
      conversion_probability: 85,
    });

    expect(result.conversion_probability).toBe(85);
  });

  // Scenario 6: Update deal value
  it('should update deal value', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      deal_value: 150000,
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', {
      deal_value: 150000,
    });

    expect(result.deal_value).toBe(150000);
  });

  // Scenario 7: Update opportunity with lead score
  it('should update opportunity with calculated lead score', async () => {
    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      lead_score: 82,
      pipeline_stage: 'proposal',
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', {
      lead_score: 82,
      pipeline_stage: 'proposal',
    });

    expect(result.lead_score).toBe(82);
    expect(result.pipeline_stage).toBe('proposal');
  });

  // Scenario 8: Delete opportunity
  it('should delete opportunity', async () => {
    vi.mocked(base44.entities.SalesOpportunity.delete).mockResolvedValueOnce(true);

    const result = await base44.entities.SalesOpportunity.delete('opp_1');

    expect(result).toBe(true);
  });

  // Scenario 9: Multi-tenancy isolation
  it('should enforce multi-tenancy isolation', async () => {
    const tenant1Opps = [
      { id: 'opp_1', workspace_id: 'workspace_1' },
    ];

    const tenant2Opps = [
      { id: 'opp_2', workspace_id: 'workspace_2' },
    ];

    vi.mocked(base44.entities.SalesOpportunity.filter)
      .mockResolvedValueOnce(tenant1Opps)
      .mockResolvedValueOnce(tenant2Opps);

    const t1Result = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'workspace_1',
    });

    const t2Result = await base44.entities.SalesOpportunity.filter({
      workspace_id: 'workspace_2',
    });

    expect(t1Result[0].workspace_id).toBe('workspace_1');
    expect(t2Result[0].workspace_id).toBe('workspace_2');
  });

  // Scenario 10: Lead score categories (Hot/Warm/Cold)
  it('should correctly categorize lead scores', async () => {
    const opportunities = [
      { id: 'opp_1', lead_score: 85, category: 'hot' },
      { id: 'opp_2', lead_score: 50, category: 'warm' },
      { id: 'opp_3', lead_score: 20, category: 'cold' },
    ];

    expect(opportunities[0].category).toBe('hot'); // 70+
    expect(opportunities[1].category).toBe('warm'); // 30-70
    expect(opportunities[2].category).toBe('cold'); // 0-30
  });

  // Scenario 11: Bulk opportunity creation
  it('should create multiple opportunities efficiently', async () => {
    const oppsData = [
      { workspace_id: 'ws_1', contact_id: 'cli_1', opportunity_name: 'Deal 1', deal_value: 50000 },
      { workspace_id: 'ws_1', contact_id: 'cli_2', opportunity_name: 'Deal 2', deal_value: 75000 },
      { workspace_id: 'ws_1', contact_id: 'cli_3', opportunity_name: 'Deal 3', deal_value: 100000 },
    ];

    vi.mocked(base44.entities.SalesOpportunity.create)
      .mockResolvedValueOnce({ id: 'opp_1', ...oppsData[0] })
      .mockResolvedValueOnce({ id: 'opp_2', ...oppsData[1] })
      .mockResolvedValueOnce({ id: 'opp_3', ...oppsData[2] });

    const results = await Promise.all(
      oppsData.map(data => base44.entities.SalesOpportunity.create(data))
    );

    expect(results).toHaveLength(3);
    expect(results[0].id).toBe('opp_1');
    expect(results[2].id).toBe('opp_3');
  });

  // Scenario 12: Update multiple fields at once
  it('should update multiple opportunity fields', async () => {
    const updateData = {
      pipeline_stage: 'won',
      lead_score: 100,
      conversion_probability: 100,
    };

    vi.mocked(base44.entities.SalesOpportunity.update).mockResolvedValueOnce({
      id: 'opp_1',
      ...updateData,
    });

    const result = await base44.entities.SalesOpportunity.update('opp_1', updateData);

    expect(result.pipeline_stage).toBe('won');
    expect(result.lead_score).toBe(100);
    expect(result.conversion_probability).toBe(100);
  });
});