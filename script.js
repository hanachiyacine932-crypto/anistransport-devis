const quoteForm = document.getElementById("quoteForm");
const cityInput = document.getElementById("cityInput");
const kgInput = document.getElementById("kgInput");
const priceKgInput = document.getElementById("priceKgInput");
const fuelPriceInput = document.getElementById("fuelPriceInput");
const consumptionInput = document.getElementById("consumptionInput");
const speedInput = document.getElementById("speedInput");
const statusEl = document.getElementById("status");
const resultPanel = document.getElementById("resultPanel");

const resultCity = document.getElementById("resultCity");
const resultDistance = document.getElementById("resultDistance");
const resultDuration = document.getElementById("resultDuration");
const resultWeightCost = document.getElementById("resultWeightCost");
const resultFuelCost = document.getElementById("resultFuelCost");
const resultTotal = document.getElementById("resultTotal");

const STORAGE_KEY = "transport-calculator-v1";

const PARIS = {
  lat: 48.8566,
  lon: 2.3522,
};

const ROAD_FACTOR = 1.23;

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", isError);
}

function toNumber(value) {
  return Number(String(value).replace(",", "."));
}

function formatMoney(value) {
  return `${value.toFixed(2)} EUR`;
}

function formatKm(value) {
  return `${value.toFixed(0)} km`;
}

function formatDuration(hoursFloat) {
  const totalMinutes = Math.max(0, Math.round(hoursFloat * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}`;
}

function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function saveSettings() {
  const payload = {
    priceKg: toNumber(priceKgInput.value),
    fuelPrice: toNumber(fuelPriceInput.value),
    consumption: toNumber(consumptionInput.value),
    speed: toNumber(speedInput.value),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Number.isFinite(parsed.priceKg)) priceKgInput.value = parsed.priceKg;
    if (Number.isFinite(parsed.fuelPrice)) fuelPriceInput.value = parsed.fuelPrice;
    if (Number.isFinite(parsed.consumption)) consumptionInput.value = parsed.consumption;
    if (Number.isFinite(parsed.speed)) speedInput.value = parsed.speed;
  } catch (_err) {
    // Ignore invalid local data.
  }
}

async function findFrenchCityByName(name) {
  const url = new URL("https://geo.api.gouv.fr/communes");
  url.searchParams.set("nom", name);
  url.searchParams.set("fields", "nom,centre,population,codesPostaux");
  url.searchParams.set("boost", "population");
  url.searchParams.set("limit", "5");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Service ville indisponible pour le moment.");
  }

  const data = await response.json();
  const valid = data.filter((item) => item?.centre?.coordinates?.length === 2);
  if (!valid.length) {
    throw new Error("Ville introuvable. Verifiez l'orthographe.");
  }

  return valid[0];
}

function computeQuote(input) {
  const { kg, roadKm, priceKg, fuelPrice, consumption, speed } = input;

  const weightCost = kg * priceKg;
  const liters = (roadKm * consumption) / 100;
  const fuelCost = liters * fuelPrice;
  const durationHours = roadKm / speed;
  const total = weightCost + fuelCost;

  return {
    weightCost,
    fuelCost,
    total,
    durationHours,
  };
}

function showResult(payload) {
  resultCity.textContent = `${payload.cityName} (${payload.postalCode || "CP N/A"})`;
  resultDistance.textContent = formatKm(payload.roadKm);
  resultDuration.textContent = formatDuration(payload.durationHours);
  resultWeightCost.textContent = formatMoney(payload.weightCost);
  resultFuelCost.textContent = formatMoney(payload.fuelCost);
  resultTotal.textContent = formatMoney(payload.total);
  resultPanel.hidden = false;
}

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  const kg = toNumber(kgInput.value);
  const priceKg = toNumber(priceKgInput.value);
  const fuelPrice = toNumber(fuelPriceInput.value);
  const consumption = toNumber(consumptionInput.value);
  const speed = toNumber(speedInput.value);

  if (!city) {
    setStatus("Entrez une ville.", true);
    return;
  }

  if (![kg, priceKg, fuelPrice, consumption, speed].every(Number.isFinite)) {
    setStatus("Verifiez les nombres saisis.", true);
    return;
  }

  if (kg <= 0 || priceKg < 0 || fuelPrice < 0 || consumption <= 0 || speed <= 0) {
    setStatus("Les valeurs doivent etre positives.", true);
    return;
  }

  setStatus("Calcul en cours...");

  try {
    const cityData = await findFrenchCityByName(city);
    const [lon, lat] = cityData.centre.coordinates;

    const directKm = haversineKm(PARIS.lat, PARIS.lon, lat, lon);
    const roadKm = directKm * ROAD_FACTOR;

    const quote = computeQuote({
      kg,
      roadKm,
      priceKg,
      fuelPrice,
      consumption,
      speed,
    });

    showResult({
      cityName: cityData.nom,
      postalCode: cityData.codesPostaux?.[0],
      roadKm,
      ...quote,
    });

    saveSettings();
    setStatus("Devis calcule avec succes.");
  } catch (err) {
    setStatus(err.message || "Erreur inconnue.", true);
    resultPanel.hidden = true;
  }
});

loadSettings();
setStatus("Pret. Entrez une ville et un poids pour calculer le tarif.");
