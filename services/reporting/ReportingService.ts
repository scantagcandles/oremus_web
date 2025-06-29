import { supabase } from '@/configs/supabase';
import { ReportConfig } from '@/types/analytics';
import { EmailService } from '@/services/email/EmailService';
import * as XLSX from 'xlsx';

interface ReportData {
  columns: string[];
  rows: any[];
}

export class ReportingService {
  private static instance: ReportingService;
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): ReportingService {
    if (!ReportingService.instance) {
      ReportingService.instance = new ReportingService();
    }
    return ReportingService.instance;
  }

  /**
   * Create a new report configuration
   */
  async createReportConfig(config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt'>): Promise<ReportConfig> {
    const { data, error } = await supabase
      .from('report_configs')
      .insert({
        name: config.name,
        type: config.type,
        schedule: config.schedule,
        query: config.query,
        parameters: config.parameters,
        recipients: config.recipients,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get report configurations by type
   */
  async getReportConfigs(type?: string): Promise<ReportConfig[]> {
    let query = supabase.from('report_configs').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  /**
   * Generate a report based on its configuration
   */
  async generateReport(reportId: string, parameters?: Record<string, any>): Promise<string> {
    // Get report configuration
    const { data: reportConfig, error: configError } = await supabase
      .from('report_configs')
      .select('*')
      .eq('id', reportId)
      .single();

    if (configError) throw configError;

    // Execute the query with parameters
    const mergedParams = { ...reportConfig.parameters, ...parameters };
    const { data: queryData, error: queryError } = await supabase.rpc(
      'execute_report_query',
      {
        query_text: reportConfig.query,
        params: mergedParams
      }
    );

    if (queryError) throw queryError;

    // Generate file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${reportConfig.name.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    const filePath = `/reports/${fileName}`;

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(queryData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
    
    // Convert to buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Save to storage
    const { error: storageError } = await supabase
      .storage
      .from('reports')
      .upload(fileName, excelBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

    if (storageError) throw storageError;

    // Create entry in generated_reports table
    const { data: reportEntry, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        definition_id: reportId,
        name: reportConfig.name,
        format: 'excel',
        file_path: filePath,
        parameters: mergedParams,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // Update last run timestamp
    await supabase
      .from('report_configs')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', reportId);    // Send email notifications if recipients are configured
    if (reportConfig.recipients && reportConfig.recipients.length > 0) {
      const { data: publicUrl } = supabase
        .storage
        .from('reports')
        .getPublicUrl(fileName);

      for (const recipient of reportConfig.recipients) {
        await this.emailService.sendReportReady({
          email: recipient,
          reportName: reportConfig.name,
          generatedDate: new Date(),
          reportFormat: 'Excel',
          downloadUrl: publicUrl.publicUrl
        });
      }
    }

    return filePath;
  }

  /**
   * Get recently generated reports
   */
  async getGeneratedReports(limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('generated_reports')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get generated reports by definition id
   */
  async getReportsByDefinition(definitionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('definition_id', definitionId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Download a generated report
   */
  async downloadReport(reportId: string): Promise<{ url: string; fileName: string }> {
    const { data: report, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) throw error;

    const fileName = report.file_path.split('/').pop();
    const { data } = supabase
      .storage
      .from('reports')
      .getPublicUrl(fileName);

    return {
      url: data.publicUrl,
      fileName
    };
  }

  /**
   * Run scheduled reports
   */
  async runScheduledReports(): Promise<void> {
    const now = new Date();
    const { data: reports, error } = await supabase
      .from('report_configs')
      .select('*')
      .not('schedule', 'is', null);

    if (error) throw error;

    for (const report of reports) {
      try {
        if (this.shouldRunReport(report, now)) {
          await this.generateReport(report.id);
        }
      } catch (error) {
        console.error(`Failed to run scheduled report ${report.name}:`, error);
      }
    }
  }

  /**
   * Check if a report should run based on its schedule
   */
  private shouldRunReport(report: ReportConfig, now: Date): boolean {
    if (!report.schedule) return false;
    if (!report.lastRunAt) return true;

    const lastRun = new Date(report.lastRunAt);
    const schedule = report.schedule.toLowerCase();

    if (schedule === 'daily') {
      // Check if last run was yesterday or earlier
      return now.getDate() !== lastRun.getDate() || 
             now.getMonth() !== lastRun.getMonth() ||
             now.getFullYear() !== lastRun.getFullYear();
    } else if (schedule === 'weekly') {
      // Check if it's been at least 7 days
      return (now.getTime() - lastRun.getTime()) >= 7 * 24 * 60 * 60 * 1000;
    } else if (schedule === 'monthly') {
      // Check if it's a different month
      return now.getMonth() !== lastRun.getMonth() || 
             now.getFullYear() !== lastRun.getFullYear();
    } else if (schedule === 'quarterly') {      // Check if it's been at least 3 months
      const monthDiff = (now.getFullYear() - lastRun.getFullYear()) * 12 + 
                        (now.getMonth() - lastRun.getMonth());
      return monthDiff >= 3;
    }

    return false;
  }
}
