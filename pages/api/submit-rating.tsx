import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserData, ImageRating} from '../../types';

interface RequestBody {
  userData: UserData;
  imageSetId: string;
  roundIndex: number;
  ratings: ImageRating[];
  formType?: string; 
  comment?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const data = req.body as RequestBody;

    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variable.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const { userData, imageSetId, roundIndex, ratings, formType } = data;

    const userIdentifier = `${userData.lastName}_${userData.firstName}`;
    const userOccupation = userData.occupation === 'Other' ? userData.occupationOther : userData.occupation;
    const userMajor = userData.major === 'Other' ? userData.majorOther : userData.major;
    const pareidoliaExp = userData.pareidoliaExperience || 'N/A'; // Lấy câu trả lời Pareidolia
    const timestamp = new Date().toISOString();

    const rowsToAdd = ratings.map(rating => {
      return [
        timestamp,
        userIdentifier,
        userData.gender,
        userOccupation,
        userMajor,
        pareidoliaExp,                       // [Cột mới] Kinh nghiệm Pareidolia
        imageSetId,
        roundIndex,
        rating.pipelineId,
        rating.scores.plausibility,          // C1: Nhận diện
        rating.scores.silhouetteAdherence,   // C2: Khớp dáng
        rating.scores.contextualFidelity,    // C3: Hòa hợp
        rating.scores.visualQuality,         // C4: Chất lượng
        rating.scores.creativePareidolia,    // C5: Sáng tạo
        formType || '1',                     // Ghi nhận Form Type (1, 2, 3...)
      ];
    });

    if (rowsToAdd.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No ratings data provided.' });
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'RatingsData!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rowsToAdd,
      },
    });
    console.log('Google Sheets API Response:', response.data);

    res.status(200).json({ status: 'success', message: 'Data successfully saved' });

  } catch (error) {
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ status: 'error', message: 'Failed to process request', error: errorMessage });
  }
}