import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  PairwiseChoice,
  PairwiseFormData,
  PairwiseRound,
} from "../types";

interface PairwiseRatingStepProps {
  currentRoundData: PairwiseRound;
  originalImage: string;
  imageSetId: string;
  currentIndex: number;
  totalSets: number;
  currentRound: number;
  totalRounds: number;
  onSubmit: (data: PairwiseFormData) => Promise<void>;
  onNext: () => void;
  formType: string;
}

const CRITERIA = [
  {
    key: "sketchDomainPreservation",
    title: "Sketch domain preservation",
    desc: "Does the output look like a line drawing rather than a photograph?",
  },
  {
    key: "structuralCoherence",
    title: "Structural coherence",
    desc: "Does the extended region connect naturally with the original sketch?",
  },
  {
    key: "styleFidelity",
    title: "Style fidelity",
    desc: "Does the output reflect the stroke style of the reference image?",
  },
] as const;

export default function PairwiseRatingStep({
  currentRoundData,
  originalImage,
  imageSetId,
  currentIndex,
  totalSets,
  currentRound,
  totalRounds,
  onSubmit,
  onNext,
  formType,
}: PairwiseRatingStepProps) {
  const [choices, setChoices] = useState<{
    sketchDomainPreservation: PairwiseChoice | "";
    structuralCoherence: PairwiseChoice | "";
    styleFidelity: PairwiseChoice | "";
  }>({
    sketchDomainPreservation: "",
    structuralCoherence: "",
    styleFidelity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setChoices({
      sketchDomainPreservation: "",
      structuralCoherence: "",
      styleFidelity: "",
    });
  }, [imageSetId, currentRound]);

  const isComplete = Object.values(choices).every(Boolean);

  const setChoice = (
    key: keyof typeof choices,
    value: PairwiseChoice
  ) => {
    setChoices((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = useCallback(async () => {
  if (!isComplete || isSubmitting) return;

  setIsSubmitting(true);

  try {
    await onSubmit({
      imageSetId,
      roundIndex: currentRound,
      imageA: currentRoundData.imageA,
      imageB: currentRoundData.imageB,
      choices: {
        sketchDomainPreservation:
          choices.sketchDomainPreservation as PairwiseChoice,
        structuralCoherence:
          choices.structuralCoherence as PairwiseChoice,
        styleFidelity:
          choices.styleFidelity as PairwiseChoice,
      },
      formType,
    });

    onNext();
  } catch (error) {
    console.error("Submit failed:", error);
    alert("Gửi kết quả thất bại. Vui lòng thử lại.");
  } finally {
    setIsSubmitting(false);
  }
}, [
  isComplete,
  isSubmitting,
  onSubmit,
  imageSetId,
  currentRound,
  currentRoundData,
  choices,
  formType,
  onNext,
]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeCriterion = CRITERIA.find(
        (criterion) => !choices[criterion.key]
      );

      if (!activeCriterion) {
        if (e.key === "Enter" && !isSubmitting) {
            handleSubmit();
        }           
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "a") {
        setChoice(activeCriterion.key, "A");
      } else if (key === "b") {
        setChoice(activeCriterion.key, "B");
      } else if (key === "t") {
        setChoice(activeCriterion.key, "tie");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choices, handleSubmit, isSubmitting]);

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8">
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg text-gray-800">
            Bộ ảnh {currentIndex + 1} / {totalSets}
          </p>
          <p className="text-sm text-gray-500">
            Round {currentRound + 1} / {totalRounds}
          </p>
        </div>

        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-100">
          Competitor Type {formType}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-gray-800">
          Ảnh gốc / Reference Sketch
        </h2>

        <div className="relative aspect-square w-full max-w-md bg-white p-2 rounded-lg shadow-md mx-auto">
          <Image
            src={originalImage}
            alt="Original sketch"
            fill
            className="object-contain rounded-md"
            sizes="400px"
            priority
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ImageCard label="A" url={currentRoundData.imageA.url} />
        <ImageCard label="B" url={currentRoundData.imageB.url} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
        {CRITERIA.map((criterion) => (
          <div
            key={criterion.key}
            className="border-b last:border-b-0 pb-5 last:pb-0"
          >
            <h3 className="font-bold text-gray-800">
              {criterion.title}
            </h3>

            <p className="text-sm text-gray-500 mb-3">
              {criterion.desc}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <ChoiceButton
                active={choices[criterion.key] === "A"}
                onClick={() => setChoice(criterion.key, "A")}
              >
                A better
              </ChoiceButton>

              <ChoiceButton
                active={choices[criterion.key] === "tie"}
                onClick={() => setChoice(criterion.key, "tie")}
              >
                Tie
              </ChoiceButton>

              <ChoiceButton
                active={choices[criterion.key] === "B"}
                onClick={() => setChoice(criterion.key, "B")}
              >
                B better
              </ChoiceButton>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <p className="text-sm text-gray-400">
          Shortcut: A = chọn ảnh A, B = chọn ảnh B, T = Tie, Enter = Submit
        </p>

        <button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed hover:enabled:bg-green-600 hover:enabled:scale-105"
        >
          {isSubmitting ? "Submitting..." : "Submit & Next"}
        </button>
      </div>
    </div>
  );
}

function ImageCard({ label, url }: { label: string; url: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-center mb-3 text-xl">
        Image {label}
      </h3>

      <div className="relative aspect-square w-full">
        <Image
          src={url}
          alt={`Image ${label}`}
          fill
          className="object-contain rounded-md bg-gray-50"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 px-4 rounded-lg font-semibold border transition-all ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
      }`}
    >
      {children}
    </button>
  );
}