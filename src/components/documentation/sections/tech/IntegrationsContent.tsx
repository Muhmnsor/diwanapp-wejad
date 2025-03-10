
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CodeBlock } from "../../components/CodeBlock";

export const IntegrationsContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">التكاملات المتاحة</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الخدمة</TableHead>
              <TableHead>الاستخدام</TableHead>
              <TableHead>المسار</TableHead>
              <TableHead>حالة التكامل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Supabase</TableCell>
              <TableCell>إدارة قاعدة البيانات، المصادقة، التخزين</TableCell>
              <TableCell><code>src/integrations/supabase/</code></TableCell>
              <TableCell><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مكتمل</span></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">WhatsApp Business API</TableCell>
              <TableCell>إرسال الإشعارات والرسائل التلقائية</TableCell>
              <TableCell><code>src/integrations/whatsapp/</code></TableCell>
              <TableCell><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مكتمل</span></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Asana</TableCell>
              <TableCell>إدارة المهام ومزامنتها</TableCell>
              <TableCell><code>src/integrations/asana/</code></TableCell>
              <TableCell><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">جزئي</span></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Google Calendar</TableCell>
              <TableCell>مزامنة الفعاليات والمواعيد</TableCell>
              <TableCell><code>src/integrations/google/calendar.ts</code></TableCell>
              <TableCell><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">قيد التطوير</span></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">PayTabs</TableCell>
              <TableCell>معالجة المدفوعات الإلكترونية</TableCell>
              <TableCell><code>src/integrations/payment/paytabs.ts</code></TableCell>
              <TableCell><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">جزئي</span></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Mailgun</TableCell>
              <TableCell>إرسال رسائل البريد الإلكتروني</TableCell>
              <TableCell><code>src/integrations/email/mailgun.ts</code></TableCell>
              <TableCell><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مكتمل</span></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <h4 className="font-medium mb-3">مثال على استخدام Supabase</h4>
        <CodeBlock
          code={`// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// مثال استخدام لاستعلام البيانات
export const fetchEvents = async (filters = {}) => {
  let query = supabase.from('events').select('*');
  
  // إضافة الفلاتر
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.from) {
    query = query.gte('event_date', filters.from);
  }
  
  if (filters.to) {
    query = query.lte('event_date', filters.to);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};`}
          language="typescript"
        />
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <h4 className="font-medium mb-3">مثال على استخدام WhatsApp API</h4>
        <CodeBlock
          code={`// src/integrations/whatsapp/api.ts
import axios from 'axios';

const TOKEN = import.meta.env.VITE_WHATSAPP_API_TOKEN;
const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
const BASE_URL = \`https://graph.facebook.com/v16.0/\${PHONE_NUMBER_ID}\`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${TOKEN}\`,
  },
});

// إرسال رسالة نصية
export const sendTextMessage = async (to: string, text: string) => {
  try {
    const response = await api.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body: text
      }
    });
    
    return {
      success: true,
      messageId: response.data.messages[0].id
    };
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// إرسال رسالة باستخدام قالب
export const sendTemplateMessage = async (to: string, templateName: string, language: string, components: any[]) => {
  try {
    const response = await api.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        },
        components
      }
    });
    
    return {
      success: true,
      messageId: response.data.messages[0].id
    };
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// مثال لإرسال إشعار للمشترك في فعالية
export const sendEventRegistrationConfirmation = async (to: string, eventName: string, eventDate: string, eventLocation: string) => {
  return sendTemplateMessage(
    to,
    'event_registration_confirmation',
    'ar',
    [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: eventName },
          { type: 'text', text: eventDate },
          { type: 'text', text: eventLocation }
        ]
      }
    ]
  );
};`}
          language="typescript"
        />
      </div>
    </div>
  );
};
