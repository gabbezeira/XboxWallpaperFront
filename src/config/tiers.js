import {
  Shield,
  Gauge,
  Compass,
  Flame,
  Crown,
  Zap,
} from 'lucide-react';

export const TIERS = [
  {
    key: 'cadete',
    level: 1,
    name: 'Cadete UNSC',
    badgeLabel: 'CADETE UNSC',
    franchise: 'Universo Halo',
    minFavs: 0,
    maxFavs: 4,
    maxImages: 8,
    reqLabel: '0 a 4 favoritos',
    icon: Shield,
    desc: 'Ingresso nas fileiras da UNSC. Protocolo de instrução para novos membros, permitindo o envio das primeiras capturas e integração à rede de personalização.',
    benefits: [
      'Acesso irrestrito a todo o catálogo e sistema de favoritos',
      'Cota base de 8 slots de upload para wallpapers',
      'Submissão aberta para a curadoria comunitária',
    ],
  },
  {
    key: 'horizon',
    level: 2,
    name: 'Piloto Horizon',
    badgeLabel: 'PILOTO HORIZON',
    franchise: 'Forza Horizon',
    minFavs: 5,
    maxFavs: 19,
    maxImages: 10,
    reqLabel: '5 a 19 favoritos',
    icon: Gauge,
    desc: 'Credenciamento no Festival Horizon. Reconhecimento a fotógrafos dedicados a capturas automotivas, iluminação dinâmica e enquadramentos velozes.',
    benefits: [
      'Insígnia temática Piloto Horizon com velocímetro tático',
      'Expansão de cota para 10 slots de upload (+2 adicionais)',
      'Prioridade de indexação em buscas por jogos e tags',
    ],
  },
  {
    key: 'constelacao',
    level: 3,
    name: 'Explorador Constelação',
    badgeLabel: 'EXPLORADOR CONSTELAÇÃO',
    franchise: 'Starfield',
    minFavs: 20,
    maxFavs: 49,
    maxImages: 12,
    reqLabel: '20 a 49 favoritos',
    icon: Compass,
    desc: 'Navegador oficial da Constellation nas fronteiras do espaço profundo. Domínio de astrofotografia, paisagens cósmicas e composição em novos mundos.',
    benefits: [
      'Insígnia azul cobalto com bússola estelar de navegação',
      'Expansão de cota para 12 slots de upload (+2 adicionais)',
      'Fila prioritária de análise e moderação',
      'Elegibilidade para o Selo de Criador Verificado',
    ],
  },
  {
    key: 'cog',
    level: 4,
    name: 'Veterano Gears COG',
    badgeLabel: 'VETERANO COG',
    franchise: 'Gears of War',
    minFavs: 50,
    maxFavs: 99,
    maxImages: 14,
    reqLabel: '50 a 99 favoritos',
    icon: Flame,
    desc: 'Combatente condecorado do Esquadrão Delta. Acervo de alta intensidade com iluminação cinematográfica, peso tático e contraste dramático.',
    benefits: [
      'Insígnia sólida carmesim com chama de combate de Sera',
      'Expansão de cota para 14 slots de upload (+2 adicionais)',
      'Inclusão direta na seleção de criadores recomendados',
      'Destaque autoral nas páginas de visualização de detalhes',
    ],
  },
  {
    key: 'albion',
    level: 5,
    name: 'Guardião de Albion',
    badgeLabel: 'GUARDIÃO DE ALBION',
    franchise: 'Fable',
    minFavs: 100,
    maxFavs: 249,
    maxImages: 16,
    reqLabel: '100 a 249 favoritos',
    icon: Crown,
    desc: 'Herói lendário consagrado pela Guilda de Albion. Catálogo autoral de prestígio com alto impacto de engajamento e reconhecimento artístico na comunidade.',
    benefits: [
      'Insígnia dourada imperial com coroa de liderança',
      'Expansão de cota para 16 slots de upload (+2 adicionais)',
      'Elegibilidade para criação de Coleção Oficial dedicada',
      'Candidatura preferencial para o Hero Slider da Home',
    ],
  },
  {
    key: 'spartan',
    level: 6,
    name: 'Spartan Mythic 117',
    badgeLabel: 'SPARTAN 117',
    franchise: 'Halo Spartan-II',
    minFavs: 250,
    maxFavs: null,
    maxImages: 18,
    reqLabel: '250+ favoritos',
    icon: Zap,
    desc: 'A mais alta condecoração da plataforma. Armadura Mjolnir completa, liderança absoluta na comunidade e selo supremo de excelência do ecossistema Xbox.',
    benefits: [
      'Insígnia máxima verde Spartan com núcleo de energia Mjolnir',
      'Cota máxima definitiva de 18 slots de upload',
      'Destaque editorial permanente em toda a plataforma',
      'Acesso a canal de curadoria direta com a administração',
    ],
  },
];

export const LEGACY_KEY_MAP = {
  recruta: 'cadete',
  explorador: 'horizon',
  criador: 'constelacao',
  veterano: 'cog',
  elite: 'albion',
  spartan: 'spartan',
};

export function normalizeTierKey(rawKey) {
  if (!rawKey) return 'cadete';
  const clean = String(rawKey).toLowerCase().trim();
  if (LEGACY_KEY_MAP[clean]) return LEGACY_KEY_MAP[clean];
  const found = TIERS.find((t) => t.key === clean);
  return found ? found.key : 'cadete';
}

export function getTierByKey(rawKey) {
  const normalized = normalizeTierKey(rawKey);
  return TIERS.find((t) => t.key === normalized) || TIERS[0];
}

export function getUserTier(favoritesCount = 0) {
  const count = Number(favoritesCount) || 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].minFavs) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

export function getNextTier(currentTierKey) {
  const normalized = normalizeTierKey(currentTierKey);
  const currentIndex = TIERS.findIndex((t) => t.key === normalized);
  if (currentIndex < 0 || currentIndex >= TIERS.length - 1) return null;
  return TIERS[currentIndex + 1];
}

export function getUserLevel(favoritesCount = 0) {
  const tier = getUserTier(favoritesCount);
  return {
    key: tier.key,
    level: tier.level,
    label: tier.badgeLabel,
    name: tier.name,
    icon: tier.icon,
  };
}

export function getTierCssClass(tierOrLevel) {
  if (!tierOrLevel) return 'level_1';
  if (typeof tierOrLevel === 'number') return `level_${tierOrLevel}`;
  if (typeof tierOrLevel === 'object' && tierOrLevel.level) return `level_${tierOrLevel.level}`;
  if (typeof tierOrLevel === 'string') {
    const found = getTierByKey(tierOrLevel);
    return `level_${found?.level || 1}`;
  }
  return 'level_1';
}

export const TIER_LABELS = {
  cadete: 'CADETE UNSC',
  horizon: 'PILOTO HORIZON',
  constelacao: 'EXPLORADOR CONSTELAÇÃO',
  cog: 'VETERANO COG',
  albion: 'GUARDIÃO DE ALBION',
  spartan: 'SPARTAN 117',
  recruta: 'CADETE UNSC',
  explorador: 'PILOTO HORIZON',
  criador: 'EXPLORADOR CONSTELAÇÃO',
  veterano: 'VETERANO COG',
  elite: 'GUARDIÃO DE ALBION',
};
