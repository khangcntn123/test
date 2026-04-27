import { useState, useEffect } from "react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";

// Import các component con
import WelcomeStep from "../components/WelcomeStep";
import InstructionsModal from "../components/InstructionsModal";
import CriteriaModal from "../components/CriteriaModal";
import RatingStep from "../components/RatingStep";
import ThankYouStep from "../components/ThankYouStep";

import {
  UserData,
  RawImageSet,
  ProcessedImageSet,
  EvaluationRound,
  RatingFormData,
  ResultImage,
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

export default function HomePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "1";
  const jsonFile = "/image-data.json";

  const [step, setStep] = useState<
    "welcome" | "instructions" | "criteria" | "rating" | "thank_you"
  >("welcome");
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    gender: "",
    occupation: "",
    occupationOther: "",
    major: "",
    majorOther: "",
    pareidoliaExperience: "",
  });
  const [processedSets, setProcessedSets] = useState<ProcessedImageSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Khôi phục tiến trình
  useEffect(() => {
    const savedProgress = localStorage.getItem("survey-progress");
    if (savedProgress) {
      try {
        const { setIndex, roundIndex, savedUserData, savedType } =
          JSON.parse(savedProgress);
        if (
          typeof setIndex === "number" &&
          savedUserData?.firstName &&
          savedType === type
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
  }, [type]);

  // Lưu tiến trình
  useEffect(() => {
    if (step === "rating" && userData.firstName) {
      const progress = {
        setIndex: currentSetIndex,
        roundIndex: currentRoundIndex,
        savedUserData: userData,
        savedType: type,
      };
      localStorage.setItem("survey-progress", JSON.stringify(progress));
    }
  }, [step, currentSetIndex, currentRoundIndex, userData, type]);

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

        let slicedData = [];
        if (type === "1") slicedData = sortedData.slice(0, 10);
        else if (type === "2") slicedData = sortedData.slice(10, 20);
        else if (type === "3") slicedData = sortedData.slice(20, 30);
        else if (type === "4") slicedData = sortedData.slice(30, 40);
        else slicedData = sortedData.slice(0, 10);

        const finalProcessedSets = slicedData.map((rawSet) => {
          const groupedByPipeline: { [key: string]: ResultImage[] } =
            rawSet.results.reduce(
              (acc, result) => {
                (acc[result.pipelineId] = acc[result.pipelineId] || []).push(
                  result,
                );
                return acc;
              },
              {} as { [key: string]: ResultImage[] },
            );

          const numRounds = Math.max(
            0,
            ...Object.values(groupedByPipeline).map((p) => p.length),
          );
          const rounds: EvaluationRound[] = [];

          for (let i = 0; i < numRounds; i++) {
            const roundResults: ResultImage[] = [];
            for (const pipelineImages of Object.values(groupedByPipeline)) {
              if (pipelineImages[i]) roundResults.push(pipelineImages[i]);
            }
            rounds.push({ results: shuffleArray(roundResults) });
          }
          return {
            setId: rawSet.setId,
            original: rawSet.original,
            rounds: rounds,
          };
        });
        setProcessedSets(finalProcessedSets);
      });
  }, [jsonFile, type]);

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
      nextRoundData.results.forEach((image) => {
        const img = new Image();
        img.src = image.url;
      });
      if (nextSetIndex > currentSetIndex) {
        const originalImg = new Image();
        originalImg.src = nextSetData.original;
      }
    }
  }, [step, currentSetIndex, currentRoundIndex, processedSets]);

  const handleStart = () => {
    if (
      userData.firstName &&
      userData.lastName &&
      userData.gender &&
      userData.occupation &&
      userData.pareidoliaExperience
    ) {
      setStep("instructions");
    } else {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
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
        return (
          <RatingStep
            currentSet={currentSet.rounds[currentRoundIndex]}
            originalImage={currentSet.original}
            imageSetId={currentSet.setId}
            currentIndex={currentSetIndex}
            totalSets={processedSets.length}
            currentRound={currentRoundIndex}
            totalRounds={currentSet.rounds.length}
            onSubmit={handleSubmitRating}
            onNext={handleNext}
            userData={userData}
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
        <title>Nghiên cứu Pareidolia & Trí tuệ nhân tạo</title>
      </Head>
      <main>{renderStep()}</main>
    </>
  );
}
