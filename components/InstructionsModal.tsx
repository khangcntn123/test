// Để sử dụng icon, bạn cần cài đặt: npm install lucide-react
import { Keyboard } from "lucide-react";

interface InstructionsModalProps {
  onStart: () => void;
  setsCount: number;
}

export default function InstructionsModal({
  onStart,
  setsCount,
}: InstructionsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl max-w-xl w-full text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Một vài hướng dẫn nhỏ
        </h2>
        <p className="text-lg text-gray-500 mt-1">Just a little guidance</p>

        <p className="mt-6 text-gray-700">
          Phía trước là {setsCount} lượt so sánh đang chờ đánh giá từ bạn.
          <br />
          <span className="text-sm">
            You will complete {setsCount} pairwise comparisons.
          </span>
        </p>

        <div className="mt-8 text-left bg-gray-50 p-5 rounded-lg w-full">
          <div className="flex items-center justify-center mb-4">
            <Keyboard className="text-indigo-500 mr-3" size={24} />
            <h3 className="font-bold text-lg text-gray-800">
              Phím tắt / Keyboard Shortcuts
            </h3>
          </div>

          <ul className="space-y-3">
            <li className="flex justify-between items-center">
              <span className="text-gray-600">Chọn ảnh A / Choose A:</span>
              <span className="font-mono bg-white px-2 py-1 rounded-md shadow-sm border">
                A
              </span>
            </li>

            <li className="flex justify-between items-center">
              <span className="text-gray-600">Chọn ảnh B / Choose B:</span>
              <span className="font-mono bg-white px-2 py-1 rounded-md shadow-sm border">
                B
              </span>
            </li>

            <li className="flex justify-between items-center">
              <span className="text-gray-600">Hòa / Tie:</span>
              <span className="font-mono bg-white px-2 py-1 rounded-md shadow-sm border">
                T
              </span>
            </li>

            <li className="flex justify-between items-center">
              <span className="text-gray-600">Gửi / Submit:</span>
              <span className="font-mono bg-white px-2 py-1 rounded-md shadow-sm border">
                Enter
              </span>
            </li>
          </ul>

          <p className="text-center text-xs text-gray-500 mt-4">
            Với mỗi tiêu chí, nhấn A, B hoặc T để chọn kết quả tốt hơn.
            <br />
            For each criterion, press A, B, or T to choose the better result.
          </p>
        </div>

        <button
          onClick={onStart}
          className="mt-8 w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 text-lg font-semibold transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <span>Tôi đã sẵn sàng!</span>
          <br />
          <span className="text-sm font-normal">I&apos;m ready!</span>
        </button>
      </div>
    </div>
  );
}