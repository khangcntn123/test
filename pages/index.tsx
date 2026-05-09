import { useState, useEffect } from "react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";

// Import các component con
import WelcomeStep from "../components/WelcomeStep";
import InstructionsModal from "../components/InstructionsModal";
import CriteriaModal from "../components/CriteriaModal";
import RatingStep from "../components/RatingStep";
import ThankYouStep from "../components/ThankYouStep";
import PairwiseRatingStep from "../components/PairwiseRatingStep";

import {
  UserData,
  RawImageSet,
  ProcessedImageSet,
  EvaluationRound,
  RatingFormData,
  ResultImage,
  PairwiseImageSet,
  PairwiseRound,
  PairwiseFormData,
} from "../types";

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  let currentIndex = newArray.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }
  return newArray;
};

const createMainVsCompetitorRound = (
  results: ResultImage[],
  competitorType: string
): PairwiseRound | null => {
  const mainImage = results.find((img) => img.pipelineId === "sketchbloom");

  const competitors = results
    .filter((img) => img.pipelineId !== "sketchbloom")
    .sort((a, b) => a.pipelineId.localeCompare(b.pipelineId));

  const competitorIndex = Number(competitorType) - 1;
  const competitorImage = competitors[competitorIndex];

  if (!mainImage || !competitorImage) {
    return null;
  }

  const [imageA, imageB] = shuffleArray([mainImage, competitorImage]);

  return {
    imageA,
    imageB,
  };
};
const getValidBatchSize = (value: string | null): number => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 10;
};

export default function HomePage() {
  const searchParams = useSearchParams();
  // const type = searchParams.get("type") || "1";
  const competitorType = searchParams.get("type") || "1";
  const batch = searchParams.get("batch") || "all";
  const batchSize = getValidBatchSize(searchParams.get("batchSize"));
  const getSlicedDataByBatch = (
  data: RawImageSet[],
  batch: string,
  batchSize: number
): RawImageSet[] => {
  if (batch === "all") return data;

  const batchNumber = Number(batch);
  if (!Number.isInteger(batchNumber) || batchNumber <= 0) return data;

  const startIndex = (batchNumber - 1) * batchSize;
  const endIndex = startIndex + batchSize;

  return data.slice(startIndex, endIndex);
};

  const jsonFile = "/data.json";

  const [step, setStep] = useState<
    "welcome" | "instructions" | "criteria" | "rating" | "thank_you"
  >("welcome");
  const [userData, setUserData] = useState<UserData>({
    ageRange: "",
    gender: "",
    occupation: "",
    occupationOther: "",
    major: "",
    majorOther: "",
    visualExperience: "",
  });
  // const [processedSets, setProcessedSets] = useState<ProcessedImageSet[]>([]);
  const [processedSets, setProcessedSets] = useState<PairwiseImageSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
 
  // Khôi phục tiến trình
  useEffect(() => {
    const savedProgress = localStorage.getItem("survey-progress");
    if (savedProgress) {
      try {
        const { setIndex,roundIndex,savedUserData,savedCompetitorType,savedBatch,} =
          JSON.parse(savedProgress);
        if (
          typeof setIndex === "number" &&
          typeof roundIndex === "number" &&
          savedUserData?.ageRange &&
          savedCompetitorType === competitorType &&
          savedBatch === batch
        ) {
          setUserData(savedUserData);
          setCurrentSetIndex(setIndex);
          setCurrentRoundIndex(roundIndex);
          setStep("rating");
        }
      } catch (error) {
        localStorage.removeItem("survey-progress");
      }
    }
  }, [competitorType, batch]);

  // Lưu tiến trình
  useEffect(() => {
   if (step === "rating" && userData.ageRange) {
      const progress = {
        setIndex: currentSetIndex,
        roundIndex: currentRoundIndex,
        savedUserData: userData,
        savedCompetitorType: competitorType,
        savedBatch: batch,
      };

      localStorage.setItem("survey-progress", JSON.stringify(progress));
    }
  }, [step, currentSetIndex, currentRoundIndex, userData,  competitorType, batch]);

  // Tải và cắt dữ liệu
  useEffect(() => {
    fetch(jsonFile)
      .then((res) => res.json())
      .then((data: RawImageSet[]) => {
        const sortedData = data.sort((a, b) => {
          const numA = parseInt(a.setId.match(/\d+/)?.[0] || "0", 10);
          const numB = parseInt(b.setId.match(/\d+/)?.[0] || "0", 10);
          return numA - numB;
        });


        const slicedData = getSlicedDataByBatch(sortedData, batch, batchSize);

        const finalProcessedSets = slicedData
          .map((rawSet) => {
            const round = createMainVsCompetitorRound(
              rawSet.results,
              competitorType
            );

            if (!round) return null;

            return {
              setId: rawSet.setId,
              original: rawSet.original,
              rounds: [round],
            };
          })
          .filter((set): set is PairwiseImageSet => set !== null);

        setProcessedSets(finalProcessedSets);
      });
  }, [jsonFile, competitorType, batch]);

  useEffect(() => {
    if (step !== "rating" || processedSets.length === 0) return;
    const currentSet = processedSets[currentSetIndex];
    let nextSetIndex = currentSetIndex;
    let nextRoundIndex = currentRoundIndex + 1;

    if (nextRoundIndex >= currentSet.rounds.length) {
      nextRoundIndex = 0;
      nextSetIndex = currentSetIndex + 1;
    }

    if (nextSetIndex < processedSets.length) {
      const nextSetData = processedSets[nextSetIndex];
      const nextRoundData = nextSetData.rounds[nextRoundIndex];

      const imageA = new Image();
      imageA.src = nextRoundData.imageA.url;  

      const imageB = new Image();
      imageB.src = nextRoundData.imageB.url;
      if (nextSetIndex > currentSetIndex) {
        const originalImg = new Image();
        originalImg.src = nextSetData.original;
      }
    }
  }, [step, currentSetIndex, currentRoundIndex, processedSets]);

  const handleStart = () => {
  const needsMajor =
    userData.occupation === "Student" || userData.occupation === "Researcher";

  const needsOtherOccupation = userData.occupation === "Other";
  const needsOtherMajor = userData.major === "Other";

  const isValid =
    userData.ageRange &&
    userData.gender &&
    userData.occupation &&
    userData.visualExperience &&
    (!needsMajor || userData.major) &&
    (!needsOtherOccupation || userData.occupationOther) &&
    (!needsOtherMajor || userData.majorOther);

  if (isValid) {
    setStep("instructions");
  } else {
    alert("Vui lòng điền đầy đủ các thông tin bắt buộc. / Please complete all required fields.");
  }
};

  const handleSubmitRating = async (ratingData: RatingFormData) => {
    try {
      const dataToSend = {
        userData: userData,
        imageSetId: ratingData.imageSetId,
        roundIndex: currentRoundIndex,
        ratings: ratingData.ratings,
        formType: ratingData.formType,
      };

      const response = await fetch("/api/submit-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error("Network response was not ok");
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };
  const handleSubmitPairwise = async (comparisonData: PairwiseFormData) => {
    try {
      const response = await fetch("/api/submit-pairwise-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData,
          ...comparisonData,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
    } catch (error) {
      console.error("Failed to submit pairwise rating:", error);
    }
};

  const handleNext = () => {
    const currentSet = processedSets[currentSetIndex];
    if (currentRoundIndex < currentSet.rounds.length - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else if (currentSetIndex < processedSets.length - 1) {
      setCurrentSetIndex((prev) => prev + 1);
      setCurrentRoundIndex(0);
    } else {
      setStep("thank_you");
      localStorage.removeItem("survey-progress");
    }
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <WelcomeStep
            userData={userData}
            setUserData={setUserData}
            onStart={handleStart}
          />
        );
      case "instructions":
        const totalRatings = processedSets.reduce(
          (sum, set) => sum + set.rounds.length,
          0,
        );
        return (
          <InstructionsModal
            onStart={() => setStep("criteria")}
            setsCount={totalRatings}
          />
        );
      case "criteria":
        return <CriteriaModal onStart={() => setStep("rating")} />;
      case "rating":
        if (processedSets.length === 0)
          return (
            <div className="min-h-screen flex items-center justify-center">
              Đang tải dữ liệu ảnh...
            </div>
          );
        const currentSet = processedSets[currentSetIndex];
        const currentRoundData = currentSet.rounds[currentRoundIndex];

        return (
          <PairwiseRatingStep
            currentRoundData={currentRoundData}
            originalImage={currentSet.original}
            imageSetId={currentSet.setId}
            currentIndex={currentSetIndex}
            totalSets={processedSets.length}
            currentRound={currentRoundIndex}
            totalRounds={currentSet.rounds.length}
            onSubmit={handleSubmitPairwise}
            onNext={handleNext}
            formType={competitorType}
          />
  );
      case "thank_you":
        return <ThankYouStep />;
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Nghiên cứu so sánh sketch AI / AI Sketch Comparison Study</title>
      </Head>
      <main>{renderStep()}</main>
    </>
  );
}
