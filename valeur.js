const form = document.getElementById("valueForm");
const frCityEl = document.getElementById("frCity");
const tnCityEl = document.getElementById("tnCity");
const itemTypeEl = document.getElementById("itemType");
const brandEl = document.getElementById("brand");
const valueEl = document.getElementById("declaredValue");
const statusEl = document.getElementById("valueStatus");
const resultEl = document.getElementById("valueResult");

const rRoute = document.getElementById("rRoute");
const rDistance = document.getElementById("rDistance");
const rTime = document.getElementById("rTime");
const rDistanceCost = document.getElementById("rDistanceCost");
const rCustoms = document.getElementById("rCustoms");
const rTotal = document.getElementById("rTotal");

const TUNIS = { lat: 36.8065, lon: 10.1815 };
const ROAD_FACTOR = 1.27;
const AVG_SPEED = 78;
const DEFAULT_TN_CITY_KM = 120;

const TN_CITY_KM_FROM_TUNIS = {
  tunis: 0,
  ariana: 8,
  benarous: 10,
  ben_arous: 10,
  manouba: 12,
  zaghouan: 60,
  nabeul: 70,
  hammamet: 85,
  korba: 95,
  kelibia: 110,
  soliman: 45,
  grombalia: 55,
  beja: 105,
  jendouba: 155,
  tabarka: 175,
  ain_draham: 165,
  siliana: 130,
  kef: 175,
  le_kef: 175,
  kasserine: 285,
  sidi_bouzid: 280,
  sousse: 145,
  monastir: 170,
  moknine: 185,
  ksar_hellal: 190,
  jemmel: 180,
  mahdia: 210,
  el_jem: 220,
  sfax: 275,
  sakiet_ezzit: 280,
  kairouan: 155,
  gabes: 405,
  medenine: 500,
  zarzis: 535,
  djerba: 515,
  tozeur: 455,
  nefta: 470,
  gafsa: 355,
  metlaoui: 370,
  kebili: 435,
  douz: 470,
  tataouine: 560,
  remada: 650,
  bizerte: 65,
  mateur: 75,
  ras_jebel: 85,
  la_marsa: 18,
  carthage: 15,
  el_menzah: 12,
  rades: 18,
  ksar_ghilane: 520,
};

function setStatus(msg, error = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", error);
}

function normalizeKey(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, " ")
    .trim()
    .replace(/\s+/g, "_");
}

function toMoney(n) {
  return `${n.toFixed(2)} EUR`;
}

function toKm(n) {
  return `${Math.round(n)} km`;
}

function toDuration(hoursFloat) {
  const mins = Math.round(hoursFloat * 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}`;
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

async function findFrenchCity(cityName) {
  const url = new URL("https://geo.api.gouv.fr/communes");
  url.searchParams.set("nom", cityName);
  url.searchParams.set("fields", "nom,centre");
  url.searchParams.set("boost", "population");
  url.searchParams.set("limit", "5");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Service des villes indisponible.");

  const data = await res.json();
  const valid = data.filter((x) => x?.centre?.coordinates?.length === 2);
  if (!valid.length) throw new Error("Ville France introuvable. Verifiez l'orthographe.");
  return valid[0];
}

function distanceRatePerKm(km) {
  if (km <= 1300) return 0.16;
  if (km <= 1650) return 0.21;
  return 0.26;
}

function customsRate(value, itemType, brand) {
  let rate = 0;
  if (value <= 80) rate = 0;
  else if (value <= 300) rate = 0.08;
  else if (value <= 1000) rate = 0.13;
  else rate = 0.19;

  if (["sac", "chaussure"].includes(itemType)) rate += 0.02;
  if (brand && brand.trim().length > 1) rate += 0.05;

  return rate;
}

function computeTotal(params) {
  const { totalKm, declaredValue, itemType, brand } = params;
  const rateKm = distanceRatePerKm(totalKm);
  const distanceCost = totalKm * rateKm;

  const timeHours = totalKm / AVG_SPEED;
  const timeCost = timeHours * 3.5;

  const serviceValue = declaredValue * 0.08;
  const customs = declaredValue * customsRate(declaredValue, itemType, brand);

  const total = distanceCost + timeCost + serviceValue + customs;

  return { rateKm, distanceCost, timeHours, timeCost, serviceValue, customs, total };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const frCity = frCityEl.value.trim();
  const tnCityRaw = tnCityEl.value.trim();
  const tnCity = normalizeKey(tnCityRaw);
  const tnCityLabel = tnCityRaw;
  const itemType = itemTypeEl.value;
  const brand = brandEl.value.trim();
  const declaredValue = Number(valueEl.value);

  if (!frCity) {
    setStatus("Entrez la ville de depart en France.", true);
    return;
  }

  if (!tnCityRaw) {
    setStatus("Entrez la ville d'arrivee en Tunisie.", true);
    return;
  }

  if (!Number.isFinite(declaredValue) || declaredValue <= 0) {
    setStatus("Entrez une valeur declaree valide.", true);
    return;
  }

  setStatus("Calcul en cours...");

  try {
    const cityData = await findFrenchCity(frCity);
    const [lon, lat] = cityData.centre.coordinates;

    const kmFranceToTunis = haversineKm(lat, lon, TUNIS.lat, TUNIS.lon) * ROAD_FACTOR;
    const kmInsideTunisia = TN_CITY_KM_FROM_TUNIS[tnCity] ?? DEFAULT_TN_CITY_KM;
    const totalKm = kmFranceToTunis + kmInsideTunisia;

    const q = computeTotal({ totalKm, declaredValue, itemType, brand });

    rRoute.textContent = `${cityData.nom} (France) -> ${tnCityLabel} (Tunisie)`;
    rDistance.textContent = toKm(totalKm);
    rTime.textContent = `${toDuration(q.timeHours)} (estime)`;
    rDistanceCost.textContent = `${toMoney(q.distanceCost)} (${toMoney(q.rateKm)}/km)`;
    rCustoms.textContent = toMoney(q.customs);
    rTotal.textContent = toMoney(q.total);

    resultEl.hidden = false;
    if (TN_CITY_KM_FROM_TUNIS[tnCity] == null) {
      setStatus("Ville Tunisie non repertoriee: estimation interieure standard appliquee.");
    } else {
      setStatus("Estimation terminee.");
    }
  } catch (err) {
    resultEl.hidden = true;
    setStatus(err.message || "Erreur inconnue.", true);
  }
});

setStatus("Pret. Entrez ville France + ville Tunisie + valeur objet.");
