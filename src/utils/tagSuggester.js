const STOP_WORDS = new Set([
  'wallpaper',
  'wallpapers',
  'papel',
  'parede',
  'fundo',
  'background',
  'image',
  'imagem',
  'img',
  'desktop',
  'foto',
  'photo',
  'screen',
  'screenshot',
  'print',
  'art',
  'arte',
  'the',
  'and',
  'for',
  'with',
  'from',
  'para',
  'com',
  'sem',
  'por',
  'sobre',
  'uma',
  'uns',
  'umas',
  'esse',
  'essa',
  'este',
  'esta',
  'aqui',
  'tudo',
  'muito',
  'mais',
  'menos',
  'version',
  'versao',
  'novo',
  'nova',
  'new',
  'edit',
  'pack',
  'preview',
]);

const FRANCHISES = [
  {
    patterns: ['halo', 'master chief', 'spartan', 'arbiter', 'cortana', 'unsc', 'covenant'],
    tags: ['halo', 'xbox', 'master-chief', 'sci-fi'],
    game: 'Halo',
  },
  {
    patterns: ['forza', 'horizon', 'motorsport', 'turn 10', 'playground games'],
    tags: ['forza', 'xbox', 'automobilismo', 'carros', 'corrida'],
    game: 'Forza Horizon',
  },
  {
    patterns: ['gears of war', 'gears', 'marcus fenix', 'locust', 'kait diaz', 'cog'],
    tags: ['gears-of-war', 'xbox', 'marcus-fenix', 'acao'],
    game: 'Gears of War',
  },
  {
    patterns: ['starfield', 'constellation', 'starborn', 'settled systems'],
    tags: ['starfield', 'xbox', 'espaco', 'sci-fi', 'bethesda'],
    game: 'Starfield',
  },
  {
    patterns: ['cyberpunk', 'cyberpunk 2077', 'night city', 'edgerunners', 'johnny silverhand'],
    tags: ['cyberpunk-2077', 'cyberpunk', 'neon', 'futurista', 'sci-fi'],
    game: 'Cyberpunk 2077',
  },
  {
    patterns: ['elden ring', 'shadow of the erdtree', 'erdtree', 'malenia', 'tarnished'],
    tags: ['elden-ring', 'souls', 'rpg', 'dark-fantasy'],
    game: 'Elden Ring',
  },
  {
    patterns: ['dark souls', 'bloodborne', 'sekiro', 'fromsoftware', 'demon souls'],
    tags: ['dark-souls', 'souls', 'rpg', 'dark-fantasy'],
    game: 'Dark Souls',
  },
  {
    patterns: ['witcher', 'the witcher', 'geralt', 'rivia', 'ciri', 'yennefer'],
    tags: ['the-witcher', 'rpg', 'fantasia', 'medieval'],
    game: 'The Witcher',
  },
  {
    patterns: ['doom', 'doom eternal', 'slayer', 'doomguy', 'crucible'],
    tags: ['doom', 'fps', 'acao', 'sci-fi'],
    game: 'DOOM',
  },
  {
    patterns: ['resident evil', 'biohazard', 'leon kennedy', 'jill valentine', 'raccoon city'],
    tags: ['resident-evil', 'terror', 'survival-horror', 'capcom'],
    game: 'Resident Evil',
  },
  {
    patterns: ['call of duty', 'warzone', 'modern warfare', 'black ops', 'cod', 'ghost'],
    tags: ['call-of-duty', 'warzone', 'fps', 'militar'],
    game: 'Call of Duty',
  },
  {
    patterns: ['gta', 'grand theft auto', 'san andreas', 'vice city', 'los santos'],
    tags: ['gta', 'rockstar', 'mundo-aberto'],
    game: 'Grand Theft Auto',
  },
  {
    patterns: ['red dead', 'red dead redemption', 'rdr', 'arthur morgan', 'john marston'],
    tags: ['red-dead-redemption', 'western', 'rockstar'],
    game: 'Red Dead Redemption',
  },
  {
    patterns: ['assassins creed', 'assassin creed', 'ezio', 'altair', 'valhalla', 'animus'],
    tags: ['assassins-creed', 'acao', 'ubisoft', 'historia'],
    game: "Assassin's Creed",
  },
  {
    patterns: ['minecraft', 'creeper', 'steve', 'nether', 'mojang'],
    tags: ['minecraft', 'sandbox', 'pixel-art'],
    game: 'Minecraft',
  },
  {
    patterns: ['fallout', 'vault tec', 'vault boy', 'wasteland', 'pip boy'],
    tags: ['fallout', 'pos-apocaliptico', 'rpg', 'bethesda'],
    game: 'Fallout',
  },
  {
    patterns: ['god of war', 'kratos', 'atreus', 'valhalla', 'sparta'],
    tags: ['god-of-war', 'acao', 'mitologia'],
    game: 'God of War',
  },
  {
    patterns: ['spider man', 'spiderman', 'homem aranha', 'miles morales', 'peter parker'],
    tags: ['spider-man', 'marvel', 'super-heroi'],
    game: 'Spider-Man',
  },
  {
    patterns: ['batman', 'gotham', 'dark knight', 'coringa', 'joker', 'arkham'],
    tags: ['batman', 'dc', 'super-heroi', 'dark'],
    game: 'Batman',
  },
  {
    patterns: ['star wars', 'jedi', 'sith', 'darth vader', 'mandalorian', 'lightsaber'],
    tags: ['star-wars', 'sci-fi', 'espaco'],
    game: 'Star Wars',
  },
  {
    patterns: ['final fantasy', 'ffvii', 'cloud strife', 'sephiroth', 'chocobo'],
    tags: ['final-fantasy', 'j-rpg', 'fantasia'],
    game: 'Final Fantasy',
  },
  {
    patterns: ['persona', 'phantom thieves', 'joker persona', 'atlus'],
    tags: ['persona', 'anime', 'j-rpg'],
    game: 'Persona',
  },
  {
    patterns: ['mass effect', 'commander shepard', 'normandy', 'reapers'],
    tags: ['mass-effect', 'sci-fi', 'espaco', 'rpg'],
    game: 'Mass Effect',
  },
  {
    patterns: ['skyrim', 'the elder scrolls', 'tamriel', 'dovahkiin', 'dragonborn'],
    tags: ['skyrim', 'the-elder-scrolls', 'rpg', 'fantasia'],
    game: 'Skyrim',
  },
  {
    patterns: ['sea of thieves', 'pirata', 'pirate', 'rare'],
    tags: ['sea-of-thieves', 'xbox', 'piratas', 'oceano'],
    game: 'Sea of Thieves',
  },
  {
    patterns: ['fable', 'albion', 'playground'],
    tags: ['fable', 'xbox', 'fantasia', 'rpg'],
    game: 'Fable',
  },
  {
    patterns: ['hellblade', 'senua', 'ninja theory'],
    tags: ['hellblade', 'xbox', 'mitologia'],
    game: 'Hellblade',
  },
  {
    patterns: ['apex legends', 'apex', 'titanfall'],
    tags: ['apex-legends', 'fps', 'battle-royale'],
    game: 'Apex Legends',
  },
  {
    patterns: ['fortnite', 'battle royale'],
    tags: ['fortnite', 'battle-royale'],
    game: 'Fortnite',
  },
  {
    patterns: ['valorant', 'riot games', 'league of legends', 'lol'],
    tags: ['valorant', 'fps', 'competitivo', 'riot-games'],
    game: 'Valorant',
  },
  {
    patterns: ['overwatch', 'blizzard'],
    tags: ['overwatch', 'fps', 'blizzard'],
    game: 'Overwatch',
  },
  {
    patterns: ['destiny', 'destiny 2', 'bungie', 'guardian'],
    tags: ['destiny', 'sci-fi', 'fps'],
    game: 'Destiny',
  },
  {
    patterns: ['need for speed', 'nfs'],
    tags: ['need-for-speed', 'carros', 'corrida'],
    game: 'Need for Speed',
  },
  {
    patterns: ['horizon zero dawn', 'forbidden west', 'aloy'],
    tags: ['horizon', 'sci-fi', 'mundo-aberto'],
    game: 'Horizon',
  },
  {
    patterns: ['the last of us', 'tlou', 'joel', 'ellie'],
    tags: ['the-last-of-us', 'pos-apocaliptico', 'drama'],
    game: 'The Last of Us',
  },
  {
    patterns: ['hollow knight', 'silksong'],
    tags: ['hollow-knight', 'metroidvania', 'indie'],
    game: 'Hollow Knight',
  },
  {
    patterns: ['ori', 'blind forest', 'will of the wisps'],
    tags: ['ori', 'xbox', 'indie', 'arte'],
    game: 'Ori',
  },
  {
    patterns: ['cuphead', 'studio mdhr'],
    tags: ['cuphead', 'xbox', 'indie', 'retro'],
    game: 'Cuphead',
  },
  {
    patterns: ['hi fi rush', 'tango gameworks'],
    tags: ['hi-fi-rush', 'xbox', 'ritmo', 'anime'],
    game: 'Hi-Fi RUSH',
  },
  {
    patterns: ['avowed', 'obsidian'],
    tags: ['avowed', 'xbox', 'obsidian', 'rpg'],
    game: 'Avowed',
  },
  {
    patterns: ['indiana jones', 'great circle'],
    tags: ['indiana-jones', 'xbox', 'aventura'],
    game: 'Indiana Jones',
  },
  {
    patterns: ['death stranding', 'kojima', 'sam bridges'],
    tags: ['death-stranding', 'sci-fi'],
    game: 'Death Stranding',
  },
  {
    patterns: ['monster hunter', 'rathalos', 'capcom'],
    tags: ['monster-hunter', 'rpg', 'capcom'],
    game: 'Monster Hunter',
  },
  {
    patterns: ['metal gear', 'solid snake', 'big boss'],
    tags: ['metal-gear', 'stealth', 'acao'],
    game: 'Metal Gear',
  },
  {
    patterns: ['tekken', 'street fighter', 'mortal kombat'],
    tags: ['luta', 'arcade', 'competitivo'],
    game: 'Jogos de Luta',
  },
  {
    patterns: ['ghost of tsushima', 'samurai', 'jin sakai'],
    tags: ['ghost-of-tsushima', 'samurai', 'japao', 'acao'],
    game: 'Ghost of Tsushima',
  },
  {
    patterns: ['alan wake', 'control', 'remedy'],
    tags: ['alan-wake', 'terror', 'misterio'],
    game: 'Alan Wake',
  },
  {
    patterns: ['lies of p', 'pinocchio'],
    tags: ['lies-of-p', 'souls', 'dark-fantasy'],
    game: 'Lies of P',
  },
  {
    patterns: ['black myth', 'wukong'],
    tags: ['black-myth-wukong', 'acao', 'mitologia', 'rpg'],
    game: 'Black Myth: Wukong',
  },
  {
    patterns: ['palworld'],
    tags: ['palworld', 'mundo-aberto', 'sobrevivencia'],
    game: 'Palworld',
  },
  {
    patterns: ['stalker', 'heart of chornobyl'],
    tags: ['stalker', 'fps', 'pos-apocaliptico', 'terror'],
    game: 'S.T.A.L.K.E.R.',
  },
];

const THEMES = [
  {
    patterns: ['anime', 'manga', 'otaku', 'goku', 'naruto', 'luffy', 'zoro', 'bleach', 'jujutsu', 'demon slayer', 'evangelion'],
    tags: ['anime', 'japao', 'arte'],
  },
  {
    patterns: ['vaporwave', 'synthwave', 'retrowave', 'outrun'],
    tags: ['synthwave', 'vaporwave', 'neon', 'retro'],
  },
  {
    patterns: ['neon', 'blade runner', 'matrix', 'futuristic', 'futurista', 'cyber'],
    tags: ['neon', 'futurista', 'cyberpunk'],
  },
  {
    patterns: ['sunset', 'sunrise', 'por do sol', 'amanhecer', 'crepusculo', 'dusk', 'dawn', 'golden hour'],
    tags: ['sunset', 'paisagem', 'ceu'],
  },
  {
    patterns: ['night', 'noite', 'dark', 'sombrio', 'lua', 'moon', 'luar', 'midnight', 'shadow', 'preto', 'black'],
    tags: ['dark', 'noite', 'oled'],
  },
  {
    patterns: ['space', 'espaco', 'galaxia', 'galaxy', 'cosmos', 'nebula', 'estrelas', 'stars', 'planeta', 'planet', 'astronauta'],
    tags: ['espaco', 'cosmos', 'sci-fi'],
  },
  {
    patterns: ['minimal', 'minimalist', 'minimalista', 'clean', 'simples', 'simple', 'flat', 'line art'],
    tags: ['minimalista', 'clean'],
  },
  {
    patterns: ['abstract', 'abstrato', 'geometria', 'geometric', 'lines', 'ondas', 'gradient', 'gradiente'],
    tags: ['abstrato', 'arte', 'geometrico'],
  },
  {
    patterns: ['nature', 'natureza', 'floresta', 'forest', 'montanha', 'mountain', 'lago', 'lake', 'rio', 'river', 'waterfall', 'cachoeira', 'arvores', 'trees'],
    tags: ['natureza', 'paisagem'],
  },
  {
    patterns: ['ocean', 'oceano', 'mar', 'sea', 'beach', 'praia', 'ondas', 'waves', 'agua', 'water', 'underwater'],
    tags: ['oceano', 'mar', 'natureza'],
  },
  {
    patterns: ['car', 'carro', 'cars', 'carros', 'drift', 'supercar', 'porsche', 'ferrari', 'lamborghini', 'bmw', 'audi', 'mclaren', 'nissan', 'toyota', 'supra', 'skyline', 'jdm', 'racing', 'velocidade'],
    tags: ['carros', 'automobilismo', 'velocidade'],
  },
  {
    patterns: ['city', 'cidade', 'skyline', 'metropole', 'predios', 'edificios', 'tokyo', 'toquio', 'new york', 'street', 'rua', 'urban', 'urbano'],
    tags: ['cidade', 'urbano', 'arquitetura'],
  },
  {
    patterns: ['fantasy', 'fantasia', 'dragao', 'dragon', 'magic', 'magia', 'castelo', 'castle', 'espada', 'sword', 'medieval', 'cavaleiro', 'knight'],
    tags: ['fantasia', 'medieval'],
  },
  {
    patterns: ['retro', 'pixel', 'pixel art', '8bit', '16bit', 'vintage', 'nostalgia', 'arcade', '90s', '80s'],
    tags: ['retro', 'pixel-art', 'vintage'],
  },
  {
    patterns: ['samurai', 'katana', 'ninja', 'ronin', 'shogun'],
    tags: ['samurai', 'japao', 'arte'],
  },
];

const TECHNICAL = [
  {
    patterns: ['4k', 'uhd', '3840', '2160', '3840x2160', 'ultra hd'],
    tags: ['4k', 'uhd'],
  },
  {
    patterns: ['8k', '7680', '4320', '7680x4320'],
    tags: ['8k'],
  },
  {
    patterns: ['oled', 'amoled', 'true black', 'pure black'],
    tags: ['oled', 'dark'],
  },
  {
    patterns: ['hdr', 'hdr10', 'dolby vision'],
    tags: ['hdr'],
  },
  {
    patterns: ['1440p', '2k', 'qhd', '2560x1440'],
    tags: ['1440p', 'qhd'],
  },
  {
    patterns: ['1080p', 'fhd', 'full hd', '1920x1080'],
    tags: ['1080p'],
  },
  {
    patterns: ['xbox', 'series x', 'series s', 'xbox one', 'console'],
    tags: ['xbox', 'console'],
  },
];

const FALLBACK_POPULAR = ['4k', 'oled', 'xbox', 'minimalista', 'paisagem', 'hdr', 'cyberpunk', 'natureza'];

function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanTag(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function detectGameFromText(text) {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  for (const franchise of FRANCHISES) {
    for (const pattern of franchise.patterns) {
      const reg = new RegExp(`(?:^|\\s)${pattern}(?:\\s|$)`, 'i');
      if (reg.test(normalized)) {
        return franchise.game;
      }
    }
  }
  return null;
}

export function suggestTags({ title = '', fileName = '', game = '', existingTags = [], limit = 8 } = {}) {
  const combinedText = `${title} ${fileName} ${game}`;
  const normalized = normalizeText(combinedText);
  const normalizedExisting = new Set((existingTags || []).map((t) => cleanTag(t)));

  const suggestedMap = new Map();

  function addTagWithScore(rawTag, score) {
    const tag = cleanTag(rawTag);
    if (!tag || tag.length < 2 || normalizedExisting.has(tag)) return;
    const currentScore = suggestedMap.get(tag) || 0;
    suggestedMap.set(tag, currentScore + score);
  }

  if (game && game.trim()) {
    const normGame = normalizeText(game);
    addTagWithScore(cleanTag(game), 25);
    for (const f of FRANCHISES) {
      for (const pattern of f.patterns) {
        if (normGame.includes(pattern)) {
          f.tags.forEach((t, i) => addTagWithScore(t, 20 - i));
        }
      }
    }
  }

  for (const f of FRANCHISES) {
    for (const pattern of f.patterns) {
      const reg = new RegExp(`(?:^|\\s)${pattern}(?:\\s|$)`, 'i');
      if (reg.test(normalized)) {
        f.tags.forEach((t, i) => addTagWithScore(t, 18 - i));
        break;
      }
    }
  }

  for (const theme of THEMES) {
    for (const pattern of theme.patterns) {
      const reg = new RegExp(`(?:^|\\s)${pattern}(?:\\s|$)`, 'i');
      if (reg.test(normalized)) {
        theme.tags.forEach((t, i) => addTagWithScore(t, 14 - i));
        break;
      }
    }
  }

  for (const tech of TECHNICAL) {
    for (const pattern of tech.patterns) {
      const reg = new RegExp(`(?:^|\\s)${pattern}(?:\\s|$)`, 'i');
      if (reg.test(normalized)) {
        tech.tags.forEach((t, i) => addTagWithScore(t, 12 - i));
        break;
      }
    }
  }

  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  for (const token of rawTokens) {
    if (token.length >= 4 && !STOP_WORDS.has(token) && !/^\d+$/.test(token)) {
      addTagWithScore(token, 8);
    }
  }

  for (const fb of FALLBACK_POPULAR) {
    if (!suggestedMap.has(fb) && !normalizedExisting.has(fb)) {
      addTagWithScore(fb, 1);
    }
  }

  const sorted = Array.from(suggestedMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return sorted.slice(0, limit);
}
