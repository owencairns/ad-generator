export interface StylePreset {
  name: string;
  description: string;
  usedFor: string[];
  thinkOf: string;
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
  "photo-realistic": {
    name: "Photo-Realistic",
    description:
      "Create a high-quality, authentic photographic advertisement with natural lighting, realistic textures, and professional composition. The image should look like it was captured by a professional photographer with high-end equipment.",
    usedFor: ["Food", "fashion", "travel", "lifestyle"],
    thinkOf: "High-quality, authentic photography",
  },
  cartoon: {
    name: "Cartoon / Illustrated",
    description:
      "Create a playful, hand-drawn style advertisement with vibrant colors and simplified shapes. The illustration should be clean and professional while maintaining a fun, approachable aesthetic.",
    usedFor: ["Apps", "kid-friendly brands"],
    thinkOf: "Playful, hand-drawn style",
  },
  minimalist: {
    name: "Minimalist",
    description:
      "Create a clean, modern advertisement with ample white space, simple geometric shapes, and a focus on essential elements. The design should be sophisticated and uncluttered with careful attention to typography and spacing.",
    usedFor: ["Tech", "luxury brands"],
    thinkOf: "Clean, sleek design",
  },
  vintage: {
    name: "Retro / Vintage",
    description:
      "Create a nostalgic advertisement with retro color palettes, classic typography, and aged textures. The design should evoke a specific era while maintaining a polished, contemporary appeal.",
    usedFor: ["Nostalgic", "boutique"],
    thinkOf: "Classic, aged textures",
  },
  "3d-rendered": {
    name: "3D Rendered",
    description:
      "Create a modern, three-dimensional advertisement with glossy surfaces, dramatic lighting, and stylized elements. The 3D rendering should be photorealistic with attention to materials, reflections, and shadows.",
    usedFor: ["Tech", "beauty"],
    thinkOf: "Glossy, stylized",
  },
};
