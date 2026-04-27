import {
  Target,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Maximize,
} from "lucide-react";

interface CriteriaModalProps {
  onStart: () => void;
}

export default function CriteriaModal({ onStart }: CriteriaModalProps) {
  const criteriaList = [
    {
      icon: <Target className="text-indigo-500" size={24} />,
      title: "Nhận diện sinh vật (Animal Plausibility)",
      desc: "Hình ảnh tạo ra có rõ ràng là một con vật và hợp lý không?",
    },
    {
      icon: <Maximize className="text-blue-500" size={24} />,
      title: "Khớp hình dáng (Silhouette Adherence)",
      desc: "Con vật có bám sát và lấp đầy khung/hình dạng gốc không?",
    },
    {
      icon: <Layers className="text-amber-500" size={24} />,
      title: "Hòa hợp bối cảnh (Contextual Fidelity)",
      desc: "Ảnh sinh ra có thay đổi hình dạng vật thể gốc không?\nCon vật có hòa quyện tự nhiên với màu sắc gốc không?",
    },
    {
      icon: <ImageIcon className="text-emerald-500" size={24} />,
      title: "Chất lượng ảnh (Visual Quality)",
      desc: "Ảnh có trông tự nhiên, sắc nét, và không bị lỗi dị tật do AI không?",
    },
    {
      icon: <Sparkles className="text-purple-500" size={24} />,
      title: "Mức độ sáng tạo (Creative Pareidolia)",
      desc: "Bạn có cảm thấy bất ngờ với sự biến đổi này không?\nThấy thú vị chứ?",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white px-6 sm:px-10 pt-4 pb-4 rounded-2xl shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Tiêu chí đánh giá
        </h2>
        <p className="text-lg text-center text-gray-500 mt-1 mb-4">
          Evaluation Criteria
        </p>

        <div className="space-y-4">
          {criteriaList.map((c, idx) => (
            <div
              key={idx}
              className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                {c.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{c.title}</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed whitespace-pre-line">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-4">
          <button
            onClick={onStart}
            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-700 text-lg font-bold transition-transform hover:scale-[1.02] focus:outline-none shadow-lg"
          >
            Bắt đầu đánh giá ngay!
          </button>
        </div>
      </div>
    </div>
  );
}
