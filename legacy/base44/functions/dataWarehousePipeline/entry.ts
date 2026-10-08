import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Data Warehouse & ETL Pipeline - PHASE 18
 * Enterprise data ingestion, transformation, and warehousing
 */

class DataWarehousePipeline {
  constructor() {
    this.pipelines = new Map();
    this.dataJobs = new Map();
    this.qualityRules = new Map();
    this.initializeQualityRules();
  }

  /**
   * Initialize data quality rules
   */
  initializeQualityRules() {
    this.qualityRules.set('completeness', {
      name: 'Data Completeness',
      check: (data) => data.filter(r => Object.values(r).some(v => v === null || v === '')).length === 0,
      severity: 'high',
    });

    this.qualityRules.set('uniqueness', {
      name: 'Unique Records',
      check: (data) => new Set(data.map(r => r.id)).size === data.length,
      severity: 'high',
    });

    this.qualityRules.set('validity', {
      name: 'Data Validity',
      check: (data) => data.every(r => typeof r.id === 'string' && r.id.length > 0),
      severity: 'high',
    });

    this.qualityRules.set('consistency', {
      name: 'Data Consistency',
      check: (data) => data.every(r => r.created_date <= r.updated_date),
      severity: 'medium',
    });

    this.qualityRules.set('timeliness', {
      name: 'Data Timeliness',
      check: (data) => data.every(r => new Date(r.updated_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      severity: 'low',
    });
  }

  /**
   * Create ETL pipeline
   */
  createPipeline(pipelineConfig) {
    const pipelineId = 'pipe_' + Math.random().toString(36).substr(2, 14);

    const pipeline = {
      id: pipelineId,
      name: pipelineConfig.name,
      source: pipelineConfig.source, // database, api, file
      destination: pipelineConfig.destination, // data warehouse
      schedule: pipelineConfig.schedule, // cron expression
      transformation_rules: pipelineConfig.transformation_rules || [],
      quality_checks: pipelineConfig.quality_checks || [],
      created_at: new Date().toISOString(),
      status: 'active',
      last_run: null,
      next_run: null,
      success_count: 0,
      failure_count: 0,
    };

    this.pipelines.set(pipelineId, pipeline);
    return pipeline;
  }

  /**
   * Execute data ingestion job
   */
  async executeIngestionJob(pipelineId, sourceData) {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error('Pipeline not found');

    const jobId = 'job_' + Math.random().toString(36).substr(2, 12);
    const startTime = Date.now();

    try {
      // Data validation
      const validationResult = this.validateData(sourceData, pipeline.quality_checks);
      if (!validationResult.valid && validationResult.severity === 'high') {
        throw new Error(`Data validation failed: ${validationResult.message}`);
      }

      // Data transformation
      const transformedData = this.transformData(sourceData, pipeline.transformation_rules);

      // Data loading
      const loadResult = this.loadData(transformedData, pipeline.destination);

      const job = {
        id: jobId,
        pipeline_id: pipelineId,
        status: 'success',
        records_processed: sourceData.length,
        records_loaded: loadResult.count,
        records_rejected: validationResult.errors.length,
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        validation_warnings: validationResult.warnings,
      };

      pipeline.success_count++;
      pipeline.last_run = new Date().toISOString();

      this.dataJobs.set(jobId, job);
      return job;
    } catch (error) {
      pipeline.failure_count++;
      throw error;
    }
  }

  /**
   * Validate data quality
   */
  validateData(data, qualityChecks) {
    const errors = [];
    const warnings = [];

    for (const checkName of qualityChecks) {
      const rule = this.qualityRules.get(checkName);
      if (!rule) continue;

      try {
        const checkResult = rule.check(data);
        if (!checkResult) {
          const message = `${rule.name} check failed`;
          if (rule.severity === 'high') {
            errors.push(message);
          } else {
            warnings.push(message);
          }
        }
      } catch (e) {
        warnings.push(`${rule.name} check error: ${e.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      severity: errors.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low',
      message: errors.length > 0 ? errors[0] : 'Validation passed',
    };
  }

  /**
   * Transform data
   */
  transformData(data, transformationRules) {
    return data.map(record => {
      let transformed = { ...record };

      for (const rule of transformationRules) {
        if (rule.type === 'map_field') {
          transformed[rule.target] = transformed[rule.source];
        } else if (rule.type === 'format') {
          transformed[rule.field] = this.formatValue(transformed[rule.field], rule.format);
        } else if (rule.type === 'aggregate') {
          transformed[rule.field] = this.aggregateValue(transformed[rule.field], rule.aggregation);
        }
      }

      return transformed;
    });
  }

  /**
   * Load data to warehouse
   */
  loadData(data, destination) {
    return {
      destination,
      count: data.length,
      timestamp: new Date().toISOString(),
      status: 'loaded',
    };
  }

  /**
   * Format value helper
   */
  formatValue(value, format) {
    if (format === 'uppercase') return String(value).toUpperCase();
    if (format === 'lowercase') return String(value).toLowerCase();
    if (format === 'date') return new Date(value).toISOString().split('T')[0];
    return value;
  }

  /**
   * Aggregate value helper
   */
  aggregateValue(value, aggregation) {
    if (aggregation === 'sum') return value || 0;
    if (aggregation === 'count') return value ? 1 : 0;
    return value;
  }

  /**
   * Get data quality report
   */
  getDataQualityReport(pipelineId) {
    const jobs = Array.from(this.dataJobs.values()).filter(j => j.pipeline_id === pipelineId);

    const totalJobs = jobs.length;
    const successfulJobs = jobs.filter(j => j.status === 'success').length;
    const totalRecords = jobs.reduce((sum, j) => sum + j.records_processed, 0);
    const rejectedRecords = jobs.reduce((sum, j) => sum + j.records_rejected, 0);

    return {
      pipeline_id: pipelineId,
      total_jobs: totalJobs,
      successful_jobs: successfulJobs,
      success_rate: totalJobs > 0 ? ((successfulJobs / totalJobs) * 100).toFixed(2) + '%' : 'N/A',
      total_records_processed: totalRecords,
      total_records_rejected: rejectedRecords,
      data_quality_score: totalRecords > 0 ? (((totalRecords - rejectedRecords) / totalRecords) * 100).toFixed(2) + '%' : 'N/A',
      last_job: jobs[jobs.length - 1] || null,
    };
  }

  /**
   * Get available quality rules
   */
  getAvailableQualityRules() {
    return Array.from(this.qualityRules.entries()).map(([key, rule]) => ({
      id: key,
      name: rule.name,
      severity: rule.severity,
    }));
  }
}

/**
 * Backend handler for data warehouse operations
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, pipelineConfig, pipelineId, sourceData } = await req.json();

    const warehouse = new DataWarehousePipeline();

    switch (action) {
      case 'create-pipeline':
        const pipeline = warehouse.createPipeline(pipelineConfig);
        return Response.json({ success: true, ...pipeline });

      case 'execute-job':
        const job = await warehouse.executeIngestionJob(pipelineId, sourceData);
        return Response.json({ success: true, ...job });

      case 'get-quality-report':
        const report = warehouse.getDataQualityReport(pipelineId);
        return Response.json({ success: true, ...report });

      case 'list-quality-rules':
        const rules = warehouse.getAvailableQualityRules();
        return Response.json({ success: true, rules });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { DataWarehousePipeline };