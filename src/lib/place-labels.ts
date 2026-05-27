type PlaceBuildingParts = {
  buildingName: string | null;
  floor: string | null;
};

export function getPlaceBuildingLabel(place: PlaceBuildingParts) {
  return [place.buildingName, place.floor].filter(Boolean).join(" ") || null;
}
