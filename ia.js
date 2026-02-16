const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userMessage = document.getElementById("userMessage");
const quickPrompts = document.getElementById("quickPrompts");
const explainMode = document.getElementById("explainMode");

const blockedPatterns = [
  "pirater",
  "hacker un compte",
  "bruteforce",
  "ddos",
  "malware",
  "ransomware",
  "voler",
  "bypass",
  "exploit",
  "cracker wifi",
  "injecter un virus",
  "stealer",
  "trojan",
  "botnet",
  "keylogger",
  "payload",
  "phishing kit",
  "contourner",
];

const topicBank = [
  {
    name: "bases cyber",
    keywords: ["cyber", "securite", "risque", "menace", "vulnerabilite", "proteger", "defense"],
    simple: "La cybersecurite, c'est proteger tes comptes, tes donnees et tes appareils contre les erreurs, les arnaques et les attaques.",
    example: "Exemple: si ton mot de passe est reutilise partout, un seul piratage peut ouvrir tous tes comptes.",
    action: "Action debutant: active MFA sur email + reseaux sociaux + banque.",
  },
  {
    name: "internet reseau",
    keywords: ["ip", "dns", "https", "internet", "routeur", "wifi", "port", "tcp", "udp", "vpn"],
    simple: "Internet, c'est un reseau mondial. IP identifie un appareil, DNS traduit un nom en IP, HTTPS protege le trafic web.",
    example: "Exemple: quand tu ecris un site, DNS trouve son adresse, puis HTTPS chiffre la connexion.",
    action: "Action debutant: evite le wifi public sans VPN pour les comptes sensibles.",
  },
  {
    name: "mots de passe",
    keywords: ["mot de passe", "password", "mfa", "2fa", "authentification", "compte"],
    simple: "Un bon mot de passe est long, unique, et accompagne d'un second facteur MFA.",
    example: "Exemple: un gestionnaire de mots de passe cree des mots differents pour chaque site.",
    action: "Action debutant: remplace 3 mots de passe reutilises aujourd'hui.",
  },
  {
    name: "phishing",
    keywords: ["phishing", "email", "sms", "arnaque", "faux lien", "piece jointe"],
    simple: "Le phishing est une arnaque qui te pousse a cliquer ou donner des infos privees.",
    example: "Exemple: 'urgence, ton compte ferme dans 5 min' + lien bizarre = tres suspect.",
    action: "Action debutant: verifie l'expediteur et le domaine avant de cliquer.",
  },
  {
    name: "linux",
    keywords: ["linux", "terminal", "bash", "chmod", "sudo", "permissions", "journalctl"],
    simple: "Linux est un systeme souvent utilise en cyber. Le terminal permet d'automatiser et d'administrer.",
    example: "Exemple: limiter les permissions d'un fichier reduit les risques d'acces non voulu.",
    action: "Action debutant: apprendre 10 commandes Linux de base et leurs usages.",
  },
  {
    name: "python",
    keywords: ["python", "script python", "boucle", "fonction", "variable", "automatiser"],
    simple: "Python est ideal pour debuter: syntaxe simple, utile pour automatiser et analyser.",
    example: "Exemple: script qui verifie la force d'un mot de passe sur plusieurs entrees.",
    action: "Action debutant: ecrire un script qui detecte des emails suspects selon des mots-cles.",
  },
  {
    name: "javascript",
    keywords: ["javascript", "js", "frontend", "node", "dom", "validation"],
    simple: "JavaScript sert a rendre les pages interactives et valider les donnees cote client.",
    example: "Exemple: verifier qu'un formulaire contient un email valide avant envoi.",
    action: "Action debutant: coder une validation de mot de passe en JS.",
  },
  {
    name: "web security",
    keywords: ["xss", "sql", "sqli", "csrf", "cookie", "session", "owasp", "injection"],
    simple: "La securite web protege les applis contre les injections, scripts malveillants et usurpation de session.",
    example: "Exemple: utiliser des requetes preparees bloque une grande partie des SQL injections.",
    action: "Action debutant: retenir XSS, SQLi, CSRF + une protection pour chaque.",
  },
  {
    name: "soc logs",
    keywords: ["soc", "log", "siem", "ioc", "alerte", "incident", "forensic"],
    simple: "Le SOC surveille les alertes et logs pour detecter des comportements anormaux rapidement.",
    example: "Exemple: 30 tentatives echouees admin depuis une IP inconnue = alerte forte.",
    action: "Action debutant: apprendre un format simple de rapport incident (quoi, quand, impact, action).",
  },
  {
    name: "cloud",
    keywords: ["cloud", "aws", "azure", "gcp", "iam", "bucket", "secret", "kubernetes"],
    simple: "En cloud, la securite commence par les droits IAM, la configuration et la surveillance.",
    example: "Exemple: un bucket public par erreur peut exposer des donnees sensibles.",
    action: "Action debutant: verifier les permissions minimales sur chaque compte cloud.",
  },
  {
    name: "carriere",
    keywords: ["metier", "job", "carriere", "soc analyste", "pentest", "grc", "cv", "entretien"],
    simple: "Tu peux entrer en cyber par plusieurs chemins: SOC, GRC, admin systeme, dev securite.",
    example: "Exemple: profil debutant SOC = reseau + logs + communication + rigueur.",
    action: "Action debutant: cree un portfolio avec mini-projets et comptes-rendus de labs.",
  },
];

const tinyDictionary = {
  hash: "Hash: empreinte irreversible pour verifier une information.",
  chiffrement: "Chiffrement: rendre les donnees illisibles sans cle.",
  encodage: "Encodage: transformer un format pour transport/compatibilite (pas une protection forte).",
  api: "API: interface qui permet a deux applications de communiquer.",
  cookie: "Cookie: petite donnee stockee par le navigateur.",
  session: "Session: etat de connexion d'un utilisateur.",
  firewall: "Pare-feu: filtre le trafic reseau entrant/sortant.",
  malware: "Malware: logiciel malveillant.",
  ransomware: "Ransomware: malware qui chiffre les fichiers contre rancon.",
  siem: "SIEM: outil central qui collecte et analyse les logs de securite.",
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function addMsg(role, text) {
  const row = document.createElement("article");
  row.className = `chat-msg ${role}`;

  const who = document.createElement("strong");
  who.textContent = role === "assistant" ? "Coach IA" : "Vous";

  const body = document.createElement("p");
  body.textContent = text;

  row.append(who, body);
  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function blockedRequest(clean) {
  return blockedPatterns.some((token) => clean.includes(token));
}

function countTopicHits(clean, topic) {
  return topic.keywords.reduce((count, keyword) => {
    if (clean.includes(keyword)) return count + 1;
    return count;
  }, 0);
}

function pickBestTopics(clean) {
  const scored = topicBank
    .map((topic) => ({ topic, score: countTopicHits(clean, topic) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 2).map((item) => item.topic);
}

function explainWord(clean) {
  const keys = Object.keys(tinyDictionary);
  for (const key of keys) {
    if (clean.includes(`c est quoi ${key}`) || clean.includes(`def ${key}`) || clean.includes(`definition ${key}`) || clean === key) {
      return tinyDictionary[key];
    }
  }
  return null;
}

function buildStylePrefix(mode) {
  if (mode === "ultra") {
    return "Mode ultra simple: ";
  }
  if (mode === "pro") {
    return "Mode technique progressif: ";
  }
  return "Mode normal: ";
}

function answerRoadmap(clean) {
  if (!clean.includes("90 jours") && !clean.includes("plan") && !clean.includes("roadmap")) {
    return null;
  }

  return [
    "Plan 90 jours pour debuter de zero:",
    "Mois 1: hygiene numerique, reseau de base, mots de passe, phishing, Linux debutant.",
    "Mois 2: Python/JS de base, securite web (XSS/SQLi/CSRF), lecture de logs.",
    "Mois 3: mini-projets, simulation incident, portfolio, revision + candidatures.",
    "Rythme: 30 a 60 min/jour, 1 revision hebdo, 1 exercice pratique/jour.",
  ].join(" ");
}

function answerExercise(clean) {
  if (!clean.includes("exercice") && !clean.includes("question reponse") && !clean.includes("fiche")) {
    return null;
  }

  if (clean.includes("python")) {
    return [
      "Exercice Python debutant:",
      "But: detecter si un mot de passe est faible.",
      "Etapes: lire une chaine, verifier longueur, verifier chiffres/symboles, afficher score.",
      "Bonus: conseiller une correction automatique.",
    ].join(" ");
  }

  if (clean.includes("javascript") || clean.includes("js")) {
    return [
      "Exercice JavaScript debutant:",
      "Creer un formulaire avec email + mot de passe.",
      "Verifier format email et robustesse mot de passe.",
      "Afficher des messages clairs a l'utilisateur.",
    ].join(" ");
  }

  if (clean.includes("20") || clean.includes("question/reponse")) {
    return [
      "Pack 20 questions debutant (version courte):",
      "1) C'est quoi phishing? 2) Pourquoi MFA? 3) C'est quoi IP? 4) C'est quoi DNS?",
      "5) Pourquoi mettre a jour? 6) C'est quoi un malware? 7) A quoi sert un pare-feu?",
      "8) C'est quoi un log? 9) C'est quoi XSS? 10) C'est quoi SQL injection?",
      "11) Pourquoi sauvegarder? 12) C'est quoi un VPN? 13) C'est quoi un hash?",
      "14) C'est quoi chiffrement? 15) C'est quoi SIEM? 16) C'est quoi IAM?",
      "17) C'est quoi moindre privilege? 18) C'est quoi incident response?",
      "19) C'est quoi SOC? 20) C'est quoi OWASP?",
      "Dis-moi 'developpe la question X' pour detail.",
    ].join(" ");
  }

  return [
    "Fiche de revision du jour:",
    "1) 5 definitions. 2) 3 exemples d'attaque. 3) 3 protections. 4) 1 mini-exercice. 5) Resume en 5 lignes.",
  ].join(" ");
}

function answerDifference(clean) {
  if (clean.includes("difference") && clean.includes("hash") && (clean.includes("chiffrement") || clean.includes("encodage"))) {
    return [
      "Difference rapide:",
      "Hash = sens unique (verification).",
      "Chiffrement = reversible avec cle (confidentialite).",
      "Encodage = changement de format (transport), pas une vraie protection.",
    ].join(" ");
  }

  return null;
}

function answerByTopics(clean, mode) {
  const topics = pickBestTopics(clean);
  if (!topics.length) {
    return [
      `${buildStylePrefix(mode)}Je peux repondre sur cyber, codage, Linux, reseau, web, cloud, SOC, carriere.`,
      "Si tu veux, ecris: 'explique [mot] comme un debutant'.",
      "Exemple: 'explique DNS tres simplement'.",
    ].join(" ");
  }

  const parts = [buildStylePrefix(mode)];
  for (const topic of topics) {
    if (mode === "ultra") {
      parts.push(topic.simple, topic.action);
      continue;
    }

    if (mode === "pro") {
      parts.push(topic.simple, topic.example, `Mini plan: ${topic.action}`);
      continue;
    }

    parts.push(topic.simple, topic.example, topic.action);
  }

  parts.push("Tu veux que je transforme ca en mini cours 10 minutes?");
  return parts.join(" ");
}

function answerQuestion(rawText) {
  const clean = normalize(rawText);
  const mode = explainMode.value;

  const glossaryAnswer = explainWord(clean);
  if (glossaryAnswer) return `${buildStylePrefix(mode)}${glossaryAnswer}`;

  const roadmapAnswer = answerRoadmap(clean);
  if (roadmapAnswer) return `${buildStylePrefix(mode)}${roadmapAnswer}`;

  const exerciseAnswer = answerExercise(clean);
  if (exerciseAnswer) return `${buildStylePrefix(mode)}${exerciseAnswer}`;

  const diffAnswer = answerDifference(clean);
  if (diffAnswer) return `${buildStylePrefix(mode)}${diffAnswer}`;

  return answerByTopics(clean, mode);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const raw = userMessage.value.trim();
  if (!raw) return;

  addMsg("user", raw);
  userMessage.value = "";

  const clean = normalize(raw);
  if (blockedRequest(clean)) {
    addMsg(
      "assistant",
      "Je ne peux pas aider pour attaquer, nuire ou contourner illegalement. Je peux t'aider en defense: prevention, detection, durcissement, et apprentissage legal pas a pas."
    );
    return;
  }

  addMsg("assistant", answerQuestion(raw));
});

quickPrompts.addEventListener("click", (event) => {
  const btn = event.target.closest(".prompt-btn");
  if (!btn) return;

  userMessage.value = btn.textContent.trim();
  chatForm.requestSubmit();
});

addMsg(
  "assistant",
  "Bienvenue. Dis simplement: 'je pars de zero', et je te guide etape par etape jusqu'a un vrai niveau pratique."
);
