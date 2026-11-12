import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Studyfy — Your Knowledge. Your Space.",
    short_name: "Studyfy",
    description:
      "Your notes, documents and important work, organized in one personal workspace.",
    start_url: "/drive",
    display: "standalone",
    background_color: "#F4F2EA",
    theme_color: "#245B46",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
