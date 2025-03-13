
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("مكون إدارة الأخطاء التقط خطأً:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" dir="rtl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ في التطبيق</h1>
          <p className="text-gray-700 mb-2">نعتذر عن هذا الخطأ، يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.</p>
          <p className="text-sm text-gray-500 mb-6 max-w-lg text-center">
            تفاصيل الخطأ: {this.state.error?.message || "خطأ غير معروف"}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
