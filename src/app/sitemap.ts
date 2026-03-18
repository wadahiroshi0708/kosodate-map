import { dataRepository } from "@/lib/data/json-adapter";
import type { MetadataRoute } from "next";

const BASE_URL = "https://kosodate-map.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const municipalities = await dataRepository.getMunicipalities();

  const municipalityPages = municipalities.flatMap((m) => [
    {
      url: `${BASE_URL}/${m.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/${m.id}/checklist`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/${m.id}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${m.id}/shops`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/${m.id}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ]);

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...municipalityPages,
  ];
}
