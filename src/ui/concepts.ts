import katex from "katex";
import "katex/dist/katex.min.css";
import { mathConcepts, conceptCategories, type MathConcept } from "../concepts";
import { addBackToMenu } from "./uiHelpers";

export function mountConcepts(container: HTMLElement) {
  container.innerHTML = "";

  // Add back to menu button using shared function
  addBackToMenu(container);

  // Main wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "concepts-wrapper";

  // Header
  const header = document.createElement("div");
  header.className = "concepts-header";

  const title = document.createElement("h1");
  title.className = "concepts-title";
  title.textContent = "🐸 FrogMath Concepts";

  const subtitle = document.createElement("p");
  subtitle.className = "concepts-subtitle";
  subtitle.textContent =
    "Discover the mathematical principles behind frog hopping!";

  header.appendChild(title);
  header.appendChild(subtitle);
  wrapper.appendChild(header);

  // Concepts table
  const tableContainer = document.createElement("div");
  tableContainer.className = "concepts-table-container";

  const table = document.createElement("table");
  table.className = "concepts-table";

  // Table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const standardHeader = document.createElement("th");
  standardHeader.textContent = "Standard Math Concept";
  standardHeader.className =
    "concepts-table-header concepts-table-header--standard";

  const frogHeader = document.createElement("th");
  frogHeader.textContent = "FrogMath Concept";
  frogHeader.className = "concepts-table-header concepts-table-header--frog";

  headerRow.appendChild(standardHeader);
  headerRow.appendChild(frogHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement("tbody");

  // Group concepts by category
  const conceptsByCategory = groupConceptsByCategory(mathConcepts);

  Object.entries(conceptsByCategory).forEach(([category, concepts]) => {
    // Category header row
    const categoryRow = document.createElement("tr");
    categoryRow.className = "concepts-category-row";

    const categoryCell = document.createElement("td");
    categoryCell.colSpan = 2;
    categoryCell.className = "concepts-category-header";
    categoryCell.textContent =
      conceptCategories[category as keyof typeof conceptCategories];

    categoryRow.appendChild(categoryCell);
    tbody.appendChild(categoryRow);

    // Concept rows
    concepts.forEach((concept) => {
      const conceptRow = document.createElement("tr");
      conceptRow.className = "concepts-concept-row";

      // Standard math column (now first)
      const standardCell = document.createElement("td");
      standardCell.className = "concepts-cell concepts-cell--standard";
      const standardContent = createConceptContent(concept, "standard");
      standardCell.appendChild(standardContent);

      // Frog math column (now second)
      const frogCell = document.createElement("td");
      frogCell.className = "concepts-cell concepts-cell--frog";
      const frogContent = createConceptContent(concept, "frog");
      frogCell.appendChild(frogContent);

      conceptRow.appendChild(standardCell);
      conceptRow.appendChild(frogCell);
      tbody.appendChild(conceptRow);
    });
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
  wrapper.appendChild(tableContainer);

  container.appendChild(wrapper);
}

function groupConceptsByCategory(
  concepts: MathConcept[],
): Record<string, MathConcept[]> {
  return concepts.reduce(
    (acc, concept) => {
      if (!acc[concept.category]) {
        acc[concept.category] = [];
      }
      acc[concept.category].push(concept);
      return acc;
    },
    {} as Record<string, MathConcept[]>,
  );
}

function renderDescriptionWithKatex(text: string): string {
  // Replace $...$ with rendered KaTeX (non-greedy, supports multiple per line)
  return text.replace(/\$(.+?)\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { throwOnError: false });
    } catch {
      return match; // fallback to raw text if KaTeX fails
    }
  });
}

function createConceptContent(
  concept: MathConcept,
  type: "frog" | "standard",
): HTMLElement {
  const content = document.createElement("div");
  content.className = `concept-content concept-content--${type}`;

  // Title
  const title = document.createElement("h3");
  title.className = "concept-title";
  title.textContent =
    type === "frog" ? concept.frogMathName : concept.standardMathName;
  content.appendChild(title);

  // Description (with KaTeX rendering for $...$)
  const description = document.createElement("p");
  description.className = "concept-description";
  const descText =
    type === "frog"
      ? concept.frogMathDescription
      : concept.standardMathDescription;
  description.innerHTML = renderDescriptionWithKatex(descText);
  content.appendChild(description);

  // Formula (only if non-empty)
  const formulaText =
    type === "frog" ? concept.frogMathFormula : concept.standardMathFormula;
  if (formulaText && formulaText.trim() !== "") {
    const formulaContainer = document.createElement("div");
    formulaContainer.className = "concept-formula";

    const formula = document.createElement("div");
    formula.className = "formula-display";
    formula.innerHTML = renderDescriptionWithKatex(formulaText);

    formulaContainer.appendChild(formula);
    content.appendChild(formulaContainer);
  }

  return content;
}
