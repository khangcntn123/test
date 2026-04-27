// Để sử dụng icon, bạn cần cài đặt: npm install lucide-react
import { CheckCircle2 } from 'lucide-react';

export default function ThankYouStep() {
    return (
         <div className="min-h-screen flex items-center justify-center text-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Lớp nền trang trí */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50 to-indigo-50 z-0"></div>
            
            <div className="relative z-10 max-w-lg bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-lg animate-fade-in-up">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-6">Hoàn thành!</h1>
                
                <p className="text-xl mt-4 text-gray-800">
                    Cảm ơn bạn đã dành thời gian và tâm huyết.
                </p>
                <p className="mt-2 text-base text-gray-600 leading-relaxed">
                    Mỗi đánh giá của bạn là một đóng góp vô giá, giúp chúng tôi tiến gần hơn đến những đột phá mới. Chúc bạn một ngày tốt lành!
                </p>
                <p className="mt-4 text-gray-500 text-sm">
                    Thank you for your time and thoughtful feedback. Every rating is an invaluable contribution. Have a great day!
                </p>
                <p className="mt-8 text-xs text-gray-400">
                    Bạn có thể đóng trang này. / You may now close this page.
                </p>
            </div>
        </div>
    );
}

