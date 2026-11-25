import { HERB_HABITS } from './herbHabits';
import { TREE_HABITS } from './treeHabits';
import type { Variety } from './varieties';

const { broadleaf, cherry, orchard, willow, cascade, pine, agave, coral, bush, fern, palm, bamboo, columnar, umbrella, bottle, birch, cactus } = TREE_HABITS;
const wood = ['#2b2118', '#6f5a41'] as const;

export const DEFAULT_TREE: Variety = { genus: 'Fagus', words: ['beech', 'elm', 'ash', 'linden', 'hetre', 'orme', 'frene', 'tilleul'], hints: ['broadleaf', 'deciduous', 'feuillu'], base: broadleaf };
export const FLOWERING_TREE: Variety = {
  genus: 'Prunus',
  words: ['cherry', 'sakura', 'plum', 'almond', 'peach', 'apricot', 'cerisier', 'prunier', 'amandier', 'pecher', 'abricotier'],
  hints: ['blossom', 'flowering', 'orchard', 'verger'],
  base: cherry,
};

export const TREES: readonly Variety[] = [
  FLOWERING_TREE,
  DEFAULT_TREE,
  { genus: 'Quercus', words: ['oak', 'chene'], base: broadleaf, leaf: ['lobed', 0.26] },
  { genus: 'Acer', words: ['maple', 'sycamore', 'plane', 'erable', 'platane'], base: broadleaf, leaf: ['palmate', 0.28] },
  { genus: 'Aesculus', words: ['chestnut', 'walnut', 'marronnier', 'chataignier', 'noyer'], base: broadleaf, leaf: ['palmate', 0.36] },
  { genus: 'Ginkgo', words: ['ginkgo'], base: broadleaf, leaf: ['round', 0.18], foliage: ['#5a7a1e', '#c9d24a', '#f0e85a'] },
  { genus: 'Ficus', words: ['fig', 'banyan', 'figuier'], base: broadleaf, leaf: ['round', 0.3] },
  { genus: 'Betula', words: ['birch', 'aspen', 'bouleau'], base: birch },
  { genus: 'Eucalyptus', words: ['eucalyptus', 'gum'], base: birch, leaf: ['lanceolate', 0.2], bark: ['#5f574c', '#d6d0c2'], foliage: ['#3f6a58', '#9cc4a8', '#d6e6a8'] },
  { genus: 'Populus', words: ['poplar', 'peuplier'], base: columnar },
  { genus: 'Cupressus', words: ['cypress', 'thuja', 'juniper', 'cypres', 'genevrier'], base: columnar, leaf: ['needle', 0.24], foliage: ['#12352b', '#3f7a52', '#a6c96a'], mood: 'studio' },
  { genus: 'Adansonia', words: ['baobab'], base: bottle },
  { genus: 'Vachellia', words: ['acacia', 'stone pine', 'pin parasol'], base: umbrella },
  { genus: 'Dracaena', words: ['dragon tree', 'joshua', 'dragonnier'], base: umbrella, leaf: ['sword', 0.5], form: { lengthDecay: 0.82 } },
  { genus: 'Malus', words: ['apple', 'pear', 'crabapple', 'pommier', 'poirier'], base: orchard, organ: ['berry', 0.2, '#c8281e', '#7a1a12'], leaf: ['ovate', 0.16] },
  { genus: 'Citrus', words: ['orange tree', 'oranger', 'citrus', 'mandarin', 'kumquat', 'agrume', 'mandarinier'], base: orchard, organ: ['berry', 0.19, '#f08a1c', '#c8601a'], leaf: ['ovate', 0.16], foliage: ['#1f4d24', '#5f9a45', '#c6de5a'] },
  { genus: 'Citrus', words: ['lemon', 'citron', 'citronnier'], base: orchard, organ: ['berry', 0.17, '#f2d12e', '#c9a51e'], leaf: ['ovate', 0.16], foliage: ['#1f4d24', '#5f9a45', '#c6de5a'] },
  { genus: 'Olea', words: ['olive', 'olivier'], base: orchard, organ: ['berry', 0.07, '#3a3528', '#221f18'], leaf: ['lanceolate', 0.16], foliage: ['#4a5f4a', '#a9b89a', '#d9e0a8'], form: { angleJitter: 0.5 } },
  { genus: 'Magnolia', words: ['magnolia', 'tulip tree', 'tulipier'], base: cherry, organ: ['tulip', 0.2, '#f3c9dc', '#e8b83a'] },
  { genus: 'Jacaranda', words: ['jacaranda', 'paulownia'], base: cherry, organ: ['blossom', 0.14, '#8f6fe0', '#f0e6a0'] },
  { genus: 'Cornus', words: ['dogwood', 'redbud', 'hawthorn', 'cornouiller', 'aubepine'], base: cherry, organ: ['star', 0.14, '#f6f3ea', '#c9d24a'] },
  { genus: 'Acacia', words: ['mimosa'], base: orchard, organ: ['pompom', 0.1, '#f5d223', '#e0a81a'], leaf: ['lanceolate', 0.13] },
  { genus: 'Plumeria', words: ['frangipani', 'plumeria', 'frangipanier'], base: orchard, organ: ['star', 0.17, '#f8f4e6', '#f2c63a'], leaf: ['lanceolate', 0.2] },
  { genus: 'Wisteria', words: ['wisteria', 'laburnum', 'glycine', 'cytise'], base: cascade, organ: ['bell', 0.1, '#9a7fe0', '#6a4fb0'], mood: 'dawn' },
  { genus: 'Salix', words: ['willow', 'saule'], hints: ['weeping', 'drooping', 'cascade', 'cascading', 'pendulous', 'pleureur'], base: willow },
  { genus: 'Pinus', words: ['pine', 'redwood', 'sequoia', 'larch', 'cedar', 'yew', 'pin', 'meleze', 'cedre'], hints: ['conifer', 'evergreen', 'conifere'], base: pine },
  { genus: 'Picea', words: ['spruce', 'fir', 'sapin', 'epicea'], hints: ['christmas', 'noel'], base: pine, grammar: { tropismGravity: 0.14 }, foliage: ['#0f2f26', '#3f7a58', '#a6c96a'] },
  { genus: 'Agave', words: ['agave', 'aloe', 'yucca', 'bromeliad', 'pineapple', 'ananas'], hints: ['succulent', 'rosette', 'succulente'], base: agave },
  { genus: 'Carnegiea', words: ['cactus', 'saguaro', 'cierge'], hints: ['desert'], base: cactus, organ: ['poppy', 0.16, '#f6f1e4', '#f0c63a'] },
  { genus: 'Corallodendron', words: ['coral', 'reef', 'fungus', 'mushroom', 'corail', 'recif', 'champignon'], hints: ['alien', 'bioluminescent', 'crystal', 'abyss', 'nebula', 'cristal', 'nebuleuse'], base: coral },
  { genus: 'Ilex', words: ['holly', 'currant', 'rowan', 'houx', 'groseillier', 'sorbier'], hints: ['berry', 'baie'], base: HERB_HABITS.shrub, organ: ['berry', 0.1, '#c8201e', '#7a1412'], bark: wood, leaf: ['lobed', 0.16] },
  { genus: 'Vaccinium', words: ['blueberry', 'blackberry', 'myrtille', 'mure'], base: HERB_HABITS.shrub, organ: ['berry', 0.1, '#3f4fa8', '#22285a'], bark: wood },
  { genus: 'Camellia', words: ['tea', 'bramble', 'ronce'], hints: ['bush', 'shrub', 'hedge', 'thicket', 'buisson', 'arbuste', 'haie'], base: bush },
  { genus: 'Dryopteris', words: ['fern', 'bracken', 'moss', 'fougere', 'mousse'], hints: ['frond', 'undergrowth'], base: fern },
  { genus: 'Phoenix', words: ['palm', 'coconut', 'cycad', 'date', 'palmier', 'cocotier', 'dattier'], hints: ['tropical', 'island', 'oasis'], base: palm },
  { genus: 'Phyllostachys', words: ['bamboo', 'reed', 'papyrus', 'wheat', 'bambou', 'roseau', 'ble'], hints: ['grass', 'cane', 'stalk', 'herbe'], base: bamboo },
];

export const TREE_HINTS: readonly Variety[] = TREES.flatMap((tree) => (tree.hints ? [{ ...tree, words: tree.hints }] : []));
