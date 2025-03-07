
/**
 * Throttling Utilities
 * Provides functions to limit the rate of function calls
 */

/**
 * Creates a throttled function that only invokes func at most once per
 * every wait milliseconds.
 * 
 * @param func The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @param options Additional options
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let previous = 0;
  const { leading = true, trailing = true } = options;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    if (!previous && !leading) previous = now;
    
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(null, args);
    } else if (!timeout && trailing) {
      timeout = window.setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        func.apply(null, args);
      }, remaining);
    }
  };
}

/**
 * Creates a debounced function that delays invoking func until after wait
 * milliseconds have elapsed since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param options Additional options
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  
  const { leading = false, trailing = true, maxWait = wait * 3 } = options;
  
  function invokeFunc(time: number): void {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;
    func.apply(null, args);
  }
  
  function startTimer(pendingFunc: () => void, wait: number): number {
    return window.setTimeout(pendingFunc, wait);
  }
  
  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }
  
  function trailingEdge(time: number): void {
    timeout = null;
    
    if (trailing && lastArgs) {
      invokeFunc(time);
    }
    
    lastArgs = null;
  }
  
  function leadingEdge(time: number): void {
    lastInvokeTime = time;
    timeout = startTimer(() => trailingEdge(Date.now()), wait);
    
    if (leading) {
      invokeFunc(time);
    }
  }
  
  function timerExpired(): void {
    const time = Date.now();
    
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    
    // Restart the timer
    timeout = startTimer(
      timerExpired,
      wait - (time - (lastCallTime || 0))
    );
  }
  
  return function(...args: Parameters<T>): void {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeout === null) {
        leadingEdge(time);
      }
      return;
    }
    
    if (timeout === null) {
      timeout = startTimer(timerExpired, wait);
    }
  };
}

/**
 * Creates a rate-limited function that queues calls and processes them
 * at a defined rate.
 * 
 * @param func The function to rate limit
 * @param callsPerSecond Maximum number of calls allowed per second
 */
export function rateLimit<T extends (...args: any[]) => any>(
  func: T,
  callsPerSecond: number
): (...args: Parameters<T>) => void {
  const queue: {
    args: Parameters<T>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }[] = [];
  let timeout: number | null = null;
  const intervalMs = 1000 / callsPerSecond;
  
  function processQueue(): void {
    if (queue.length === 0) {
      timeout = null;
      return;
    }
    
    const { args, resolve, reject } = queue.shift()!;
    
    try {
      const result = func.apply(null, args);
      resolve(result);
    } catch (error) {
      reject(error);
    }
    
    timeout = window.setTimeout(processQueue, intervalMs);
  }
  
  return function(...args: Parameters<T>): Promise<any> {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject });
      
      if (timeout === null) {
        processQueue();
      }
    });
  };
}
