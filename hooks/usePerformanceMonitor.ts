import { useEffect, useRef } from "react";
import { analytics } from "../services/analyticsService";

interface UsePerformanceMonitorProps {
  componentName: string;
  enabled?: boolean;
}

export const usePerformanceMonitor = ({
  componentName,
  enabled = true,
}: UsePerformanceMonitorProps) => {
  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const loadTime = Date.now() - mountTime.current;
    analytics.trackPerformanceMetric(componentName, {
      loadTime,
    });

    return () => {
      const totalLifetime = Date.now() - mountTime.current;
      analytics.trackPerformanceMetric(componentName, {
        totalLifetime,
        renderCount: renderCount.current,
      });
    };
  }, [componentName, enabled]);

  useEffect(() => {
    if (!enabled) return;
    renderCount.current += 1;
  });

  const trackInteraction = (interactionName: string, duration: number) => {
    if (!enabled) return;
    analytics.trackPerformanceMetric(componentName, {
      interactionTime: duration,
      interactionName,
    });
  };

  return {
    trackInteraction,
  };
};

export default usePerformanceMonitor;
