/** Shared catalogue source labels (safe for client components). */
export const DATA_SOURCE_OPTIONS = [
  { value: "manual", label: "Manual (Community / Local Entry)" },
  { value: "council_directory", label: "Auckland Council Directory" },
  { value: "recyclemap", label: "RecycleMap NZ" },
  { value: "repair_cafe", label: "Repair Network Aotearoa" },
  { value: "techcollect", label: "TechCollect NZ" },
  { value: "wasteminz", label: "WasteMINZ" },
  { value: "osm", label: "OpenStreetMap" },
] as const;
