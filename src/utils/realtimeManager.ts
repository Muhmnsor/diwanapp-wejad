
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettingsStore } from '@/store/userSettingsStore';

// أنواع الأحداث التي يمكن الاستماع إليها
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// نوع معالج الحدث
type RealtimeEventHandler = (payload: any) => void;

// كائن تكوين للاستماع
interface SubscriptionConfig {
  schema?: string;
  table: string;
  event?: RealtimeEvent;
  filter?: string;
}

/**
 * مدير للاستماع للتغييرات في الوقت الحقيقي
 */
export class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, RealtimeChannel> = new Map();
  private enabled: boolean = true;

  // نمط Singleton
  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * تهيئة مدير التحديثات المباشرة
   */
  public initialize(): void {
    const userSettings = useUserSettingsStore.getState().settings;
    this.enabled = userSettings?.realtime_updates ?? true;
    
    // تحديث الحالة عند تغيير الإعدادات
    useUserSettingsStore.subscribe(
      state => state.settings?.realtime_updates,
      enabled => {
        if (enabled !== undefined && this.enabled !== enabled) {
          this.enabled = enabled;
          
          // إذا تم تعطيل التحديثات، قم بإلغاء جميع الاشتراكات
          if (!enabled) {
            this.unsubscribeAll();
          }
        }
      }
    );
  }

  /**
   * الاشتراك في تحديثات جدول
   */
  public subscribe(
    key: string,
    config: SubscriptionConfig,
    handler: RealtimeEventHandler
  ): () => void {
    // إذا كانت التحديثات المباشرة معطلة، فلا تفعل شيئًا
    if (!this.enabled) return () => {};
    
    // إنشاء قناة جديدة إذا لم تكن موجودة
    if (!this.channels.has(key)) {
      const channel = supabase.channel(`realtime:${key}`);
      this.channels.set(key, channel);
      
      // الاستماع للتغييرات
      channel
        .on(
          'postgres_changes',
          {
            event: config.event || '*',
            schema: config.schema || 'public',
            table: config.table,
            filter: config.filter
          },
          payload => {
            console.log(`Realtime event for ${config.table}:`, payload);
            handler(payload);
          }
        )
        .subscribe(status => {
          console.log(`Realtime subscription status for ${key}:`, status);
        });
    }
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => this.unsubscribe(key);
  }

  /**
   * إلغاء الاشتراك في تحديثات جدول
   */
  public unsubscribe(key: string): void {
    const channel = this.channels.get(key);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(key);
    }
  }

  /**
   * إلغاء جميع الاشتراكات
   */
  public unsubscribeAll(): void {
    this.channels.forEach((channel, key) => {
      supabase.removeChannel(channel);
      this.channels.delete(key);
    });
  }

  /**
   * تبديل حالة التحديثات المباشرة
   */
  public toggleRealtime(enabled: boolean): void {
    this.enabled = enabled;
    
    // إذا تم تعطيل التحديثات، قم بإلغاء جميع الاشتراكات
    if (!enabled) {
      this.unsubscribeAll();
    }
  }
}

// إنشاء مرجع سهل الاستخدام
export const realtimeManager = RealtimeManager.getInstance();
