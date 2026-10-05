export const categories = [
  {
    slug: "cozinha-pratica",
    name: "Cozinha Prática",
    nav: "Cozinha",
    eyebrow: "Bancada e despensa",
    description:
      "Peças que tiram o mantimento do caminho e deixam o preparo mais direto.",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Cozinha clara com bancada de madeira e luz natural",
  },
  {
    slug: "organizacao",
    name: "Organização",
    nav: "Organização",
    eyebrow: "Cada coisa no lugar",
    description: "Gavetas, cestos e superfícies que fecham o dia sem bagunça.",
    image:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Estante clara com objetos de casa organizados",
  },
  {
    slug: "limpeza-inteligente",
    name: "Limpeza Inteligente",
    nav: "Limpeza",
    eyebrow: "Casa fresca",
    description:
      "O essencial para manter o lar limpo sem transformar isso em tarefa pesada.",
    image:
      "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Banheiro claro com luz suave e superfícies limpas",
  },
  {
    slug: "bem-estar",
    name: "Bem-estar",
    nav: "Bem-estar",
    eyebrow: "Ritmo da casa",
    description: "Luz baixa, aroma e toque macio para o fim da rotina.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Cenário de descanso com pedras, toalha e luz quente",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function categoryName(slug: string) {
  return getCategory(slug)?.name ?? slug;
}
