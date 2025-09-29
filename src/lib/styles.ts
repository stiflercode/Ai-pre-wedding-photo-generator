export type StyleDef = {
  id: `prompt-${1|2|3|4|5|6}` | string;
  title: string;
  prompt: string;
  preview: string; // public path
};

export const STYLES: StyleDef[] = [
  {
    id: "prompt-1",
    title: "90s Vintage Romance",
    prompt:
      "Create a retro, vintage-inspired image - grainy yet bright. The girl should be draped in a perfect blue cotton saree with small white flower prints, paired with a white blouse with sleeves above the elbow, styled in a Pinterest-inspired aesthetic. The guy should be in a cotton shirt and pant with a flower bouquet in hand. The vibe must capture the essence of a 90s movie dark-brown-haired baddie, with silky hair and a small flower tucked visibly into her hair, enhanced by a windy, romantic atmosphere. She is sitting on a wooden bench as a few leaves blow in the air, while dramatic contrasts add mystery and artistry to the scene while the guy is bending in the wooden bench behind her smiling at her, creating a moody yet enchanting cinematic effect.",
    preview: "/styles/prompt-1.svg",
  },
  {
    id: "prompt-2",
    title: "Lakeside Golden Hour",
    prompt:
      "A stunning, 4K HD realistic, outdoor portrait of a couple in traditional Indian attire during golden hour. The man, in an off-white kurta-pajama and glasses with a watch, stands behind the woman, gently placing a jasmine garland in her wavy hair. She sits gracefully near a lake, wearing an elegant black saree draped over one shoulder revealing a sleeveless blouse, with a soft, loving smile looking slightly aside. The scene has a dreamy, cinematic tone with soft bokeh, creating a natural, peaceful, intimate atmosphere.",
    preview: "/styles/prompt-2.svg",
  },
  {
    id: "prompt-3",
    title: "Bollywood Stroll",
    prompt:
      "Outdoor candid couple photoshoot. A young Indian man is wearing a casual blue printed t-shirt, layered with a red-and-white check shirt, blue jeans, and sneakers, carrying a crossbody sling bag. Beside him, a young Indian woman in a bright blue saree with matching blouse holds his arm affectionately, smiling at him. Both are walking together, looking at each other with joyful expressions. Background: traditional Indian architectural archway and stone structure, slightly blurred. Lighting: natural daylight. Overall look: romantic, casual, Bollywood-style couple portrait.",
    preview: "/styles/prompt-3.svg",
  },
  {
    id: "prompt-4",
    title: "Intimate Indoor Braiding",
    prompt:
      "Generate an intimate couple photo indoors with warm soft light creating shadow patterns on the wall. The woman is standing gracefully, wearing a grey saree with a deep red blouse, silver earrings, and her long hair braided. The man, dressed in a red kurta and white pajama, is gently braiding her hair while looking at it with focus. Wooden carved antique door in the background.",
    preview: "/styles/prompt-4.svg",
  },
  {
    id: "prompt-5",
    title: "Retro Sunshine",
    prompt:
      "Generate a retro-style Indian couple photo outdoors in a natural setting with tall green trees and soft golden sunlight filtering through the leaves. The man is wearing a white short-sleeve shirt and black pants, sitting casually on a rustic stone railing, looking towards the woman with a happy smile. The woman is sitting beside him on the railing, wearing a red saree with black blouse, looking slightly away with a gentle smile. Natural daylight, earthy tones, cinematic depth, and realistic detailing.",
    preview: "/styles/prompt-5.svg",
  },
  {
    id: "prompt-6",
    title: "Fairytale Forest Dawn",
    prompt:
      "A magical pre-wedding shoot deep in a forest at dawn. Mist rolls between tall trees as sunlight filters through leaves, creating dappled golden light. The couple stands on a mossy path, her flowing gown slightly lifted by a breeze, and his arms wrapped around her from behind. Soft focus and warm tones evoke a fairytale romance.",
    preview: "/styles/prompt-6.svg",
  },
];

export const STYLE_MAP = Object.fromEntries(STYLES.map((s) => [s.id, s]));

