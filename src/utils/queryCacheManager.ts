
import { QueryClient } from '@tanstack/react-query';
import { useUserSettingsStore } from '@/store/userSettingsStore';
import { useAuthStore } from '@/store/refactored-auth';

/**
 * إنشاء مدير للتخزين المؤقت حسب تفضيلات المستخدم
 */
export const createOptimizedQueryClient = (): QueryClient => {
  const userSettings = useUserSettingsStore.getState().settings;
  const user = useAuthStore.getState().user;
  
  // تحديد مدة التخزين المؤقت بناءً على إعدادات المستخدم
  const cacheDuration = userSettings?.cache_duration_minutes || 5;
  const isDeveloper = user?.isDeveloper || false;
  
  // إنشاء خيارات مخصصة للتخزين المؤقت
  const queryClientOptions = {
    defaultOptions: {
      queries: {
        // مدة التخزين المؤقت (بالدقائق)
        staleTime: cacheDuration * 60 * 1000,
        // مدة الصلاحية (بالدقائق)
        cacheTime: cacheDuration * 2 * 60 * 1000,
        // محاولات إعادة الاتصال
        retry: isDeveloper ? 1 : 3,
        // تأخير بين محاولات إعادة الاتصال
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        // تحديث تلقائي عند استعادة الاتصال
        refetchOnWindowFocus: !isDeveloper,
        // تحديث تلقائي عند استعادة الاتصال بالإنترنت
        refetchOnReconnect: true,
      },
      mutations: {
        // محاولات إعادة الاتصال للتعديلات
        retry: isDeveloper ? 0 : 2,
      },
    },
  };

  return new QueryClient(queryClientOptions);
};

/**
 * تهيئة التخزين المؤقت حسب نوع المستخدم
 */
export const initializeCacheStrategy = (queryClient: QueryClient) => {
  const userSettings = useUserSettingsStore.getState().settings;
  const isDeveloper = userSettings?.developer_mode || false;
  
  // تعيين مراقبين للتخزين المؤقت للمطورين
  if (isDeveloper) {
    queryClient.getQueryCache().subscribe({
      onError: error => {
        console.error('Query Cache Error:', error);
      },
      onSuccess: data => {
        console.log('Query Cache Success:', data);
      }
    });
    
    queryClient.getMutationCache().subscribe({
      onError: error => {
        console.error('Mutation Cache Error:', error);
      },
      onSuccess: data => {
        console.log('Mutation Cache Success:', data);
      }
    });
  }
};

/**
 * تنظيف ذاكرة التخزين المؤقت
 */
export const clearQueryCache = (queryClient: QueryClient, queryKeys?: string[]) => {
  if (queryKeys && queryKeys.length > 0) {
    // مسح التخزين المؤقت لمفاتيح محددة
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  } else {
    // مسح كل التخزين المؤقت
    queryClient.clear();
  }
};
