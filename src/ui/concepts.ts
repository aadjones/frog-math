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

  const frogHeader = document.createElement("th");
  frogHeader.textContent = "FrogMath Concept";
  frogHeader.className = "concepts-table-header concepts-table-header--frog";

  const standardHeader = document.createElement("th");
  standardHeader.textContent = "Standard Math Concept";
  standardHeader.className =
    "concepts-table-header concepts-table-header--standard";

  headerRow.appendChild(frogHeader);
  headerRow.appendChild(standardHeader);
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

      // Frog math column
      const frogCell = document.createElement("td");
      frogCell.className = "concepts-cell concepts-cell--frog";

      const frogContent = createConceptContent(concept, "frog");
      frogCell.appendChild(frogContent);

      // Standard math column
      const standardCell = document.createElement("td");
      standardCell.className = "concepts-cell concepts-cell--standard";

      const standardContent = createConceptContent(concept, "standard");
      standardCell.appendChild(standardContent);

      conceptRow.appendChild(frogCell);
      conceptRow.appendChild(standardCell);
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

  // Description
  const description = document.createElement("p");
  description.className = "concept-description";
  description.textContent =
    type === "frog"
      ? concept.frogMathDescription
      : concept.standardMathDescription;
  content.appendChild(description);

  // Formula
  const formulaContainer = document.createElement("div");
  formulaContainer.className = "concept-formula";

  const formula = document.createElement("div");
  formula.className = "formula-display";

  try {
    const formulaText =
      type === "frog" ? concept.frogMathFormula : concept.standardMathFormula;
    formula.innerHTML = katex.renderToString(formulaText, {
      displayMode: true,
      throwOnError: false,
      errorColor: "#cc0000",
    });
  } catch (error) {
    console.error("KaTeX rendering error:", error);
    formula.textContent =
      type === "frog" ? concept.frogMathFormula : concept.standardMathFormula;
  }

  formulaContainer.appendChild(formula);
  content.appendChild(formulaContainer);

  return content;
}
