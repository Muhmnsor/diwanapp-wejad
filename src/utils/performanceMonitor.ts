
/**
 * Performance monitoring utility for developers
 */

interface PerformanceEvent {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type?: 'navigation' | 'resource' | 'paint' | 'custom';
  metadata?: {
    resourceType?: string;
    [key: string]: any;
  };
}

class PerformanceMonitor {
  private events: PerformanceEvent[] = [];
  private isEnabled: boolean = false;
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.setupObserver();
  }

  private setupObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((entryList) => {
          if (!this.isEnabled) return;

          for (const entry of entryList.getEntries()) {
            this.addEvent({
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
              endTime: entry.startTime + entry.duration,
              type: entry.entryType as 'navigation' | 'resource' | 'paint',
              metadata: {
                resourceType: entry instanceof PerformanceResourceTiming ? entry.initiatorType : undefined
              }
            });
          }
        });

        this.observer.observe({ entryTypes: ['resource', 'navigation', 'paint'] });
      } catch (e) {
        console.error('Performance monitoring not supported:', e);
      }
    }
  }

  enable(clearExisting: boolean = false) {
    if (clearExisting) {
      this.events = [];
    }
    this.isEnabled = true;

    // Add page load event
    if (typeof window !== 'undefined' && window.performance) {
      const pageLoadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      this.addEvent({
        name: 'page-load',
        startTime: 0,
        duration: pageLoadTime,
        endTime: pageLoadTime
      });
    }

    return this;
  }

  disable() {
    this.isEnabled = false;
    return this;
  }

  addEvent(event: PerformanceEvent) {
    if (!this.isEnabled) return;
    this.events.push(event);
    return this;
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
    return this;
  }

  startMeasure(name: string) {
    if (!this.isEnabled) return;
    const startTime = performance.now();
    this.addEvent({ 
      name, 
      startTime, 
      type: 'custom' 
    });
    return () => this.endMeasure(name, startTime);
  }

  endMeasure(name: string, startTime: number) {
    if (!this.isEnabled) return;
    const endTime = performance.now();
    const event = this.events.find(e => e.name === name && e.startTime === startTime);
    
    if (event) {
      event.endTime = endTime;
      event.duration = endTime - startTime;
    }
    
    return endTime - startTime;
  }

  getAverageEventDuration(eventName: string) {
    const events = this.events.filter(e => e.name === eventName && e.duration !== undefined);
    if (events.length === 0) return 0;
    
    const totalDuration = events.reduce((sum, event) => sum + (event.duration || 0), 0);
    return totalDuration / events.length;
  }

  getMetrics() {
    return {
      navigationEvents: this.events.filter(e => e.type === 'navigation'),
      resourceEvents: this.events.filter(e => e.type === 'resource'),
      paintEvents: this.events.filter(e => e.type === 'paint'),
      customEvents: this.events.filter(e => e.type === 'custom')
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
