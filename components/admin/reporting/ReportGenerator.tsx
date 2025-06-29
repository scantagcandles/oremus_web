"use client";

import React, { useState } from "react";
import { useReporting } from "@/hooks/useReporting";
import { ReportConfig } from "@/types/analytics";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassSelect } from "@/components/glass/GlassSelect";

interface ReportGeneratorProps {
  report: ReportConfig;
  onGenerated: (filePath: string) => void;
}

interface ParameterInputProps {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select";
  value: any;
  options?: { value: string; label: string }[];
  onChange: (value: any) => void;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  name,
  label,
  type,
  value,
  options,
  onChange,
}) => {
  if (type === "select" && options) {
    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
        <GlassSelect
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </GlassSelect>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <GlassInput
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  report,
  onGenerated,
}) => {
  const { generateReport, isLoading } = useReporting();
  const [parameters, setParameters] = useState<Record<string, any>>(
    report.parameters || {}
  );

  const getParameterOptions = (paramName: string) => {
    if (paramName === "provider") {
      return [
        { value: "stripe", label: "Stripe" },
        { value: "supabase", label: "Supabase" },
      ];
    }
    return [];
  };

  const getParameterType = (paramName: string) => {
    if (paramName.includes("date")) return "date";
    if (paramName === "provider") return "select";
    if (["amount", "count", "limit"].some((part) => paramName.includes(part)))
      return "number";
    return "text";
  };

  const handleGenerateReport = async () => {
    try {
      const filePath = await generateReport(report.id, parameters);
      onGenerated(filePath);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold mb-4">{report.name}</h2>
      <p className="text-gray-600 mb-6">
        {report.description || "Generate report with custom parameters"}
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Report Parameters</h3>
        {report.parameters && Object.keys(report.parameters).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(report.parameters).map(([key, value]) => (
              <ParameterInput
                key={key}
                name={key}
                label={key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
                type={getParameterType(key)}
                value={parameters[key] || value}
                options={
                  getParameterType(key) === "select"
                    ? getParameterOptions(key)
                    : undefined
                }
                onChange={(newValue) =>
                  setParameters({ ...parameters, [key]: newValue })
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">
            No parameters required for this report
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="px-4 py-2"
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </GlassCard>
  );
};

export default ReportGenerator;
