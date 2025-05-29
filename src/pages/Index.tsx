
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Redirect to the store management app
    window.location.href = '/store.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-500">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">متجر إلكتروني</h1>
        <p className="text-xl">جاري التحويل إلى نظام إدارة المتجر...</p>
      </div>
    </div>
  );
};

export default Index;
