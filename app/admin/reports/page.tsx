'use client';

import React, { useState } from 'react';
import ReportList from '@/components/admin/reporting/ReportList';
import ReportGenerator from '@/components/admin/reporting/ReportGenerator';
import GeneratedReports from '@/components/admin/reporting/GeneratedReports';
import NewReportForm from '@/components/admin/reporting/NewReportForm';
import { ReportConfig } from '@/types/analytics';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/glass/Button';

const ReportingPage = () => {
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [generatedFilePath, setGeneratedFilePath] = useState<string | null>(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);

  const handleReportSelected = (report: ReportConfig) => {
    setSelectedReport(report);
    setGeneratedFilePath(null);
  };

  const handleReportGenerated = (filePath: string) => {
    setGeneratedFilePath(filePath);
  };

  const handleNewReportCreated = () => {
    setShowNewReportForm(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reporting</h1>
          <p className="text-gray-600">Generate and manage reports</p>
        </div>
        <Button
          onClick={() => setShowNewReportForm(!showNewReportForm)}
          className="px-4 py-2"
        >
          {showNewReportForm ? 'Cancel' : 'Create New Report'}
        </Button>
      </div>

      {showNewReportForm ? (
        <NewReportForm onCreated={handleNewReportCreated} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <ReportList onSelectReport={handleReportSelected} />
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            {selectedReport ? (
              <ReportGenerator
                report={selectedReport}
                onGenerated={handleReportGenerated}
              />
            ) : (
              <GlassCard className="p-6 flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <p className="text-lg">Select a report to continue</p>
                  <p className="text-sm mt-2">Choose from the list of available reports</p>
                </div>
              </GlassCard>
            )}

            <div className="mt-6">
              <GlassCard className="p-4">
                <GeneratedReports
                  reportId={selectedReport?.id}
                />
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {generatedFilePath && (
        <div className="fixed inset-x-0 bottom-0 p-4">
          <div className="max-w-md mx-auto bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold">Report Generated!</p>
              <p className="text-sm">Your report has been generated successfully.</p>
            </div>
            <Button
              onClick={() => setGeneratedFilePath(null)}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingPage;
