const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userMessage = document.getElementById("userMessage");

const BASE_PRICE_PER_KG = 4;
const KM_RATE = 0.18;
const ROUTE_DISCOUNT_FACTOR = 0.88;
const OFF_ROUTE_FACTOR = 1.18;

const FRANCE_TO_TUNIS_KM = {
  "saint-denis": 1650,
  paris: 1650,
  lyon: 1450,
  marseille: 1030,
  nice: 900,
  toulouse: 1500,
  lille: 1850,
  nantes: 1750,
  montpellier: 1200,
  bordeaux: 1800,
  strasbourg: 1750,
  grenoble: 1350,
  lemans: 1720,
  "le mans": 1720,
  meaux: 1680,
  melun: 1630,
};

const ON_ROUTE_CITIES = new Set([
  "saint-denis",
  "paris",
  "melun",
  "sens",
  "auxerre",
  "beaune",
  "lyon",
  "valence",
  "avignon",
  "aix-en-provence",
  "marseille",
  "nice",
]);

const TUNISIA_CITY_ADDON = {
  tunis: 0,
  ariana: 6,
  benarous: 8,
  manouba: 8,
  nabeul: 16,
  hammamet: 18,
  bizerte: 24,
  beja: 20,
  jendouba: 24,
  zaghouan: 18,
  siliana: 22,
  kef: 28,
  kairouan: 24,
  sousse: 22,
  monastir: 24,
  mahdia: 26,
  sfax: 32,
  sidibouzid: 28,
  gabes: 36,
  medenine: 40,
  tataouine: 48,
  tozeur: 44,
  kebili: 42,
  gafsa: 36,
};

const BRAND_KEYWORDS = ["nike", "gucci", "louis vuitton", "adidas", "dior", "chanel", "prada"];

const memory = {
  origin: "saint-denis",
  destination: "tunis",
  weightKg: null,
  declaredValue: null,
  itemType: null,
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, " ");
}

function addMsg(role, text) {
  const row = document.createElement("article");
  row.className = `chat-msg ${role}`;

  const who = document.createElement("strong");
  who.textContent = role === "assistant" ? "Assistant" : "Vous";

  const body = document.createElement("p");
  body.textContent = text;

  row.append(who, body);
  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function toMoney(value) {
  return `${value.toFixed(2)} EUR`;
}

function extractWeightKg(text) {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilos)\b/i);
  if (!m) return null;
  return Number(m[1].replace(",", "."));
}

function extractValue(text) {
  const direct = text.match(/valeur\s*(?:de|:)?\s*(\d+(?:[.,]\d+)?)/i);
  if (direct) return Number(direct[1].replace(",", "."));

  const euro = text.match(/(\d+(?:[.,]\d+)?)\s*(eur|euro|euros|€)\b/i);
  if (euro) return Number(euro[1].replace(",", "."));

  return null;
}

function hasBrand(text) {
  return BRAND_KEYWORDS.some((k) => text.includes(k));
}

function detectItemType(text) {
  if (/(sac|chaussure|nike|gucci|marque|valeur|luxe|tableau|bijou)/.test(text)) return "valeur";
  if (/(valise|bagage|colis)/.test(text)) return "standard";
  return null;
}

function listAllCities(mapObj) {
  return Object.keys(mapObj)
    .map((x) => x)
    .join(", ");
}

function extractCities(clean) {
  const franceCities = Object.keys(FRANCE_TO_TUNIS_KM);
  const tnCities = Object.keys(TUNISIA_CITY_ADDON);

  let origin = null;
  let destination = null;

  for (const c of franceCities) {
    if (clean.includes(c)) {
      origin = c;
      break;
    }
  }

  for (const c of tnCities) {
    if (clean.includes(c)) {
      destination = c;
      break;
    }
  }

  return { origin, destination };
}

function computeCustoms(value, isBrand) {
  if (!Number.isFinite(value) || value <= 0) return 0;

  let rate = 0;
  if (value <= 80) rate = 0;
  else if (value <= 300) rate = 0.07;
  else if (value <= 1000) rate = 0.12;
  else rate = 0.18;

  if (isBrand) rate += 0.05;
  return value * rate;
}

function computeQuote() {
  const origin = memory.origin;
  const destination = memory.destination;
  const weight = memory.weightKg || 0;

  const km = FRANCE_TO_TUNIS_KM[origin] || FRANCE_TO_TUNIS_KM["saint-denis"];
  const routeFactor = ON_ROUTE_CITIES.has(origin) ? ROUTE_DISCOUNT_FACTOR : OFF_ROUTE_FACTOR;
  const isValueItem = memory.itemType === "valeur";
  const baseTransport = isValueItem ? 0 : weight * BASE_PRICE_PER_KG;
  const distanceCost = km * KM_RATE;
  const cityAddon = TUNISIA_CITY_ADDON[destination] || 0;

  const declaredValue = memory.declaredValue || 0;
  const isBrandItem = isValueItem && hasBrand(normalize(latestUserText));

  const handling = isValueItem ? 12 : 0;
  const insurance = isValueItem && declaredValue > 0 ? Math.max(8, declaredValue * 0.05) : 0;
  const customs = isValueItem ? computeCustoms(declaredValue, isBrandItem) : 0;
  const valueService = isValueItem && declaredValue > 0 ? declaredValue * 0.08 : 0;

  const subtotal = (baseTransport + distanceCost) * routeFactor;
  const total = subtotal + cityAddon + handling + insurance + customs + valueService;

  const routeTxt = ON_ROUTE_CITIES.has(origin)
    ? "Ville sur votre route: reduction appliquee."
    : "Ville hors route: majoration appliquee.";

  return [
    `Voici votre estimation pro: ${toMoney(total)}`,
    `- Depart: ${origin} -> Destination: ${destination}`,
    isValueItem
      ? `- Calcul objet de valeur (sans poids): valeur declaree = ${toMoney(declaredValue)}`
      : `- Poids: ${weight.toFixed(2)} kg a ${toMoney(BASE_PRICE_PER_KG)}/kg = ${toMoney(baseTransport)}`,
    `- Distance estimee ${origin} -> Tunis: ${km} km, cout distance: ${toMoney(distanceCost)}`,
    `- Ajustement route: ${routeTxt}`,
    `- Ajustement ville Tunisie: ${toMoney(cityAddon)}`,
    isValueItem ? `- Objet de valeur: oui (emballage securise + assurance + douane)` : "- Objet de valeur: non",
    isValueItem ? `- Service valeur: ${toMoney(valueService)}` : "- Service valeur: 0.00 EUR",
    isValueItem ? `- Frais securisation: ${toMoney(handling)}` : "- Frais securisation: 0.00 EUR",
    isValueItem ? `- Assurance estimee: ${toMoney(insurance)}` : "- Assurance estimee: 0.00 EUR",
    isValueItem ? `- Douane estimee: ${toMoney(customs)}` : "- Douane estimee: 0.00 EUR",
    `- Total estime: ${toMoney(total)}`,
    "Si vous voulez, je peux maintenant vous poser 3 questions pour vous donner un devis plus precis.",
  ].join("\n");
}

let latestUserText = "";

function answer(rawText) {
  latestUserText = rawText;
  const clean = normalize(rawText);

  const { origin, destination } = extractCities(clean);
  const weight = extractWeightKg(rawText);
  const value = extractValue(rawText);
  const detectedType = detectItemType(clean);

  if (clean.includes("77")) memory.origin = "meaux";
  if (origin) memory.origin = origin;
  if (destination) memory.destination = destination;
  if (Number.isFinite(weight) && weight > 0) memory.weightKg = weight;
  if (Number.isFinite(value) && value >= 0) memory.declaredValue = value;
  if (detectedType) memory.itemType = detectedType;

  if (/\b(bonjour|salut|hello|bonsoir)\b/.test(clean)) {
    return "Bonjour et bienvenue. Je suis la pour vous accompagner de la France vers la Tunisie. Vous partez de quelle ville et avec quel poids ?";
  }

  if (/\b(ca va|comment ca va|tu vas bien)\b/.test(clean)) {
    return "Je vais bien, merci. Et vous ? Je suis pret a vous aider avec un devis clair et rapide.";
  }

  if (/\b(merci|merci beaucoup)\b/.test(clean)) {
    return "Avec plaisir. Souhaitez-vous que je calcule un devis maintenant ou que je vous explique les frais de douane ?";
  }

  if (/\b(bonne journee|au revoir|a bientot|bye)\b/.test(clean)) {
    return "Merci pour votre confiance. Bonne journee, je reste disponible quand vous voulez.";
  }

  if (/\b(pourquoi)\b/.test(clean)) {
    return "Le prix change selon le poids, la distance depuis votre ville de depart, le fait d'etre sur route ou hors route, et la douane si c'est un objet de valeur.";
  }

  if (/\b(villes de tunisie|toutes les villes|ville tunisie|tunisie villes)\b/.test(clean)) {
    return `Je prends en charge ces villes en Tunisie: ${listAllCities(TUNISIA_CITY_ADDON)}.`;
  }

  if (/\b(douane|frais douane|taxe)\b/.test(clean)) {
    return [
      "Douane estimee pour objet de valeur:",
      "- 0 a 80 EUR: 0%",
      "- 80.01 a 300 EUR: 7%",
      "- 300.01 a 1000 EUR: 12%",
      "- Au-dessus de 1000 EUR: 18%",
      "- Article de marque: +5% estime",
      "Si vous voulez, donnez la valeur de l'objet et je calcule directement.",
    ].join("\n");
  }

  if (/\b(c est quoi le prix|quel prix|combien|devis|prix)\b/.test(clean)) {
    if (memory.itemType === "valeur") {
      if (!Number.isFinite(memory.declaredValue) || memory.declaredValue <= 0) {
        return "Pour un objet de valeur, je n'ai pas besoin du poids. Donnez juste la valeur declaree (ex: 450 EUR).";
      }
      return computeQuote();
    }

    if (!memory.weightKg) {
      return "Je peux calculer le prix tout de suite. Donnez-moi juste le poids (ex: 10 kg) et votre ville de depart en France.";
    }
    return computeQuote();
  }

  if (/\b(hors route|campagne|loin)\b/.test(clean)) {
    return "Compris. Si ce n'est pas sur votre trajet principal, le prix est un peu majore. Donnez-moi la ville exacte et le poids pour un calcul precise.";
  }

  if (/\b(je veux|j ai envie|je souhaite|aider|accompagne|accompagnement)\b/.test(clean)) {
    return [
      "Bien sur, je vous accompagne avec plaisir.",
      "Pour un devis precis, repondez a ces 3 questions:",
      "1. Ville de depart en France ?",
      "2. Ville d'arrivee en Tunisie ?",
      "3. Poids en kg et si c'est un objet de valeur ou une valise ?",
    ].join("\n");
  }

  if (/\b(tunisie|france|trajet|voyage|transport|valise|sac|nike|gucci|marque)\b/.test(clean)) {
    if (memory.itemType === "valeur") {
      if (!Number.isFinite(memory.declaredValue) || memory.declaredValue <= 0) {
        return "Objet de valeur detecte. Je n'ai pas besoin du poids: indiquez seulement la valeur declaree en EUR.";
      }
      return computeQuote();
    }

    if (memory.weightKg) return computeQuote();

    return [
      "Je suis pret a calculer.",
      "Dites-moi votre ville de depart en France, votre ville en Tunisie et le poids.",
      "Exemple: 'Je pars de Lyon vers Sfax, 14 kg, sac Nike valeur 220 EUR'.",
    ].join("\n");
  }

  return "Je vous ecoute. Dites-moi simplement votre besoin, et je vous reponds de facon claire et professionnelle.";
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = userMessage.value.trim();
  if (!text) return;

  addMsg("user", text);
  addMsg("assistant", answer(text));
  userMessage.value = "";
});

addMsg(
  "assistant",
  "Bonjour et bienvenue chez anis-transport-devis. Je peux vous donner le prix selon le kilo, la distance, la route, la douane et le type d'objet. Vous partez de quelle ville ?"
);
