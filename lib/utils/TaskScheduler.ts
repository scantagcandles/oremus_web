import { parseExpression } from 'cron-parser';

export interface ScheduleConfig {
  id: string;
  cronExpression: string;
  lastRun?: Date;
  fn: () => Promise<void>;
}

export class TaskScheduler {
  private static instance: TaskScheduler;
  private tasks: Map<string, ScheduleConfig>;
  private intervals: Map<string, NodeJS.Timeout>;

  private constructor() {
    this.tasks = new Map();
    this.intervals = new Map();
  }

  public static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  public registerTask(config: ScheduleConfig): void {
    this.tasks.set(config.id, config);
    this.scheduleTask(config);
  }

  public removeTask(id: string): void {
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
    this.tasks.delete(id);
  }

  private scheduleTask(config: ScheduleConfig): void {
    try {
      const interval = parseExpression(config.cronExpression);
      const next = interval.next();
      const now = new Date();
      const delay = next.getTime() - now.getTime();

      const timeoutId = setTimeout(async () => {
        try {
          await config.fn();
          config.lastRun = new Date();
          this.scheduleTask(config); // Schedule next run
        } catch (error) {
          console.error(`Error executing task ${config.id}:`, error);
          this.scheduleTask(config); // Retry on next schedule even if it fails
        }
      }, delay);

      this.intervals.set(config.id, timeoutId);
    } catch (error) {
      console.error(`Error scheduling task ${config.id}:`, error);
    }
  }

  public getTaskStatus(id: string): { nextRun: Date | null; lastRun: Date | null } {
    const task = this.tasks.get(id);
    if (!task) {
      return { nextRun: null, lastRun: null };
    }

    try {
      const interval = parseExpression(task.cronExpression);
      const nextRun = interval.next().toDate();
      return {
        nextRun,
        lastRun: task.lastRun || null,
      };
    } catch (error) {
      console.error(`Error getting task status for ${id}:`, error);
      return { nextRun: null, lastRun: task.lastRun || null };
    }
  }
}
