"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/configs/supabase";
import { GlassCard } from "@/components/glass/GlassCard";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CourseMetricsProps {
  timeframe: "day" | "week" | "month";
}

interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
  isPercentage?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  isPercentage,
}) => {
  const trendColor =
    trend === undefined ? "" : trend >= 0 ? "text-green-500" : "text-red-500";
  const formattedValue = isPercentage ? `${value}%` : value;

  return (
    <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <div className="mt-2 flex items-end space-x-2">
        <div className="text-2xl font-bold">{formattedValue}</div>
        {trend !== undefined && (
          <div className={`text-sm ${trendColor} flex items-center`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      {subtitle && <div className="mt-1 text-sm text-gray-500">{subtitle}</div>}
    </div>
  );
};

const CourseMetrics: React.FC<CourseMetricsProps> = ({ timeframe }) => {
  const [metrics, setMetrics] = useState({
    totalEnrollments: 0,
    activeStudents: 0,
    completionRate: 0,
    averageQuizScore: 0,
    enrollmentTrend: 0,
    completionTrend: 0,
  });

  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get current metrics
        const { data: courseAnalytics, error } = await supabase
          .from("course_analytics")
          .select("*")
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        // Get historical data for trends
        const timeAgo = new Date();
        if (timeframe === "day") timeAgo.setDate(timeAgo.getDate() - 1);
        else if (timeframe === "week") timeAgo.setDate(timeAgo.getDate() - 7);
        else timeAgo.setMonth(timeAgo.getMonth() - 1);

        const { data: historicalData } = await supabase
          .from("course_analytics")
          .select("*")
          .gte("recorded_at", timeAgo.toISOString())
          .order("recorded_at", { ascending: true });

        // Calculate trends
        const oldestData = historicalData?.[0];
        const enrollmentTrend = oldestData
          ? ((courseAnalytics.total_enrollments -
              oldestData.total_enrollments) /
              oldestData.total_enrollments) *
            100
          : 0;
        const completionTrend = oldestData
          ? ((courseAnalytics.completion_rate - oldestData.completion_rate) /
              oldestData.completion_rate) *
            100
          : 0;

        setMetrics({
          totalEnrollments: courseAnalytics.total_enrollments,
          activeStudents: courseAnalytics.active_students,
          completionRate: courseAnalytics.completion_rate,
          averageQuizScore: courseAnalytics.avg_quiz_score,
          enrollmentTrend,
          completionTrend,
        });

        // Prepare chart data
        if (historicalData) {
          const chartLabels = historicalData.map((d) =>
            new Date(d.recorded_at).toLocaleDateString()
          );

          setChartData({
            labels: chartLabels,
            datasets: [
              {
                label: "Active Students",
                data: historicalData.map((d) => d.active_students),
                borderColor: "rgb(59, 130, 246)",
                tension: 0.1,
              },
              {
                label: "Completion Rate",
                data: historicalData.map((d) => d.completion_rate),
                borderColor: "rgb(34, 197, 94)",
                tension: 0.1,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching course metrics:", error);
      }
    };

    fetchMetrics();
  }, [timeframe]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Course Performance Trends",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Enrollments"
          value={metrics.totalEnrollments}
          trend={metrics.enrollmentTrend}
        />
        <MetricCard
          title="Active Students"
          value={metrics.activeStudents}
          subtitle="Currently studying"
        />
        <MetricCard
          title="Completion Rate"
          value={metrics.completionRate}
          trend={metrics.completionTrend}
          isPercentage
        />
        <MetricCard
          title="Avg Quiz Score"
          value={metrics.averageQuizScore}
          isPercentage
        />
      </div>

      {chartData && (
        <div className="mt-6 bg-white/50 backdrop-blur-sm p-4 rounded-lg">
          <Line options={chartOptions} data={chartData} />
        </div>
      )}
    </div>
  );
};

export default CourseMetrics;
