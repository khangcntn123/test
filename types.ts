export interface UserData {
    firstName: string;
    lastName: string;
    gender: string;
    occupation: string;
    occupationOther?: string;
    major: string;
    majorOther?: string;
    pareidoliaExperience?: string;
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

export type PairwiseChoice = "A" | "B" | "tie";

export type PairwiseCriterionKey =
  | "sketchDomainPreservation"
  | "structuralCoherence"
  | "styleFidelity";

export interface PairwiseRound {
  imageA: ResultImage;
  imageB: ResultImage;
}

export interface PairwiseImageSet {
  setId: string;
  original: string;
  rounds: PairwiseRound[];
}

export interface PairwiseChoices {
  sketchDomainPreservation: PairwiseChoice;
  structuralCoherence: PairwiseChoice;
  styleFidelity: PairwiseChoice;
}

export interface PairwiseFormData {
  imageSetId: string;
  roundIndex: number;
  imageA: ResultImage;
  imageB: ResultImage;
  choices: PairwiseChoices;
  formType?: string;
}