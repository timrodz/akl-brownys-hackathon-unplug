/** Approximate Auckland-area centres for four-digit NZ postcodes (demo geocoder). */

const AUCKLAND_POSTCODE_CENTRES: Record<string, { lat: number; lng: number }> =
  {
    "1010": { lat: -36.8485, lng: 174.7633 },
    "1011": { lat: -36.8447, lng: 174.7745 },
    "1021": { lat: -36.869, lng: 174.7765 },
    "1022": { lat: -36.8775, lng: 174.7768 },
    "1023": { lat: -36.8882, lng: 174.7491 },
    "1024": { lat: -36.9012, lng: 174.7234 },
    "1025": { lat: -36.912, lng: 174.71 },
    "1026": { lat: -36.925, lng: 174.698 },
    "1041": { lat: -36.8695, lng: 174.758 },
    "1042": { lat: -36.858, lng: 174.745 },
    "1050": { lat: -36.879, lng: 174.735 },
    "1051": { lat: -36.891, lng: 174.728 },
    "1052": { lat: -36.905, lng: 174.72 },
    "1060": { lat: -36.867, lng: 174.802 },
    "1061": { lat: -36.878, lng: 174.815 },
    "1071": { lat: -36.832, lng: 174.745 },
    "1072": { lat: -36.82, lng: 174.735 },
    "2010": { lat: -36.869, lng: 174.776 },
    "2012": { lat: -36.878, lng: 174.834 },
    "2013": { lat: -36.905, lng: 174.87 },
    "2014": { lat: -36.928, lng: 174.87 },
    "2016": { lat: -36.95, lng: 174.865 },
    "2018": { lat: -36.99, lng: 174.885 },
    "2022": { lat: -36.91, lng: 174.815 },
    "2023": { lat: -36.935, lng: 174.805 },
    "2024": { lat: -36.955, lng: 174.79 },
    "2025": { lat: -36.975, lng: 174.78 },
    "2102": { lat: -36.751, lng: 174.702 },
    "2103": { lat: -36.768, lng: 174.728 },
    "2104": { lat: -36.785, lng: 174.745 },
    "2110": { lat: -36.72, lng: 174.655 },
    "2112": { lat: -36.735, lng: 174.68 },
    "2120": { lat: -36.698, lng: 174.745 },
    "2121": { lat: -36.71, lng: 174.76 },
    "2122": { lat: -36.725, lng: 174.775 },
    "2145": { lat: -36.88, lng: 174.63 },
    "2146": { lat: -36.895, lng: 174.615 },
    "2150": { lat: -36.91, lng: 174.64 },
    "2161": { lat: -36.935, lng: 174.655 },
    "2163": { lat: -36.955, lng: 174.64 },
    "2241": { lat: -36.992, lng: 174.81 },
    "2250": { lat: -37.01, lng: 174.89 },
    "2261": { lat: -37.04, lng: 174.92 },
    "2571": { lat: -36.908, lng: 174.685 },
    "2576": { lat: -36.928, lng: 174.655 },
    "2582": { lat: -36.948, lng: 174.625 },
    "2583": { lat: -36.965, lng: 174.61 },
    "2584": { lat: -36.98, lng: 174.595 },
    "2585": { lat: -37.0, lng: 174.58 },
  };

const AUCKLAND_BOUNDS = {
  minLat: -37.1,
  maxLat: -36.55,
  minLng: 174.4,
  maxLng: 175.1,
};

export type SearchPoint = {
  latitude: number;
  longitude: number;
  inAucklandRegion: boolean;
};

export function geocodePostcode(postcode: string): SearchPoint | null {
  const centre = AUCKLAND_POSTCODE_CENTRES[postcode];
  if (!centre) {
    return null;
  }
  return {
    latitude: centre.lat,
    longitude: centre.lng,
    inAucklandRegion: true,
  };
}

export function pointFromCoordinates(
  latitude: number,
  longitude: number,
): SearchPoint {
  const inAucklandRegion =
    latitude >= AUCKLAND_BOUNDS.minLat &&
    latitude <= AUCKLAND_BOUNDS.maxLat &&
    longitude >= AUCKLAND_BOUNDS.minLng &&
    longitude <= AUCKLAND_BOUNDS.maxLng;

  return { latitude, longitude, inAucklandRegion };
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
