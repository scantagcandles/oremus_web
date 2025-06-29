import { useCallback, useState } from 'react';
import { ReportingService } from '@/services/reporting/ReportingService';
import { ReportConfig, ReportType } from '@/types/analytics';

interface UseReporting {
  getReportConfigs: (type?: ReportType) => Promise<ReportConfig[]>;
  generateReport: (reportId: string, parameters?: Record<string, any>) => Promise<string>;
  getGeneratedReports: (limit?: number) => Promise<any[]>;
  getReportsByDefinition: (definitionId: string) => Promise<any[]>;
  downloadReport: (reportId: string) => Promise<{ url: string; fileName: string }>;
  createReportConfig: (config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt'>) => Promise<ReportConfig>;
  isLoading: boolean;
  error: Error | null;
}

export const useReporting = (): UseReporting => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const reportingService = ReportingService.getInstance();

  const getReportConfigs = useCallback(async (type?: ReportType) => {
    try {
      setIsLoading(true);
      setError(null);
      return await reportingService.getReportConfigs(type);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (reportId: string, parameters?: Record<string, any>) => {
    try {
      setIsLoading(true);
      setError(null);
      return await reportingService.generateReport(reportId, parameters);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGeneratedReports = useCallback(async (limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      return await reportingService.getGeneratedReports(limit);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReportsByDefinition = useCallback(async (definitionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await reportingService.getReportsByDefinition(definitionId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadReport = useCallback(async (reportId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await reportingService.downloadReport(reportId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReportConfig = useCallback(async (config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      return await reportingService.createReportConfig(config);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getReportConfigs,
    generateReport,
    getGeneratedReports,
    getReportsByDefinition,
    downloadReport,
    createReportConfig,
    isLoading,
    error,
  };
};
