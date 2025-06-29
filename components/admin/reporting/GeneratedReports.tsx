"use client";

import React, { useState, useEffect } from "react";
import { useReporting } from "@/hooks/useReporting";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";

interface GeneratedReportsProps {
  reportId?: string;
}

interface ReportFile {
  id: string;
  name: string;
  format: string;
  generatedAt: string;
  filePath: string;
}

const GeneratedReports: React.FC<GeneratedReportsProps> = ({ reportId }) => {
  const {
    getGeneratedReports,
    getReportsByDefinition,
    downloadReport,
    isLoading,
  } = useReporting();
  const [reports, setReports] = useState<ReportFile[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let reportData;
        if (reportId) {
          reportData = await getReportsByDefinition(reportId);
        } else {
          reportData = await getGeneratedReports(20);
        }

        setReports(
          reportData.map((report) => ({
            id: report.id,
            name: report.name,
            format: report.format,
            generatedAt: report.generated_at,
            filePath: report.file_path,
          }))
        );
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [reportId, getGeneratedReports, getReportsByDefinition]);

  const handleDownload = async (reportId: string) => {
    try {
      const { url, fileName } = await downloadReport(reportId);

      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {reportId ? "Report History" : "Recent Reports"}
      </h2>

      {reports.length > 0 ? (
        reports.map((report) => (
          <GlassCard key={report.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{report.name}</h3>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs uppercase">
                  {report.format}
                </span>
                <Button
                  onClick={() => handleDownload(report.id)}
                  className="px-3 py-1 text-sm"
                >
                  Download
                </Button>
              </div>
            </div>
          </GlassCard>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">No reports found</div>
      )}
    </div>
  );
};

export default GeneratedReports;
