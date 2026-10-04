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
    name: 'Cadete',
    badgeLabel: 'CADETE',
    franchise: 'Nível Inicial',
    minFavs: 0,
    maxFavs: 4,
    maxImages: 8,
    reqLabel: '0 a 4 favoritos',
    icon: Shield,
    desc: 'Ponto de partida para novos membros. Permite enviar seus primeiros wallpapers, organizar favoritos e iniciar sua jornada de contribuição na comunidade.',
    benefits: [
      'Acesso irrestrito a todo o catálogo e sistema de favoritos',
      'Cota base de 8 slots de upload para wallpapers',
      'Elegibilidade para receber curtidas e subir de patente',
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
    desc: 'Reconhecimento para criadores ativos que começam a engajar a comunidade com capturas dinâmicas, boa iluminação e composição de destaque.',
    benefits: [
      'Insígnia temática Piloto Horizon no perfil público',
      'Expansão de armazenamento para 10 slots (+2 slots)',
      'Destaque orgânico na listagem por jogos e categorias',
    ],
  },
  {
    key: 'constelacao',
    level: 3,
    name: 'Explorador',
    badgeLabel: 'EXPLORADOR',
    franchise: 'Starfield',
    minFavs: 20,
    maxFavs: 49,
    maxImages: 12,
    reqLabel: '20 a 49 favoritos',
    icon: Compass,
    desc: 'Destinado a criadores com estilo autoral consistente, trazendo wallpapers de alta fidelidade e composições que atraem atenção contínua da comunidade.',
    benefits: [
      'Insígnia temática com bússola estelar de exploração',
      'Expansão de armazenamento para 12 slots (+2 slots)',
      'Prioridade na fila de processamento e aprovação',
      'Elegibilidade para o Selo de Criador Verificado',
    ],
  },
  {
    key: 'cog',
    level: 4,
    name: 'Veterano COG',
    badgeLabel: 'VETERANO COG',
    franchise: 'Gears of War',
    minFavs: 50,
    maxFavs: 99,
    maxImages: 14,
    reqLabel: '50 a 99 favoritos',
    icon: Flame,
    desc: 'Patente de destaque para criadores consolidados. Seus wallpapers contam com alto volume de favoritos e se tornam referências de personalização na dashboard.',
    benefits: [
      'Insígnia carmesim com efeito dinâmico e chama de honra',
      'Expansão de armazenamento para 14 slots (+2 slots)',
      'Acesso antecipado à criação de Coleção Oficial com código de busca',
      'Presença frequente nos feeds de criadores recomendados',
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
    desc: 'Prestígio concedido aos principais contribuidores da plataforma, com acervo de grande impacto visual, centenas de favoritos e relevância comprovada.',
    benefits: [
      'Insígnia dourada imperial com reflexo contínuo de liderança',
      'Expansão de armazenamento para 16 slots (+2 slots)',
      'Criação de coleções públicas dedicadas com slug customizado',
      'Candidatura preferencial para inclusão no Carrossel Hero da Home',
    ],
  },
  {
    key: 'spartan',
    level: 6,
    name: 'Spartan 117',
    badgeLabel: 'SPARTAN 117',
    franchise: 'Master Chief',
    minFavs: 250,
    maxFavs: null,
    maxImages: 18,
    reqLabel: '250+ favoritos',
    icon: Zap,
    desc: 'A patente suprema da comunidade Spartan. Uma marca de excelência máxima conquistada apenas pelos criadores mais influentes do ecossistema Xbox.',
    benefits: [
      'Insígnia lendária com aura verde Spartan e borda cinética',
      'Cota máxima definitiva de 18 slots de upload',
      'Destaque permanente na curadoria editorial da plataforma',
      'Canal de comunicação direto com a curadoria oficial',
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
  cadete: 'CADETE',
  horizon: 'PILOTO HORIZON',
  constelacao: 'EXPLORADOR',
  cog: 'VETERANO COG',
  albion: 'GUARDIÃO DE ALBION',
  spartan: 'SPARTAN 117',
  recruta: 'CADETE',
  explorador: 'EXPLORADOR',
  criador: 'EXPLORADOR',
  veterano: 'VETERANO COG',
  elite: 'GUARDIÃO DE ALBION',
};
