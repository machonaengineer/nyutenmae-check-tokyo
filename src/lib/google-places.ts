import "server-only";

export type GooglePlaceRatingSnapshot = {
  googlePlaceId: string;
  sourceUrl: string;
  sourceTitle: string;
  ratingValue: number | null;
  ratingCount: number | null;
};

type GooglePlaceResponse = {
  id?: string;
  displayName?: {
    text?: string;
  };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
};

export async function fetchGooglePlaceRatingSnapshot(
  googlePlaceId: string,
): Promise<GooglePlaceRatingSnapshot> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Google Places API request failed: ${response.status}`);
  }

  const data = (await response.json()) as GooglePlaceResponse;

  return {
    googlePlaceId: data.id ?? googlePlaceId,
    sourceUrl: data.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`,
    sourceTitle: data.displayName?.text ?? "Google マップ",
    ratingValue: typeof data.rating === "number" ? data.rating : null,
    ratingCount: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
  };
}
