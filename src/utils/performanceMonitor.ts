interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceEventData {
  type: 'navigation' | 'resource' | 'paint' | 'custom';
  name: string;
  duration: number;
  startTime: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = false;
  private logToConsole: boolean = true;
  private maxStoredEvents: number = 100;
  private events: PerformanceEventData[] = [];
  
  constructor() {
    this.setupPerformanceObserver();
  }
  
  public enable(logToConsole = true) {
    this.isEnabled = true;
    this.logToConsole = logToConsole;
    console.log('Performance monitoring enabled');
  }
  
  public disable() {
    this.isEnabled = false;
    console.log('Performance monitoring disabled');
  }
  
  public startMeasure(name: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    this.metrics.set(name, { name, startTime, metadata });
    
    if (this.logToConsole) {
      console.log(`Performance measure started: ${name}`);
    }
    
    return {
      end: () => this.endMeasure(name),
    };
  }
  
  public endMeasure(name: string) {
    if (!this.isEnabled) return 0;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance measure not found: ${name}`);
      return 0;
    }
    
    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    this.metrics.set(name, {
      ...metric,
      duration,
    });
    
    this.storeEvent({
      type: 'custom',
      name,
      duration,
      startTime: metric.startTime,
      metadata: metric.metadata,
    });
    
    if (this.logToConsole) {
      console.log(`Performance measure completed: ${name} (${duration.toFixed(2)}ms)`);
    }
    
    return duration;
  }
  
  public getMetrics() {
    return Array.from(this.metrics.values());
  }
  
  public getEvents() {
    return this.events;
  }
  
  public clearMetrics() {
    this.metrics.clear();
    this.events = [];
  }
  
  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;
    
    // Observe page navigation timing
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (this.isEnabled && entry.entryType === 'navigation') {
            this.storeEvent({
              type: 'navigation',
              name: 'page-load',
              duration: entry.duration,
              startTime: entry.startTime,
              metadata: {
                domContentLoaded: (entry as PerformanceNavigationTiming).domContentLoadedEventEnd,
                loadEvent: (entry as PerformanceNavigationTiming).loadEventEnd,
              },
            });
            
            if (this.logToConsole) {
              console.log(`Page load: ${entry.duration.toFixed(2)}ms`);
            }
          }
        }
      });
      
      navigationObserver.observe({ type: 'navigation', buffered: true });
    } catch (e) {
      console.warn('Navigation performance observer not supported');
    }
    
    // Observe resource loading
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (this.isEnabled && entry.entryType === 'resource') {
            this.storeEvent({
              type: 'resource',
              name: (entry as PerformanceResourceTiming).name.split('/').pop() || 'resource',
              duration: entry.duration,
              startTime: entry.startTime,
              metadata: {
                resourceType: (entry as PerformanceResourceTiming).initiatorType,
                url: (entry as PerformanceResourceTiming).name,
              },
            });
            
            if (this.logToConsole && (entry as PerformanceResourceTiming).initiatorType === 'fetch') {
              console.log(`API request: ${(entry as PerformanceResourceTiming).name} (${entry.duration.toFixed(2)}ms)`);
            }
          }
        }
      });
      
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch (e) {
      console.warn('Resource performance observer not supported');
    }
    
    // Observe paint timing
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (this.isEnabled && entry.entryType === 'paint') {
            this.storeEvent({
              type: 'paint',
              name: entry.name,
              duration: 0,
              startTime: entry.startTime,
            });
            
            if (this.logToConsole) {
              console.log(`Paint event: ${entry.name} at ${entry.startTime.toFixed(2)}ms`);
            }
          }
        }
      });
      
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('Paint performance observer not supported');
    }
  }
  
  private storeEvent(event: PerformanceEventData) {
    this.events.unshift(event);
    
    // Keep only the latest events to limit memory usage
    if (this.events.length > this.maxStoredEvents) {
      this.events = this.events.slice(0, this.maxStoredEvents);
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper hook for components
export const usePerformanceMonitor = () => {
  return performanceMonitor;
};
