import type { TreeViewProps } from "../lib/treeView";

type PreviewForest = TreeViewProps<{
  title: string;
  dateCreated: Date;
  randomText: string;
}>["forest"];
type PreviewNode = PreviewForest[number];
type PreviewFolder = PreviewNode & {
  isFolder: true;
  children: PreviewNode[];
};

interface FolderCandidate {
  node: PreviewFolder;
  depth: number;
  remainingChildren: number;
}

type Random = () => number;

const TOTAL_NODES = 530;
const ROOT_NODES = 12;
const MAX_DEPTH = 7;

const adjectives = [
  "atomic",
  "bent",
  "cosmic",
  "dusty",
  "electric",
  "fluffy",
  "glitchy",
  "hungry",
  "invisible",
  "jolly",
  "lopsided",
  "noisy",
  "overcooked",
  "purple",
  "sleepy",
  "suspicious",
  "velvet",
] as const;

const nouns = [
  "badger",
  "banana-protocol",
  "cabbage",
  "disco-router",
  "emergency-teapot",
  "ferret-cache",
  "ghost-service",
  "hamster-cluster",
  "laser-pickle",
  "moon-socket",
  "pancake-engine",
  "quantum-duck",
  "rubber-database",
  "sock-factory",
  "spaghetti-module",
  "turbo-snail",
  "waffle-bus",
] as const;

const fileStems = [
  "assemble-nonsense",
  "calculate-vibes",
  "complain-politely",
  "decode-potato",
  "deploy-confetti",
  "feed-gremlins",
  "ignore-reality",
  "measure-chaos",
  "normalize-bananas",
  "paint-the-cache",
  "panic-later",
  "rotate-penguin",
  "serialize-dreams",
  "summon-types",
  "validate-soup",
] as const;

const extensions = [
  "css",
  "json",
  "md",
  "sql",
  "test.ts",
  "tsx",
  "txt",
  "yaml",
] as const;

const createRandom = (seed: number): Random => {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
};

const pick = <Value>(values: readonly Value[], random: Random): Value =>
  values[Math.floor(random() * values.length)];

const createFolder = (
  id: number,
  depth: number,
  random: Random
): PreviewFolder => ({
  data: {
    title: `${pick(adjectives, random)}-${pick(nouns, random)}-${id}`,
    dateCreated: "" as any,
    randomText: `${pick(adjectives, random)} ${pick(nouns, random)}`,
  },
  isFolder: true,
  expanded: depth === 0 || random() > Math.min(0.3 + depth * 0.08, 0.8),
  checked: random() < 0.12,
  children: [],
});

const createFile = (id: number, random: Random): PreviewNode => ({
  data: {
    title: `${pick(fileStems, random)}-${id}.${pick(extensions, random)}`,
    dateCreated: new Date(),
    randomText: `${pick(adjectives, random)} ${pick(nouns, random)}`,
  },
  checked: random() < 0.12,
});

const createPreviewForest = (): PreviewForest => {
  const random = createRandom(0x5eed_cafe);
  const forest: PreviewForest = [];
  const candidates: FolderCandidate[] = [];
  let nextId = 1;

  for (let rootIndex = 0; rootIndex < ROOT_NODES; rootIndex += 1) {
    const root = createFolder(nextId, 0, random);
    forest.push(root);
    candidates.push({
      node: root,
      depth: 0,
      remainingChildren: 5 + Math.floor(random() * 8),
    });
    nextId += 1;
  }

  while (nextId <= TOTAL_NODES) {
    const candidateIndex = Math.floor(random() * candidates.length);
    const parent = candidates[candidateIndex];
    const depth = parent.depth + 1;
    const shouldCreateFolder =
      depth < MAX_DEPTH && (candidates.length < 8 || random() < 0.42);
    const folder = shouldCreateFolder
      ? createFolder(nextId, depth, random)
      : undefined;
    const node = folder ?? createFile(nextId, random);

    parent.node.children.push(node);
    parent.remainingChildren -= 1;

    if (parent.remainingChildren === 0) {
      candidates.splice(candidateIndex, 1);
    }

    if (folder) {
      candidates.push({
        node: folder,
        depth,
        remainingChildren: 2 + Math.floor(random() * 7),
      });
    }

    nextId += 1;
  }

  return forest;
};

export const previewForest = createPreviewForest();
