import { HERB_HABITS } from './herbHabits';
import { TREE_HABITS } from './treeHabits';
import type { Variety } from './varieties';

const { broadleaf, cherry, orchard, willow, cascade, pine, agave, coral, bush, fern, palm, bamboo, columnar, umbrella, bottle, birch, cactus } = TREE_HABITS;
const { shrub } = HERB_HABITS;
const wood = ['#2b2118', '#6f5a41'] as const;
const citrus = ['#1f4d24', '#5f9a45', '#c6de5a'] as const;

export const SHRUB_BASES: ReadonlySet<Variety['base']> = new Set([bush, shrub]);
export const EXOTIC_BASES: ReadonlySet<Variety['base']> = new Set([agave, cactus, coral, fern, bamboo]);
export const DEFAULT_TREE: Variety = { genus: 'Fagus', words: ['beech', 'hetre'], hints: ['broadleaf', 'deciduous', 'feuillu'], base: broadleaf, foliage: ['#2c5a26', '#7fb84a', '#c9e05a'], mood: 'studio' };
export const FLOWERING_TREE: Variety = { genus: 'Prunus', words: ['cherry', 'sakura', 'cerisier'], hints: ['blossom', 'flowering', 'orchard', 'verger'], base: cherry };

export const TREES: readonly Variety[] = [
  FLOWERING_TREE,
  DEFAULT_TREE,
  { genus: 'Quercus', words: ['oak', 'chene'], base: broadleaf, leaf: ['lobed', 0.26], foliage: ['#24481f', '#5f9a3a', '#b6d24a'], mood: 'studio' },
  { genus: 'Ulmus', words: ['elm', 'orme'], base: broadleaf, leaf: ['ovate', 0.2], grammar: { tropismGravity: -0.14 }, foliage: ['#2f5a24', '#86bf4a', '#d0e05a'], mood: 'dawn' },
  { genus: 'Fraxinus', words: ['ash', 'frene'], base: broadleaf, leaf: ['lanceolate', 0.26], foliage: ['#3a6a2a', '#9acb5a', '#d9e86a'], mood: 'studio' },
  { genus: 'Tilia', words: ['linden', 'tilleul'], base: broadleaf, leaf: ['round', 0.2], foliage: ['#33602a', '#a4d25a', '#e0ee6a'], mood: 'dawn' },
  { genus: 'Acer', words: ['maple', 'erable'], base: broadleaf, leaf: ['palmate', 0.28], foliage: ['#7a2416', '#e0622e', '#f0a03a'] },
  { genus: 'Platanus', words: ['plane', 'sycamore', 'platane'], base: broadleaf, leaf: ['palmate', 0.34], bark: ['#5f5f4e', '#c9c3a6'], foliage: ['#3f5f2f', '#8fb062', '#cfe07a'], mood: 'studio' },
  { genus: 'Aesculus', words: ['chestnut', 'marronnier', 'chataignier'], base: broadleaf, leaf: ['palmate', 0.36], foliage: ['#1f4d24', '#5f9a45', '#b6d65a'], mood: 'studio' },
  { genus: 'Juglans', words: ['walnut', 'noyer'], base: broadleaf, leaf: ['lanceolate', 0.32], foliage: ['#44581f', '#9aae4a', '#dcdc6a'] },
  { genus: 'Ginkgo', words: ['ginkgo'], base: broadleaf, leaf: ['round', 0.18], foliage: ['#5a7a1e', '#c9d24a', '#f0e85a'] },
  { genus: 'Ficus', words: ['fig', 'banyan', 'figuier'], base: broadleaf, leaf: ['round', 0.3], foliage: ['#1f4d2a', '#4f9a55', '#a6d96a'], mood: 'studio' },
  { genus: 'Betula', words: ['birch', 'bouleau'], base: birch },
  { genus: 'Populus', words: ['aspen'], base: birch, bark: ['#4a4a40', '#cfcab8'], foliage: ['#6a7a1e', '#d2d24a', '#f0e85a'] },
  { genus: 'Eucalyptus', words: ['eucalyptus', 'gum'], base: birch, leaf: ['lanceolate', 0.2], bark: ['#5f574c', '#d6d0c2'], foliage: ['#3f6a58', '#9cc4a8', '#d6e6a8'] },
  { genus: 'Populus', words: ['poplar', 'peuplier'], base: columnar },
  { genus: 'Cupressus', words: ['cypress', 'thuja', 'cypres'], base: columnar, leaf: ['needle', 0.24], foliage: ['#12352b', '#3f7a52', '#a6c96a'], mood: 'studio' },
  { genus: 'Juniperus', words: ['juniper', 'genevrier'], base: columnar, leaf: ['needle', 0.2], foliage: ['#1f3f3a', '#5f8f86', '#a6c9b0'], grammar: { stepLength: 0.24 }, mood: 'studio' },
  { genus: 'Adansonia', words: ['baobab'], base: bottle },
  { genus: 'Vachellia', words: ['acacia'], base: umbrella },
  { genus: 'Pinus', words: ['stone pine', 'pin parasol'], base: umbrella, leaf: ['needle', 0.3], foliage: ['#12352b', '#4f8f62', '#b6d96a'] },
  { genus: 'Dracaena', words: ['dragon tree', 'joshua', 'dragonnier'], base: umbrella, leaf: ['sword', 0.5], form: { lengthDecay: 0.82 } },
  { genus: 'Prunus', words: ['plum', 'prunier'], base: cherry, organ: ['blossom', 0.13, '#f6f0f2', '#e8c84a'] },
  { genus: 'Prunus', words: ['almond', 'amandier'], base: cherry, organ: ['blossom', 0.14, '#f8dfe6', '#e8b83a'] },
  { genus: 'Prunus', words: ['peach', 'apricot', 'pecher', 'abricotier'], base: cherry, organ: ['blossom', 0.14, '#f08aa8', '#e8b83a'] },
  { genus: 'Magnolia', words: ['magnolia', 'tulip tree', 'tulipier'], base: cherry, organ: ['tulip', 0.2, '#f3c9dc', '#e8b83a'] },
  { genus: 'Jacaranda', words: ['jacaranda'], base: cherry, organ: ['blossom', 0.14, '#8f6fe0', '#f0e6a0'] },
  { genus: 'Paulownia', words: ['paulownia'], base: cherry, organ: ['bell', 0.15, '#a08ae8', '#f0e6c0'], leaf: ['round', 0.2] },
  { genus: 'Cornus', words: ['dogwood', 'cornouiller'], base: cherry, organ: ['star', 0.14, '#f6f3ea', '#c9d24a'] },
  { genus: 'Cercis', words: ['redbud', 'arbre de judee'], base: cherry, organ: ['blossom', 0.12, '#d0509a', '#f0d0e0'], leaf: ['round', 0.14] },
  { genus: 'Crataegus', words: ['hawthorn', 'aubepine'], base: cherry, organ: ['blossom', 0.1, '#f6f3ea', '#e8a0a8'], leaf: ['lobed', 0.12] },
  { genus: 'Malus', words: ['apple', 'crabapple', 'pommier'], base: orchard, organ: ['berry', 0.2, '#c8281e', '#7a1a12'], leaf: ['ovate', 0.16] },
  { genus: 'Pyrus', words: ['pear', 'poirier'], base: orchard, organ: ['berry', 0.2, '#c9c23a', '#8a8a22'], leaf: ['ovate', 0.16] },
  { genus: 'Citrus', words: ['orange tree', 'oranger', 'citrus', 'agrume'], base: orchard, organ: ['berry', 0.19, '#f08a1c', '#c8601a'], leaf: ['ovate', 0.16], foliage: citrus },
  { genus: 'Citrus', words: ['mandarin', 'kumquat', 'mandarinier'], base: orchard, organ: ['berry', 0.13, '#f59a1c', '#c8701a'], leaf: ['ovate', 0.14], foliage: citrus },
  { genus: 'Citrus', words: ['lemon', 'citron', 'citronnier'], base: orchard, organ: ['berry', 0.17, '#f2d12e', '#c9a51e'], leaf: ['ovate', 0.16], foliage: citrus },
  { genus: 'Olea', words: ['olive', 'olivier'], base: orchard, organ: ['berry', 0.07, '#3a3528', '#221f18'], leaf: ['lanceolate', 0.16], foliage: ['#4a5f4a', '#a9b89a', '#d9e0a8'], form: { angleJitter: 0.5 } },
  { genus: 'Sorbus', words: ['rowan', 'sorbier'], base: orchard, organ: ['berry', 0.08, '#e0401e', '#8a2412'], leaf: ['lanceolate', 0.16] },
  { genus: 'Acacia', words: ['mimosa'], base: orchard, organ: ['berry', 0.09, '#f5d223', '#e0a81a'], leaf: ['lanceolate', 0.13] },
  { genus: 'Plumeria', words: ['frangipani', 'plumeria', 'frangipanier'], base: orchard, organ: ['star', 0.17, '#f8f4e6', '#f2c63a'], leaf: ['lanceolate', 0.2] },
  { genus: 'Wisteria', words: ['wisteria', 'glycine'], base: cascade, organ: ['bell', 0.1, '#9a7fe0', '#6a4fb0'], mood: 'dawn' },
  { genus: 'Laburnum', words: ['laburnum', 'cytise'], base: cascade, organ: ['bell', 0.1, '#f5d223', '#d0a81a'] },
  { genus: 'Salix', words: ['willow', 'saule'], hints: ['weeping', 'drooping', 'cascade', 'cascading', 'pendulous', 'pleureur'], base: willow },
  { genus: 'Pinus', words: ['pine', 'yew', 'pin'], hints: ['conifer', 'evergreen', 'conifere'], base: pine },
  { genus: 'Picea', words: ['spruce', 'fir', 'sapin', 'epicea'], hints: ['christmas', 'noel'], base: pine, grammar: { tropismGravity: 0.14 }, foliage: ['#0f2f26', '#3f7a58', '#a6c96a'] },
  { genus: 'Sequoia', words: ['redwood', 'sequoia'], base: pine, grammar: { stepLength: 0.42 }, form: { trunkRadius: 0.24 }, bark: ['#3a1f16', '#a05a3a'] },
  { genus: 'Larix', words: ['larch', 'meleze'], base: pine, grammar: { tropismGravity: 0.1 }, foliage: ['#3f6a2a', '#a6c95a', '#e0e86a'] },
  { genus: 'Cedrus', words: ['cedar', 'cedre'], base: pine, form: { lengthDecay: 0.68 }, foliage: ['#1f3f3a', '#5f9a8a', '#b0d9b0'] },
  { genus: 'Agave', words: ['agave', 'yucca'], hints: ['succulent', 'rosette', 'succulente'], base: agave },
  { genus: 'Aloe', words: ['aloe'], base: agave, leaf: ['sword', 1.5], foliage: ['#2f5f3a', '#7fbf7a', '#d0f08a'] },
  { genus: 'Ananas', words: ['pineapple', 'bromeliad', 'ananas'], base: agave, leaf: ['sword', 1.2], foliage: ['#3a5f2a', '#9ac75a', '#e0f08a'] },
  { genus: 'Carnegiea', words: ['cactus', 'saguaro', 'cierge'], hints: ['desert'], base: cactus, organ: ['poppy', 0.16, '#f6f1e4', '#f0c63a'] },
  { genus: 'Corallodendron', words: ['coral', 'reef', 'fungus', 'mushroom', 'corail', 'recif', 'champignon'], hints: ['alien', 'bioluminescent', 'crystal', 'abyss', 'nebula', 'cristal', 'nebuleuse'], base: coral },
  { genus: 'Ilex', words: ['holly', 'houx'], hints: ['berry', 'baie'], base: shrub, organ: ['berry', 0.1, '#c8201e', '#7a1412'], bark: wood, leaf: ['lobed', 0.16] },
  { genus: 'Ribes', words: ['currant', 'groseillier'], base: shrub, organ: ['berry', 0.09, '#d0203a', '#7a1422'], bark: wood, leaf: ['lobed', 0.18] },
  { genus: 'Rubus', words: ['raspberry', 'framboisier'], base: shrub, organ: ['berry', 0.1, '#d0304a', '#8a1f30'], bark: wood },
  { genus: 'Rubus', words: ['blackberry', 'bramble', 'mure', 'ronce'], base: shrub, organ: ['berry', 0.1, '#2a2040', '#15102a'], bark: wood },
  { genus: 'Vaccinium', words: ['blueberry', 'myrtille'], base: shrub, organ: ['berry', 0.1, '#3f4fa8', '#22285a'], bark: wood },
  { genus: 'Thea', words: ['tea'], hints: ['bush', 'shrub', 'hedge', 'thicket', 'buisson', 'arbuste', 'haie'], base: bush },
  { genus: 'Dryopteris', words: ['fern', 'bracken', 'moss', 'fougere', 'mousse'], hints: ['frond', 'undergrowth'], base: fern },
  { genus: 'Phoenix', words: ['palm', 'date', 'palmier', 'dattier'], hints: ['tropical', 'island', 'oasis'], base: palm },
  { genus: 'Cocos', words: ['coconut', 'cocotier'], base: palm, grammar: { stepLength: 0.6, tropismGravity: 0.7 } },
  { genus: 'Cycas', words: ['cycad'], base: palm, grammar: { stepLength: 0.3 }, form: { trunkRadius: 0.18 } },
  { genus: 'Phyllostachys', words: ['bamboo', 'bambou'], hints: ['grass', 'cane', 'stalk', 'herbe'], base: bamboo },
  { genus: 'Phragmites', words: ['reed', 'papyrus', 'roseau'], base: bamboo, grammar: { stepLength: 0.36 }, foliage: ['#4a6a2a', '#b0c96a', '#e8e88a'] },
  { genus: 'Triticum', words: ['wheat', 'ble'], base: bamboo, grammar: { stepLength: 0.3 }, bark: ['#8a7428', '#d9c05a'], foliage: ['#8a7a2a', '#d9c05a', '#f0e08a'] },
];

export const TREE_HINTS: readonly Variety[] = TREES.flatMap((tree) => (tree.hints ? [{ ...tree, words: tree.hints }] : []));
