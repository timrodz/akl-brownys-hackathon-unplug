/** Postcode lookup uses Google Maps; no synthetic postcode coordinates. */
export type SearchPoint = { latitude: number; longitude: number; inAucklandRegion: boolean | null };
export async function geocodePostcode(postcode: string): Promise<SearchPoint | null> {
 const apiKey=process.env.GOOGLE_MAPS_API_KEY?.trim();
 if(!apiKey || !/^\d{4}$/.test(postcode))return null;
 try {
  const url=new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("components",`postal_code:${postcode}|country:NZ`);
  url.searchParams.set("key",apiKey);
  const response=await fetch(url,{signal:AbortSignal.timeout(8000),cache:"no-store"});
  if(!response.ok)return null;
  const data=await response.json();
  if(data.status!=="OK" || !Array.isArray(data.results))return null;
  const result=data.results.find((row: {address_components?: {long_name:string;short_name:string;types:string[]}[]})=>row.address_components?.some(c=>c.types.includes("postal_code")&&c.long_name===postcode)&&row.address_components?.some(c=>c.types.includes("country")&&c.short_name==="NZ"));
  const location=result?.geometry?.location;
  if(typeof location?.lat!=="number"||typeof location?.lng!=="number"||!Number.isFinite(location.lat)||!Number.isFinite(location.lng)||Math.abs(location.lat)>90||Math.abs(location.lng)>180)return null;
  return {latitude:location.lat,longitude:location.lng,inAucklandRegion:result.address_components.some((c:{long_name:string;types:string[]})=>c.types.includes("administrative_area_level_1")&&c.long_name==="Auckland")};
 }catch{return null;}
}
export function pointFromCoordinates(latitude: number,longitude: number): SearchPoint {
 // Region membership is unknown for device coordinates without reverse geocoding.
 return {latitude,longitude,inAucklandRegion:null};
}
export function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number):number {
 const rad=(deg:number)=>deg*Math.PI/180;
 const a=Math.sin(rad(lat2-lat1)/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(rad(lng2-lng1)/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));
}
