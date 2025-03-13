
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// إعداد معالج للأخطاء العامة في النافذة
window.addEventListener('error', (event) => {
  console.error('خطأ عام في التطبيق:', event.error);
});

// إعداد معالج لوعود غير معالجة
window.addEventListener('unhandledrejection', (event) => {
  console.error('وعد غير معالج:', event.reason);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const container = document.getElementById("root");

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error("فشل في تقديم التطبيق:", error);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; direction: rtl; font-family: 'Noto Kufi Arabic', sans-serif;">
        <h1 style="color: #d32f2f; font-size: 24px; margin-bottom: 16px;">حدث خطأ أثناء تحميل التطبيق</h1>
        <p style="color: #616161; margin-bottom: 24px;">نعتذر عن هذا الخطأ، يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.</p>
        <button 
          style="background-color: #6d28d9; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;" 
          onclick="window.location.reload()">
          إعادة تحميل الصفحة
        </button>
      </div>
    `;
  }
} else {
  console.error("لم يتم العثور على عنصر الجذر 'root'");
}
