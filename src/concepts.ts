export interface MathConcept {
  id: string;
  frogMathName: string;
  standardMathName: string;
  frogMathDescription: string;
  standardMathDescription: string;
  frogMathFormula: string;
  standardMathFormula: string;
  category: "number-theory" | "combinatorics" | "graph-theory" | "optimization";
}

export const mathConcepts: MathConcept[] = [
  {
    id: "reachable-pads",
    frogMathName: "Reachable Lily Pads",
    standardMathName: "Arithmetic Sequences",
    frogMathDescription:
      "Which lily pads can a frog reach with a fixed hop distance?",
    standardMathDescription:
      "A sequence where each term differs from the previous by a constant value.",
    frogMathFormula:
      "\\text{Pad } i \\text{ is reachable if } i \\equiv 0 \\pmod{\\text{hop}}",
    standardMathFormula: "a_n = a_1 + (n-1)d",
    category: "number-theory",
  },
  {
    id: "gcd",
    frogMathName: "Greatest Common Hop",
    standardMathName: "Greatest Common Divisor (GCD)",
    frogMathDescription:
      "The largest hop distance that can reach all possible lily pads.",
    standardMathDescription:
      "The largest positive integer that divides two or more integers without remainder.",
    frogMathFormula:
      "\\text{GCH}(a,b) = \\text{largest hop that reaches both } a \\text{ and } b",
    standardMathFormula:
      "\\gcd(a,b) = \\max\\{d \\in \\mathbb{Z}^+ : d \\mid a \\text{ and } d \\mid b\\}",
    category: "number-theory",
  },
  {
    id: "multi-hop-reachability",
    frogMathName: "Multi-Hop Reachability",
    standardMathName: "Graph Connectivity",
    frogMathDescription:
      "Which lily pads can be reached using multiple different hop distances?",
    standardMathDescription:
      "Determining which nodes are reachable from a starting node in a graph.",
    frogMathFormula:
      "R(s,H) = \\{p : \\text{pad } p \\text{ reachable from } s \\text{ using hops } H\\}",
    standardMathFormula:
      "C(v) = \\{u \\in V : \\text{path exists from } v \\text{ to } u\\}",
    category: "graph-theory",
  },
  {
    id: "optimal-path",
    frogMathName: "Optimal Frog Path",
    standardMathName: "Shortest Path Problem",
    frogMathDescription:
      "Finding the minimum number of hops to reach a target lily pad.",
    standardMathDescription:
      "Finding the path with minimum cost between two vertices in a graph.",
    frogMathFormula:
      "\\min\\{|P| : P \\text{ is a path from start to target}\\}",
    standardMathFormula:
      "\\min\\{\\sum_{e \\in P} w(e) : P \\text{ is a path from } s \\text{ to } t\\}",
    category: "optimization",
  },
  {
    id: "hop-combinations",
    frogMathName: "Hop Combinations",
    standardMathName: "Linear Combinations",
    frogMathDescription:
      "How many different ways can a frog combine different hop distances?",
    standardMathDescription:
      "Expressing a number as a sum of multiples of given numbers.",
    frogMathFormula:
      "\\text{Target} = \\sum_{i=1}^{n} k_i \\cdot \\text{hop}_i",
    standardMathFormula:
      "b = \\sum_{i=1}^{n} x_i a_i \\text{ where } x_i \\in \\mathbb{Z}",
    category: "combinatorics",
  },
];

export const conceptCategories = {
  "number-theory": "Number Theory",
  combinatorics: "Combinatorics",
  "graph-theory": "Graph Theory",
  optimization: "Optimization",
} as const;
