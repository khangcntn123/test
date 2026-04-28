import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { UserData, PairwiseFormData } from "../../types";

interface RequestBody extends PairwiseFormData {
  userData: UserData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const data = req.body as RequestBody;

    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error(
        "Missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variable."
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const {
      userData,
      imageSetId,
      roundIndex,
      imageA,
      imageB,
      choices,
      formType,
    } = data;

    const userIdentifier = `${userData.lastName}_${userData.firstName}`;

    const userOccupation =
      userData.occupation === "Other"
        ? userData.occupationOther
        : userData.occupation;

    const userMajor =
      userData.major === "Other"
        ? userData.majorOther
        : userData.major;

    const pareidoliaExp = userData.pareidoliaExperience || "N/A";
    const timestamp = new Date().toISOString();

    const getWinnerPipeline = (choice: "A" | "B" | "tie") => {
      if (choice === "A") return imageA.pipelineId;
      if (choice === "B") return imageB.pipelineId;
      return "tie";
    };

    const rowToAdd = [
      timestamp,
      userIdentifier,
      userData.gender,
      userOccupation || "",
      userMajor || "",
      pareidoliaExp,

      formType || "1",
      imageSetId,
      roundIndex,

      imageA.pipelineId,
      imageA.url,
      imageB.pipelineId,
      imageB.url,

      choices.sketchDomainPreservation,
      getWinnerPipeline(choices.sketchDomainPreservation),

      choices.structuralCoherence,
      getWinnerPipeline(choices.structuralCoherence),

      choices.styleFidelity,
      getWinnerPipeline(choices.styleFidelity),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PairwiseRatingsData!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowToAdd],
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Pairwise comparison saved",
    });
  } catch (error) {
    console.error("API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return res.status(500).json({
      status: "error",
      message: "Failed to process request",
      error: errorMessage,
    });
  }
}