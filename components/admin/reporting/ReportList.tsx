"use client";

import React, { useState, useEffect } from "react";
import { useReporting } from "@/hooks/useReporting";
import { ReportConfig, ReportType } from "@/types/analytics";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";

interface ReportListProps {
  onSelectReport: (report: ReportConfig) => void;
}

const ReportList: React.FC<ReportListProps> = ({ onSelectReport }) => {
  const { getReportConfigs, isLoading } = useReporting();
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [activeType, setActiveType] = useState<ReportType | "all">("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportConfigs = await getReportConfigs(
          activeType === "all" ? undefined : activeType
        );
        setReports(reportConfigs);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [getReportConfigs, activeType]);

  const reportTypes: { value: ReportType | "all"; label: string }[] = [
    { value: "all", label: "All Reports" },
    { value: "payment", label: "Payment Reports" },
    { value: "course", label: "Course Reports" },
    { value: "user", label: "User Reports" },
    { value: "webhook", label: "Webhook Reports" },
    { value: "custom", label: "Custom Reports" },
  ];

  return (
    <div>
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {reportTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              activeType === type.value
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <GlassCard
                key={report.id}
                className="p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => onSelectReport(report)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Type:{" "}
                      {report.type.charAt(0).toUpperCase() +
                        report.type.slice(1)}
                    </p>
                    {report.schedule && (
                      <p className="text-xs text-gray-500 mt-1">
                        Schedule: {report.schedule}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {report.lastRunAt
                      ? `Last run: ${new Date(
                          report.lastRunAt
                        ).toLocaleDateString()}`
                      : "Never run"}
                  </span>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No reports found for the selected type
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportList;
