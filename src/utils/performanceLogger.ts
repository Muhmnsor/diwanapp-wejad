
interface PerformanceLog {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: any;
  metadata?: Record<string, any>;
}

class PerformanceLogger {
  private static instance: PerformanceLogger;
  private logs: PerformanceLog[] = [];
  private enabled: boolean = false;
  private maxLogs: number = 100;

  // نمط Singleton
  public static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  /**
   * تمكين تسجيل الأداء
   */
  public enable(maxLogs: number = 100): void {
    this.enabled = true;
    this.maxLogs = maxLogs;
  }

  /**
   * تعطيل تسجيل الأداء
   */
  public disable(): void {
    this.enabled = false;
    this.logs = [];
  }

  /**
   * تسجيل عملية مع قياس الوقت
   */
  public async logOperation<T>(
    operation: string, 
    callback: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return callback();
    }

    const startTime = performance.now();
    try {
      const result = await callback();
      const endTime = performance.now();
      
      this.logs.push({
        operation,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        metadata
      });
      
      // الحفاظ على عدد محدود من السجلات
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.logs.push({
        operation,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error,
        metadata
      });
      
      // الحفاظ على عدد محدود من السجلات
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
      
      throw error;
    }
  }

  /**
   * الحصول على جميع السجلات
   */
  public getLogs(): PerformanceLog[] {
    return this.logs;
  }

  /**
   * الحصول على إحصائيات الأداء
   */
  public getStats(): Record<string, any> {
    if (this.logs.length === 0) {
      return {};
    }
    
    const operationStats: Record<string, any> = {};
    
    // تجميع الإحصائيات حسب العملية
    this.logs.forEach(log => {
      if (!operationStats[log.operation]) {
        operationStats[log.operation] = {
          count: 0,
          totalDuration: 0,
          successCount: 0,
          errorCount: 0,
          avgDuration: 0,
          minDuration: Infinity,
          maxDuration: 0
        };
      }
      
      const stats = operationStats[log.operation];
      stats.count++;
      stats.totalDuration += log.duration;
      
      if (log.success) {
        stats.successCount++;
      } else {
        stats.errorCount++;
      }
      
      stats.minDuration = Math.min(stats.minDuration, log.duration);
      stats.maxDuration = Math.max(stats.maxDuration, log.duration);
      stats.avgDuration = stats.totalDuration / stats.count;
    });
    
    return operationStats;
  }

  /**
   * مسح جميع السجلات
   */
  public clearLogs(): void {
    this.logs = [];
  }
}

// إنشاء مرجع سهل الاستخدام
export const performanceLogger = PerformanceLogger.getInstance();

// تصدير دالة مساعدة لقياس أداء العمليات
export const measurePerformance = async <T>(
  operation: string, 
  callback: () => Promise<T>, 
  metadata?: Record<string, any>
): Promise<T> => {
  return performanceLogger.logOperation(operation, callback, metadata);
};
