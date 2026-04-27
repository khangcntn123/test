import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Eye, EyeOff, Coffee, AlertTriangle, HelpCircle, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";

import { UserData, EvaluationRound, RatingFormData, ImageRating } from "../types";

interface ModalProps {
  onDismiss: () => void;
}

interface SpamDetectorState {
  lastKey: string | null;
  lastTime: number;
  count: number;
}

const SpamWarningModal = ({ onDismiss }: ModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
      <div className="mx-auto bg-yellow-100 text-yellow-500 w-16 h-16 rounded-full flex items-center justify-center">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mt-6">Xin hãy chậm lại một chút</h2>
      <p className="text-gray-600 mt-2">Chúng tôi nhận thấy bạn đang đánh giá rất nhanh. Vui lòng dành thêm chút thời gian cho mỗi hình ảnh nhé.</p>
      <button onClick={onDismiss} className="mt-8 w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition-all transform hover:scale-105">
        OK, tôi sẽ cẩn thận hơn
      </button>
    </div>
  </div>
);

const BreakModal = ({ onDismiss }: ModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
      <div className="mx-auto bg-blue-100 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center">
        <Coffee size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mt-6">Tạm nghỉ chút nhé?</h2>
      <p className="text-gray-600 mt-2">Bạn đã đi được nửa chặng đường rồi! Hãy dành vài giây thư giãn nhé.</p>
      <button onClick={onDismiss} className="mt-8 w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105">
        Tôi đã sẵn sàng tiếp tục
      </button>
    </div>
  </div>
);

interface RatingStepProps {
  currentSet: EvaluationRound;
  originalImage: string;
  imageSetId: string;
  currentIndex: number;
  totalSets: number;
  currentRound: number;
  totalRounds: number;
  onSubmit: (data: RatingFormData) => Promise<void>;
  onNext: () => void;
  userData: UserData;
}

const Header = ({ currentIndex, totalSets, formType }: { currentIndex: number, totalSets: number, formType: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-6 animate-fade-in flex justify-between items-center">
    <div>
      <p className="font-semibold text-lg text-gray-800">Bộ ảnh {currentIndex + 1} / {totalSets}</p>
      <div className="w-48 bg-gray-200 rounded-full h-2.5 mt-2">
        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((currentIndex + 1) / totalSets) * 100}%` }}></div>
      </div>
    </div>
    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-100">
      Form Khảo Sát {formType}
    </div>
  </div>
);

export default function RatingStep({
  currentSet,
  originalImage,
  imageSetId,
  currentIndex,
  totalSets,
  currentRound,
  totalRounds,
  onSubmit,
  onNext,
}: RatingStepProps) {
  const searchParams = useSearchParams();
  const formType = searchParams.get("type") || "1";
  const [ratingInput, setRatingInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [breakShown, setBreakShown] = useState(false);
  const [showSpamWarning, setShowSpamWarning] = useState(false);
  
  const spamDetectionRef = useRef<SpamDetectorState>({ lastKey: null, lastTime: 0, count: 0 });
  const isSubmittingRef = useRef(false);

  const CRITERIA = [
    { vi: "Nhận diện sinh vật", en: "Animal Plausibility" },
    { vi: "Khớp hình dáng", en: "Silhouette Adherence" },
    { vi: "Hòa hợp bối cảnh", en: "Contextual Fidelity" },
    { vi: "Chất lượng ảnh", en: "Visual Quality" },
    { vi: "Mức độ sáng tạo", en: "Creative Pareidolia" },
  ];

  const numCriteria = currentSet?.results.length * CRITERIA.length || 20;
  const localStorageKey = `rating-progress-${imageSetId}`;
  const firstZeroIndex = ratingInput.indexOf("0");

  const handleSubmit = useCallback(() => {
    if (isSubmittingRef.current || ratingInput.includes("0")) return;
    isSubmittingRef.current = true;

    const ratings: ImageRating[] = currentSet.results.map((result, index) => {
      const baseIdx = index * CRITERIA.length;
      return {
        pipelineId: result.pipelineId,
        url: result.url,
        scores: {
          plausibility: parseInt(ratingInput[baseIdx], 10),
          silhouetteAdherence: parseInt(ratingInput[baseIdx + 1], 10),
          visualQuality: parseInt(ratingInput[baseIdx + 2], 10),
          contextualFidelity: parseInt(ratingInput[baseIdx + 3], 10),
          creativePareidolia: parseInt(ratingInput[baseIdx + 4], 10),
        },
      };
    });

    const submissionData: RatingFormData = { imageSetId, ratings, formType };
    localStorage.removeItem(localStorageKey);
    onSubmit(submissionData).catch((err) => console.error(err));

    setIsTransitioning(true);
    setTimeout(() => {
      onNext();
      setIsTransitioning(false);
      isSubmittingRef.current = false;
    }, 300);
  }, [ratingInput, currentSet, onSubmit, onNext, imageSetId, formType, localStorageKey]);

  useEffect(() => {
    setRatingInput("0".repeat(numCriteria));
    if (imageSetId) {
      const savedRating = localStorage.getItem(localStorageKey);
      if (savedRating && savedRating.length === numCriteria) setRatingInput(savedRating);
    }
  }, [currentIndex, currentRound, numCriteria, imageSetId, localStorageKey]);

  useEffect(() => {
    if (localStorageKey && ratingInput && ratingInput !== "0".repeat(numCriteria)) {
      localStorage.setItem(localStorageKey, ratingInput);
    }
  }, [ratingInput, localStorageKey, numCriteria]);

  useEffect(() => {
    if (currentIndex === Math.floor(totalSets / 2) && currentRound === 0 && !breakShown && currentIndex > 0) {
      setShowBreak(true);
      setBreakShown(true);
    }
  }, [currentIndex, currentRound, totalSets, breakShown]);

  const handleStarClick = (resultIndex: number, criterionIndex: number, newRating: number) => {
    const indexToUpdate = resultIndex * CRITERIA.length + criterionIndex;
    const newRatingChars = ratingInput.split("");
    newRatingChars[indexToUpdate] = String(newRating);
    setRatingInput(newChars => newRatingChars.join(""));
  };

  useEffect(() => {
    if (showBreak || showSpamWarning) return;
    window.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= "1" && e.key <= "5") {
        const now = Date.now();
        const { lastKey, lastTime, count } = spamDetectionRef.current;
        const newCount = (e.key === lastKey && now - lastTime < 150) ? count + 1 : 1;

        spamDetectionRef.current = { lastKey: e.key, lastTime: now, count: newCount };
        if (newCount >= 4) {
          setShowSpamWarning(true);
          return;
        }

        if (firstZeroIndex !== -1) {
          const newChars = ratingInput.split("");
          newChars[firstZeroIndex] = e.key;
          setRatingInput(newChars.join(""));
        }
      } else if (e.key === "Backspace") {
        let lastNonZeroIndex = -1;
        for (let i = ratingInput.length - 1; i >= 0; i--) {
          if (ratingInput[i] !== "0") { lastNonZeroIndex = i; break; }
        }
        if (lastNonZeroIndex !== -1) {
          const newChars = ratingInput.split("");
          newChars[lastNonZeroIndex] = "0";
          setRatingInput(newChars.join(""));
        }
      } else if (e.key === "Enter" && firstZeroIndex === -1) {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ratingInput, handleSubmit, showBreak, showSpamWarning, numCriteria, firstZeroIndex]);

  if (!currentSet || !currentSet.results) {
    return <div className="flex items-center justify-center h-screen"><p className="text-xl text-gray-500">Đang tải...</p></div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8 relative">
      {showBreak && <BreakModal onDismiss={() => setShowBreak(false)} />}
      {showSpamWarning && <SpamWarningModal onDismiss={() => { setShowSpamWarning(false); spamDetectionRef.current = { lastKey: null, lastTime: 0, count: 0 }; }} />}

      <button
        onClick={() => setIsFocusMode(!isFocusMode)}
        className="fixed top-4 right-4 z-40 p-2 rounded-full bg-white/70 backdrop-blur-sm shadow-md hover:bg-gray-100 text-gray-500 transition-all"
      >
        {isFocusMode ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>

      {/* Tooltip Hướng dẫn Phím tắt (?) */}
      <div className="fixed top-20 right-4 z-40 group hidden md:block">
        <div className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-indigo-500 cursor-help hover:bg-indigo-50 transition-all flex items-center justify-center">
          <HelpCircle size={24} />
        </div>
        <div className="absolute right-14 top-0 w-64 p-4 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none transform translate-x-4 group-hover:translate-x-0">
          <h4 className="font-bold text-gray-800 mb-2">Phím tắt:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Nhấn <span className="font-mono bg-gray-100 border px-1 rounded">1-5</span> để chấm điểm</li>
            <li>Nhấn <span className="font-mono bg-gray-100 border px-1 rounded">Enter</span> để qua ảnh mới</li>
            <li>Nhấn <span className="font-mono bg-gray-100 border px-1 rounded">Backspace</span> xóa lùi</li>
          </ul>
        </div>
      </div>

      {/* Tooltip Giải thích Tiêu chí (!) */}
      <div className="fixed top-36 right-4 z-40 group hidden md:block">
        <div className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-amber-500 cursor-help hover:bg-amber-50 transition-all flex items-center justify-center">
          <Info size={24} />
        </div>
        <div className="absolute right-14 top-0 w-72 p-4 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none transform translate-x-4 group-hover:translate-x-0">
          <h4 className="font-bold text-gray-800 mb-2">5 Tiêu chí:</h4>
          <ul className="text-xs text-gray-600 space-y-2">
            <li><strong>Nhận diện:</strong> Rõ ràng là con vật?</li>
            <li><strong>Khớp dáng:</strong> Bám sát cái bóng gốc?</li>
            <li><strong>Hòa hợp:</strong> Giữ màu/kết cấu của cảnh?</li>
            <li><strong>Chất lượng:</strong> Sắc nét, không dị tật AI?</li>
            <li><strong>Sáng tạo:</strong> Thú vị, độc đáo không?</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="md:w-2/5 md:sticky md:top-8 self-start z-10">
          <div className={`${isFocusMode ? "mt-0" : "mt-16"}`}>
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Ảnh Gốc <span className="font-normal text-gray-600">/ Original Image</span>
            </h2>
            <div className="relative aspect-square w-full bg-white p-2 rounded-lg shadow-md">
              <Image
                src={originalImage}
                alt="Original"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-contain rounded-md"
                priority
              />
            </div>
          </div>
        </div>

        <div className={`md:w-3/5 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
          {!isFocusMode && (
            <Header currentIndex={currentIndex} totalSets={totalSets} formType={formType} />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {currentSet.results.map((result, index) => (
              <div key={result.pipelineId + index} className="bg-white p-4 rounded-lg shadow-md animate-fade-in-up flex flex-col" style={{ animationDelay: `${index * 100}ms` }}>
                
                <div className="relative aspect-square w-full mb-4">
                  <Image
                    src={result.url}
                    alt={`Result ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-contain rounded-md bg-gray-50"
                    priority={index < 2}
                  />
                </div>
                
                <div className="flex-grow">
                  {CRITERIA.map((criterion, cIndex) => {
                    const globalIndex = index * CRITERIA.length + cIndex;
                    const rating = parseInt(ratingInput[globalIndex] || "0", 10);
                    const isFocus = firstZeroIndex === globalIndex;

                    return (
                      <div key={cIndex} className={`flex flex-col sm:flex-row sm:items-center justify-between py-1 px-2 rounded-lg -mx-2 transition-colors ${isFocus ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : ''}`}>
                        <div className="text-sm text-gray-600 pr-2">
                          <p className="font-semibold text-[14px] text-gray-800 flex items-center">
                            {criterion.vi} 
                            {isFocus && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>}
                          </p>
                          <p className="text-[11px] text-gray-400 leading-tight">{criterion.en}</p>
                        </div>
                        
                        <div className="flex cursor-pointer mt-1 sm:mt-0">
                          {[...Array(5)].map((_, starI) => (
                            <span
                              key={starI}
                              className={`text-2xl transition-colors ${starI < rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
                              onClick={() => handleStarClick(index, cIndex, starI + 1)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end items-center gap-4">
            {firstZeroIndex !== -1 && (
              <span className="text-gray-400 text-sm italic">Đang chờ bạn chấm điểm...</span>
            )}
            <button
              onClick={handleSubmit}
              disabled={firstZeroIndex !== -1}
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed hover:enabled:bg-green-600 hover:enabled:scale-105"
            >
              Gửi & Tiếp theo / Submit & Next (Enter)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}