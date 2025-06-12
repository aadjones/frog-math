export function mountMenu(
  container: HTMLElement,
  onSelect: (
    mode: "single" | "multi" | "pond" | "uberhopper" | "concepts",
  ) => void,
) {
  container.innerHTML = "";

  // Main wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "menu-wrapper";

  // Math Concepts header link (absolute top-right)
  const conceptsHeaderLink = document.createElement("button");
  conceptsHeaderLink.className = "menu-header-link";
  conceptsHeaderLink.innerHTML = "📚 Math Concepts";
  conceptsHeaderLink.addEventListener("click", () => onSelect("concepts"));
  wrapper.appendChild(conceptsHeaderLink);

  // Header row (just the frog emoji, centered)
  const headerRow = document.createElement("div");
  headerRow.className = "menu-header-row";

  // Frog emoji splash
  const frog = document.createElement("div");
  frog.className = "menu-logo";
  frog.textContent = "🐸";
  headerRow.appendChild(frog);

  wrapper.appendChild(headerRow);

  // Title
  const title = document.createElement("h1");
  title.className = "menu-title";
  title.textContent = "FrogMath";
  wrapper.appendChild(title);

  // Tagline
  const tagline = document.createElement("div");
  tagline.className = "menu-tagline";
  tagline.textContent = "Leap into learning with every hop!";
  wrapper.appendChild(tagline);

  // Mode cards container
  const cards = document.createElement("div");
  cards.className = "menu-cards";

  // Single-hopper card
  const singleCard = document.createElement("button");
  singleCard.className = "menu-card menu-card--single";
  singleCard.id = "singleBtn";
  singleCard.innerHTML = `
    <div class="menu-card-icon">🟢</div>
    <div class="menu-card-title">Single‑hopper</div>
    <div class="menu-card-subtitle">Explore the river</div>
  `;
  cards.appendChild(singleCard);

  // Multi-hopper card
  const multiCard = document.createElement("button");
  multiCard.className = "menu-card menu-card--multi";
  multiCard.id = "multiBtn";
  multiCard.innerHTML = `
    <div class="menu-card-icon">🟩🟩</div>
    <div class="menu-card-title">Multi‑hopper</div>
    <div class="menu-card-subtitle">Discover your true potential</div>
  `;
  cards.appendChild(multiCard);

  // Pond card
  const pondCard = document.createElement("button");
  pondCard.className = "menu-card menu-card--pond";
  pondCard.id = "pondBtn";
  pondCard.innerHTML = `
    <div class="menu-card-icon">⭕</div>
    <div class="menu-card-title">Pond</div>
    <div class="menu-card-subtitle">Hoppin' around</div>
  `;
  cards.appendChild(pondCard);

  // Uberhopper card
  const uberhopperCard = document.createElement("button");
  uberhopperCard.className = "menu-card menu-card--uberhopper";
  uberhopperCard.id = "uberhopperBtn";
  uberhopperCard.innerHTML = `
    <div class="menu-card-icon">🔄</div>
    <div class="menu-card-title">Überhopper</div>
    <div class="menu-card-subtitle">Frogness idealized</div>
  `;
  cards.appendChild(uberhopperCard);

  wrapper.appendChild(cards);

  // Customer review / quote
  const review = document.createElement("div");
  review.className = "menu-review";
  review.innerHTML = `
    "My son Jeff never liked school until he started hopping with FrogMath. Now, he keeps muttering inscrutable things about flügenfröger."
    <span class="menu-review__author">— Helen Hashfield</span>
  `;
  wrapper.appendChild(review);

  // Add everything to the container
  container.appendChild(wrapper);

  // Wire up the buttons
  singleCard.addEventListener("click", () => onSelect("single"));
  multiCard.addEventListener("click", () => onSelect("multi"));
  pondCard.addEventListener("click", () => onSelect("pond"));
  uberhopperCard.addEventListener("click", () => onSelect("uberhopper"));
}
