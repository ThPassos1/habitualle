import { type CategorySlug } from "@/lib/categories";

export type ProductImage = {
  src: string;
  alt: string;
};

export type Review = {
  author: string;
  city: string;
  rating: number;
  text: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category: CategorySlug;
  featured: boolean;
  tagline: string;
  description: string;
  solutionTitle: string;
  solution: string[];
  details: string[];
  images: ProductImage[];
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  supplier: string;
  sku: string;
};

export type AdminProduct = Product & {
  stock: number;
  published: boolean;
};

function photo(id: string, alt: string, width = 1400): ProductImage {
  return {
    src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`,
    alt,
  };
}

export const products: Product[] = [
  {
    id: "potes-aurora",
    name: "Conjunto Potes Aurora",
    price: 189,
    compareAtPrice: 229,
    category: "cozinha-pratica",
    featured: true,
    tagline: "Mantimentos à vista, armário em silêncio.",
    description:
      "Quatro potes de vidro com tampa de bambu para grãos, biscoitos e o que some no fundo da despensa.",
    solutionTitle: "A despensa fecha sem lista na cabeça.",
    solution: [
      "Quando o pacote rasga e o arroz vai para um canto escuro, a compra se repete e a bancada vira depósito. O Aurora empilha, veda e deixa o conteúdo visível.",
      "A tampa de bambu fecha com um giro. A cozinha volta a ter superfície livre para o que você está cozinhando agora.",
    ],
    details: [
      "4 potes: 400 ml, 700 ml e dois de 1 litro",
      "Vidro e tampa de bambu com anel de silicone",
      "Lave a tampa à mão e o vidro na prateleira de cima da máquina",
    ],
    images: [
      photo("photo-1584568694244-14fbdf83bd30", "Potes de vidro com tampa sobre a bancada"),
      photo("photo-1610701596007-11502861dcfa", "Cozinha com potes e ingredientes à mão"),
      photo("photo-1556912173-46c336c7fd55", "Bancada clara com utensílios de cozinha"),
    ],
    colors: ["Off-white", "Areia"],
    sizes: ["Único"],
    rating: 4.8,
    reviewCount: 128,
    reviews: [
      {
        author: "Helena",
        city: "Campinas",
        rating: 5,
        text: "O feijão e o café ficaram na mesma prateleira, visíveis. Parei de comprar repetido.",
      },
      {
        author: "Paulo",
        city: "Curitiba",
        rating: 5,
        text: "A tampa fecha de verdade. Uso todo dia no café da manhã.",
      },
    ],
    supplier: "CJ Dropshipping",
    sku: "HAB-POT-04",
  },
  {
    id: "organizador-nido",
    name: "Organizador Nido",
    price: 159,
    category: "organizacao",
    featured: true,
    tagline: "A gaveta fecha de primeira.",
    description:
      "Módulos baixos que separam talheres, sachês e o que hoje vive solto na gaveta.",
    solutionTitle: "Abrir a gaveta deixa de ser uma escavação.",
    solution: [
      "O Nido cabe em gaveta de cozinha ou de escrivaninha. Cada peça tem um vão, e o resto da casa para de receber o que não coube.",
      "É baixo de propósito: a gaveta fecha sem empurrar, sem barulho e sem aquela pilha que cai para trás.",
    ],
    details: [
      "Conjunto com 6 módulos encaixáveis",
      "Bambu e acabamento fosco",
      "Limpar com pano úmido, sem imersão",
    ],
    images: [
      photo("photo-1616046229478-9901c5536a45", "Cômodo organizado com peças de madeira clara"),
      photo("photo-1594026112284-02bb6f3352fe", "Prateleira de casa com objetos em ordem"),
      photo("photo-1556228578-0d85b1a4d571", "Interior claro com superfícies livres"),
    ],
    colors: ["Areia", "Sálvia", "Off-white"],
    sizes: ["Único"],
    rating: 4.7,
    reviewCount: 86,
    reviews: [
      {
        author: "Lívia",
        city: "Belo Horizonte",
        rating: 5,
        text: "A gaveta dos talheres finalmente fecha. Parece outra cozinha.",
      },
      {
        author: "André",
        city: "Santos",
        rating: 4,
        text: "Usei dois módulos na mesa de trabalho. Cabo e carregador pararam de se misturar.",
      },
    ],
    supplier: "CJ Dropshipping",
    sku: "HAB-ORG-02",
  },
  {
    id: "panos-linho",
    name: "Panos de Linho Bruma",
    price: 119,
    category: "limpeza-inteligente",
    featured: true,
    tagline: "O pano que seca e ainda parece parte da casa.",
    description:
      "Trio de linho lavado para bancada, mesa e a mão que acabou de enxaguar a xícara.",
    solutionTitle: "Limpeza que não pede um armário só de produtos.",
    solution: [
      "Um pano bom substitui a pilha de descartáveis e o spray que ninguém lembra onde guardou. O linho absorve, seca rápido e fica no gancho sem parecer material de serviço.",
      "Três panos cobrem a bancada, a mesa e o banheiro. A rotina fica curta: usa, lava, pendura.",
    ],
    details: [
      "Trio em linho lavado, 45 × 65 cm",
      "Fica mais macio depois das primeiras lavagens",
      "Lavar a frio e secar à sombra",
    ],
    images: [
      photo("photo-1522771739844-6a9f6d5f14af", "Roupa de cama em linho claro sobre a cama"),
      photo("photo-1616594039964-ae9021a400a0", "Quarto com tecidos claros e luz da manhã"),
      photo("photo-1616486029423-aaa4789e8c9a", "Mesa posta com tecido neutro"),
    ],
    colors: ["Areia", "Off-white", "Sálvia"],
    sizes: ["Único"],
    rating: 4.9,
    reviewCount: 74,
    reviews: [
      {
        author: "Marina",
        city: "Florianópolis",
        rating: 5,
        text: "Sequei a louça do almoço e deixei o pano na bancada. Continua bonito.",
      },
      {
        author: "Tiago",
        city: "Recife",
        rating: 5,
        text: "Comprei para a cozinha e o terceiro foi parar no banheiro. Funciona nos dois.",
      },
    ],
    supplier: "AliExpress",
    sku: "HAB-LIN-03",
  },
  {
    id: "difusor-serra",
    name: "Difusor Serra",
    price: 249,
    category: "bem-estar",
    featured: true,
    tagline: "A casa ganha cheiro sem ganhar um aparelho.",
    description:
      "Difusor de cerâmica com varetas, para a sala ou o quarto, sem tomada e sem luz piscando.",
    solutionTitle: "O fim do dia pede um cômodo mais quieto.",
    solution: [
      "O Serra ocupa o espaço de um vaso pequeno. As varetas soltam o aroma devagar, e a sala não ganha mais um fio nem uma luz azul.",
      "É o tipo de peça que muda o humor do cômodo quando você chega, sem pedir configuração.",
    ],
    details: [
      "Frasco de cerâmica de 200 ml e 8 varetas",
      "Aroma de madeira clara e flor de laranjeira",
      "Dura cerca de oito semanas em ambiente arejado",
    ],
    images: [
      photo("photo-1608571423902-eed4a5ad8108", "Frascos de aroma sobre uma superfície de madeira"),
      photo("photo-1515377905703-c4788e51af15", "Velas acesas em um ambiente de descanso"),
      photo("photo-1544367567-0f2fcb009e0b", "Canto de descanso com luz baixa"),
    ],
    colors: ["Terracota", "Areia", "Off-white"],
    sizes: ["Único"],
    rating: 4.8,
    reviewCount: 103,
    reviews: [
      {
        author: "Clara",
        city: "São Paulo",
        rating: 5,
        text: "Deixei na entrada. Quem chega comenta o cheiro antes de comentar a sala.",
      },
      {
        author: "Rafael",
        city: "Brasília",
        rating: 4,
        text: "Silencioso de verdade. Uso no quarto e não compete com a luminária.",
      },
    ],
    supplier: "CJ Dropshipping",
    sku: "HAB-DIF-01",
  },
  {
    id: "luminaria-linho",
    name: "Luminária Linho",
    price: 329,
    compareAtPrice: 379,
    category: "bem-estar",
    featured: false,
    tagline: "Luz baixa para quando a casa já trabalhou.",
    description:
      "Cúpula de linho e base de cerâmica. Acende o canto da poltrona e deixa o resto na penumbra.",
    solutionTitle: "Uma luz só, no lugar certo.",
    solution: [
      "A luz do teto deixa a sala acordada demais depois do jantar. A Linho fica ao lado da poltrona e alcança o livro, a xícara e pouco mais.",
      "A cúpula filtra a lâmpada e a casa passa a ter um canto de fim de dia, em vez de um ambiente inteiro aceso.",
    ],
    details: [
      "Base de cerâmica e cúpula de linho, 48 cm de altura",
      "Cabo de 1,8 m e interruptor no fio",
      "Lâmpada E27, não inclusa. Prefira luz quente",
    ],
    images: [
      photo("photo-1507473885765-e6ed057f782c", "Luminária de mesa acesa ao lado de uma poltrona"),
      photo("photo-1513506003901-1e6a229e2d15", "Luminárias pendentes em ambiente aconchegante"),
      photo("photo-1540932239986-30128078f3c5", "Abajur com luz quente em um canto da sala"),
    ],
    colors: ["Areia", "Terracota", "Off-white"],
    sizes: ["Único"],
    rating: 4.9,
    reviewCount: 61,
    reviews: [
      {
        author: "Elisa",
        city: "Porto Alegre",
        rating: 5,
        text: "A sala inteira baixou o volume. Leio ali toda noite.",
      },
      {
        author: "Caio",
        city: "Niterói",
        rating: 5,
        text: "A cúpula é mais bonita pessoalmente. A luz não agride.",
      },
    ],
    supplier: "AliExpress",
    sku: "HAB-LUM-01",
  },
  {
    id: "cesto-bruma",
    name: "Cesto Bruma",
    price: 139,
    category: "organizacao",
    featured: false,
    tagline: "Onde a manta, a revista e o brinquedo descansam.",
    description:
      "Cesto alto de algodão trançado para a sala ou o quarto de hóspedes.",
    solutionTitle: "A sala arruma em um gesto.",
    solution: [
      "O que fica no sofá à noite cabe no Bruma de manhã. Manta, revista e o brinquedo que atravessou a sala voltam para um lugar só.",
      "O trançado é firme e as alças aguentam carregar o cesto de um cômodo para o outro.",
    ],
    details: [
      "Algodão trançado, cerca de 38 cm de altura",
      "Alças reforçadas",
      "Não lavar na máquina. Sacudir e limpar com pano seco",
    ],
    images: [
      photo("photo-1595428774223-ef52624120d2", "Sala com peças de decoração em tons neutros"),
      photo("photo-1583847268964-b28dc8f51f92", "Sala de estar clara com sofá e madeira"),
      photo("photo-1567016432779-094069958ea5", "Cesto e objetos de casa em ambiente claro"),
    ],
    colors: ["Areia", "Carvalho"],
    sizes: ["Único"],
    rating: 4.6,
    reviewCount: 54,
    reviews: [
      {
        author: "Bianca",
        city: "Goiânia",
        rating: 5,
        text: "A manta saiu do braço do sofá. A sala parece maior.",
      },
      {
        author: "Diego",
        city: "São Luís",
        rating: 4,
        text: "Cabe mais do que eu esperava. Uso no quarto do meu filho.",
      },
    ],
    supplier: "CJ Dropshipping",
    sku: "HAB-CES-01",
  },
  {
    id: "toalhas-areia",
    name: "Jogo de Toalhas Areia",
    price: 219,
    category: "bem-estar",
    featured: false,
    tagline: "Banho com peso certo e cor de areia.",
    description:
      "Jogo macio em algodão, na cor que combina com pedra, madeira e luz da manhã.",
    solutionTitle: "O banho termina sem a toalha fria e fina.",
    solution: [
      "Uma toalha leve demais molha o chão e esfria rápido. A Areia tem peso para secar e maciez para ficar no corpo enquanto o banheiro ainda está quente.",
      "A cor entra em banheiro de pedra, madeira ou tinta clara sem pedir uma reforma.",
    ],
    details: [
      "Algodão de 500 g/m²",
      "Banho: 70 × 140 cm. Rosto: 50 × 80 cm",
      "Lavar separado na primeira vez e secar em local arejado",
    ],
    images: [
      photo("photo-1631889993959-41b4e8a866f0", "Toalhas claras dobradas em um banheiro"),
      photo("photo-1620626011761-996317b8d101", "Banheiro com mármore e luz suave"),
      photo("photo-1507652313519-d4e9174996dd", "Detalhe de tecido macio em tom claro"),
    ],
    colors: ["Areia", "Off-white", "Sálvia"],
    sizes: ["Banho", "Rosto"],
    rating: 4.8,
    reviewCount: 92,
    reviews: [
      {
        author: "Sofia",
        city: "Rio de Janeiro",
        rating: 5,
        text: "Troquei o jogo antigo e o banheiro ficou mais calmo na hora.",
      },
      {
        author: "Igor",
        city: "Joinville",
        rating: 5,
        text: "Seca bem e não fica dura depois de lavar.",
      },
    ],
    supplier: "AliExpress",
    sku: "HAB-TOA-02",
  },
  {
    id: "tabua-carvalho",
    name: "Tábua Carvalho",
    price: 169,
    category: "cozinha-pratica",
    featured: false,
    tagline: "O corte do dia, fora da bancada molhada.",
    description:
      "Tábua de madeira com canal raso, para o pão, o limão e o que for para a panela.",
    solutionTitle: "A bancada para de ser tábua.",
    solution: [
      "Cortar direto na pedra marca a faca e espalha suco. A Carvalho segura o corte e o canal raso segura o limão.",
      "No fim do preparo, ela vai para a pia, seca em pé e a bancada volta a estar livre para servir.",
    ],
    details: [
      "Madeira de reflorestamento, 38 × 24 cm",
      "Canal raso nas bordas e furo para pendurar",
      "Lavar à mão e passar óleo mineral uma vez por mês",
    ],
    images: [
      photo("photo-1556909114-f6e7ad7d3136", "Cozinha com tábua e ingredientes frescos"),
      photo("photo-1556909172-54557c7e4fb7", "Preparação de comida em bancada de madeira"),
      photo("photo-1466637574441-749b8f19452f", "Ingredientes sobre uma mesa de cozinha"),
    ],
    colors: ["Carvalho"],
    sizes: ["Único"],
    rating: 4.7,
    reviewCount: 67,
    reviews: [
      {
        author: "Renata",
        city: "Ribeirão Preto",
        rating: 5,
        text: "Uso para o pão de manhã e para o jantar. Não entorta.",
      },
      {
        author: "Miguel",
        city: "Belém",
        rating: 4,
        text: "O canal segura o caldo do tomate. Era isso que faltava.",
      },
    ],
    supplier: "CJ Dropshipping",
    sku: "HAB-TAB-01",
  },
];

export function productSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getProductsByCategory(slug: CategorySlug) {
  return products.filter((product) => product.category === slug);
}

export function getRelatedProducts(id: string, limit = 3) {
  const current = getProduct(id);
  if (!current) return products.slice(0, limit);
  const sameCategory = products.filter(
    (product) => product.category === current.category && product.id !== id,
  );
  const others = products.filter(
    (product) => product.id !== id && product.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
