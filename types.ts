export interface UserData {
  ageRange: string;
  gender: string;
  occupation: string;
  occupationOther?: string;
  major: string;
  majorOther?: string;
  visualExperience?: string;
}

export interface ResultImage {
    pipelineId: string;
    url: string;
}

export interface EvaluationRound {
    results: ResultImage[];
}

export interface ImageRating {
  pipelineId: string;
  url: string;
  scores: {
    plausibility: number;        // C1: Animal Plausibility
    silhouetteAdherence: number; // C2: Shape Conformity
    visualQuality: number;       // C3: Visual Naturalness
    contextualFidelity: number;  // C4: Contextual Fidelity
    creativePareidolia: number;  // C5: Creativity & Interestingness
  };
}

export interface RatingFormData {
  imageSetId: string;
  ratings: ImageRating[];
  formType?: string;
  comment?: string;
}

export interface RawImageSet {
    setId: string;
    original: string;
    results: ResultImage[];
}

export interface ProcessedImageSet {
    setId: string;
    original: string;
    rounds: EvaluationRound[];
}

export type PairwiseChoice = "A" | "B";

export type PairwiseCriterionKey =
  | "perceptualQuality"
  | "contentPreservation"
  | "structuralCoherence";

export interface PairwiseChoices {
  perceptualQuality: PairwiseChoice;
  contentPreservation: PairwiseChoice;
  structuralCoherence: PairwiseChoice;
}

export interface PairwiseRound {
  imageA: ResultImage;
  imageB: ResultImage;
}

export interface PairwiseImageSet {
  setId: string;
  original: string;
  rounds: PairwiseRound[];
}



export interface PairwiseFormData {
  imageSetId: string;
  roundIndex: number;
  imageA: ResultImage;
  imageB: ResultImage;
  choices: PairwiseChoices;
  formType?: string;
}