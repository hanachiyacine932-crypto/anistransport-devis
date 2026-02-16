const trackGrid = document.getElementById("trackGrid");
const moduleProgress = document.getElementById("moduleProgress");
const quizProgress = document.getElementById("quizProgress");
const labProgress = document.getElementById("labProgress");

const lessonTitle = document.getElementById("lessonTitle");
const lessonIntro = document.getElementById("lessonIntro");
const lessonMustKnow = document.getElementById("lessonMustKnow");
const lessonChecklist = document.getElementById("lessonChecklist");
const lessonExercise = document.getElementById("lessonExercise");
const lessonStatus = document.getElementById("lessonStatus");
const markLessonDone = document.getElementById("markLessonDone");
const lessonPanel = document.getElementById("lessonPanel");
const closeLessonView = document.getElementById("closeLessonView");

const quizForm = document.getElementById("quizForm");
const quizStatus = document.getElementById("quizStatus");

const labForm = document.getElementById("labForm");
const mailCheck = document.getElementById("mailCheck");
const passwordInput = document.getElementById("passwordInput");
const labOutput = document.getElementById("labOutput");

const starterForm = document.getElementById("starterForm");
const dailyMinutes = document.getElementById("dailyMinutes");
const goalChoice = document.getElementById("goalChoice");
const starterOutput = document.getElementById("starterOutput");

const termGrid = document.getElementById("termGrid");
const termOutput = document.getElementById("termOutput");

const LESSONS_KEY = "cyberstart_lessons";
const QUIZ_KEY = "cyberstart_quiz_score";
const LAB_KEY = "cyberstart_lab_count";

const correctQuiz = { q1: "b", q2: "b", q3: "b", q4: "a" };

let currentLessonId = "step1";

const lessonCatalog = {
  step1: {
    title: "1. C'est quoi internet?",
    intro: "Internet est un reseau mondial d'ordinateurs et de serveurs qui echangent des informations.",
    mustKnow: [
      "Site web: pages affichees dans un navigateur.",
      "Application: logiciel qui execute une tache precise.",
      "Serveur: machine qui repond aux demandes des utilisateurs.",
      "Compte: identite numerique protegee par authentification.",
      "Donnee: information personnelle ou professionnelle a proteger.",
    ],
    checklist: [
      "Savoir la difference entre site, application et serveur.",
      "Comprendre que chaque compte est une porte d'entree potentielle.",
      "Identifier les donnees sensibles que tu utilises chaque jour.",
    ],
    exercise: "Ecris 3 exemples de donnees sensibles et indique ou elles sont stockees (email, cloud, appareil).",
  },
  step2: {
    title: "2. C'est quoi un risque?",
    intro: "Un risque combine une menace, une faiblesse et un impact potentiel.",
    mustKnow: [
      "Menace: ce qui peut causer un dommage (phishing, malware, erreur).",
      "Vulnerabilite: faiblesse exploitable (mot de passe faible, retard de mise a jour).",
      "Impact: consequence sur activite, argent, reputation, disponibilite.",
      "Probabilite: chance que le probleme arrive reellement.",
      "Priorite: traiter d'abord les risques critiques.",
    ],
    checklist: [
      "Lister 5 risques numeriques personnels.",
      "Classer ces risques en faible/moyen/fort impact.",
      "Choisir une action de reduction pour chaque risque fort.",
    ],
    exercise: "Construis un mini tableau: risque, impact, action immediate.",
  },
  step3: {
    title: "3. Mots de passe solides",
    intro: "Un mot de passe solide est long, unique et protege par MFA.",
    mustKnow: [
      "Minimum 12 caracteres avec divers types de caracteres.",
      "Jamais reutiliser le meme mot de passe sur plusieurs services.",
      "MFA (2FA) ajoute une verification supplementaire.",
      "Gestionnaire de mots de passe = solution pratique et securisee.",
      "Changer en urgence un mot de passe soupconne compromis.",
    ],
    checklist: [
      "Activer MFA sur email principal.",
      "Remplacer au moins 3 mots de passe reutilises.",
      "Installer ou choisir un gestionnaire de mots de passe.",
    ],
    exercise: "Cree une politique perso: regle de creation + frequence de verification.",
  },
  step4: {
    title: "4. Reconnaitre le phishing",
    intro: "Le phishing manipule l'urgence pour voler tes identifiants ou ton argent.",
    mustKnow: [
      "Signaux: urgence, peur, promesse trop belle, faute de langue.",
      "Verifier le domaine complet du lien avant de cliquer.",
      "Ne jamais envoyer mot de passe ou code MFA par message.",
      "Verifier via canal officiel (site direct, numero officiel).",
      "Signaler les tentatives suspectes rapidement.",
    ],
    checklist: [
      "Appliquer la regle des 20 secondes avant tout clic.",
      "Comparer l'expediteur visible et l'adresse reelle.",
      "Verifier si la demande est coherente avec ton contexte.",
    ],
    exercise: "Prends 2 emails reels et indique lesquels sont potentiellement suspects et pourquoi.",
  },
  step5: {
    title: "5. Bases reseau",
    intro: "Comprendre le reseau aide a comprendre comment circulent les donnees et ou les proteger.",
    mustKnow: [
      "IP: adresse d'un appareil sur un reseau.",
      "DNS: traducteur entre nom de site et adresse IP.",
      "Routeur: equipement qui dirige le trafic internet.",
      "HTTPS: chiffrement des echanges web.",
      "VPN: tunnel chiffre utile surtout sur reseaux non fiables.",
    ],
    checklist: [
      "Savoir expliquer IP, DNS et HTTPS en une phrase chacun.",
      "Verifier que tes comptes sensibles passent en HTTPS.",
      "Eviter les operations bancaires sur wifi public non protege.",
    ],
    exercise: "Dessine un schema simple: appareil -> routeur -> DNS -> serveur web.",
  },
  step6: {
    title: "6. Bases codage",
    intro: "Coder permet d'automatiser, verifier, et securiser des processus.",
    mustKnow: [
      "Variable: stocke une valeur (texte, nombre).",
      "Condition: permet une decision (if/else).",
      "Fonction: bloc reutilisable de logique.",
      "Boucle: repete une action.",
      "Validation d'entree: verifier les donnees utilisateur.",
    ],
    checklist: [
      "Ecrire une fonction simple qui valide une entree.",
      "Lire un message d'erreur sans paniquer.",
      "Documenter en commentaire ce que fait ton script.",
    ],
    exercise: "Code un verificateur de mot de passe (longueur + chiffre + symbole).",
  },
  step7: {
    title: "7. Securite web",
    intro: "Les applications web sont ciblees; il faut connaitre les failles classiques et leurs defenses.",
    mustKnow: [
      "XSS: injection script dans une page; protection = echappement + CSP.",
      "SQL injection: manipulation de requete; protection = requetes preparees.",
      "CSRF: action non voulue via session; protection = token anti-CSRF.",
      "Cookie/session: proteger par HttpOnly, Secure, SameSite.",
      "Controle d'acces: verifier les droits sur chaque action.",
    ],
    checklist: [
      "Associer chaque faille a sa contre-mesure.",
      "Verifier la validation d'entree cote serveur.",
      "Controler les permissions sur chaque endpoint.",
    ],
    exercise: "Pour XSS, SQLi, CSRF: ecris 1 phrase 'risque + protection'.",
  },
  step8: {
    title: "8. Logs et alertes",
    intro: "Les logs racontent ce qui se passe; ils sont essentiels pour detecter un incident.",
    mustKnow: [
      "Log: trace d'un evenement systeme ou applicatif.",
      "IOC: indicateur de compromission (IP, hash, comportement).",
      "Alerte: signal d'activite anormale a investiguer.",
      "Correlation: relier plusieurs evenements pour comprendre un scenario.",
      "Triage: prioriser ce qui doit etre traite tout de suite.",
    ],
    checklist: [
      "Identifier 3 logs importants: auth, systeme, application.",
      "Distinguer faux positif et vrai risque.",
      "Savoir quelle alerte escalader immediatement.",
    ],
    exercise: "Analyse 5 lignes de logs et note ce qui parait anormal.",
  },
  step9: {
    title: "9. Incident: que faire?",
    intro: "En incident, il faut agir vite avec methode pour limiter les degats.",
    mustKnow: [
      "Detection: confirmer qu'il y a un incident.",
      "Containment: isoler le systeme touche.",
      "Eradication: retirer la cause (malware, acces abuse).",
      "Recovery: remettre en service de maniere controlee.",
      "Post-mortem: tirer des lecons et corriger durablement.",
    ],
    checklist: [
      "Avoir un contact d'escalade clair.",
      "Conserver preuves et horodatages.",
      "Ne pas supprimer des traces utiles a l'enquete.",
    ],
    exercise: "Redige une fiche incident en 6 lignes: quoi, quand, impact, action, statut, suite.",
  },
  step10: {
    title: "10. Suite de carriere",
    intro: "La cybersecurite offre plusieurs chemins; avance avec projets concrets et progression continue.",
    mustKnow: [
      "SOC analyste: surveillance et reponse initiale.",
      "Blue team: defense, hardening, detection.",
      "Pentest legal: tests autorises pour trouver des failles.",
      "GRC: gouvernance, risque, conformite.",
      "Cloud security: IAM, config, monitoring, securite des workloads.",
    ],
    checklist: [
      "Choisir une voie principale pour 3 mois.",
      "Construire 3 mini-projets documentes.",
      "Preparer CV cyber avec competences prouvables.",
    ],
    exercise: "Ecris ton plan 30/60/90 jours: competences, projets, preuves de progression.",
  },
};

const glossary = {
  phishing: "Phishing: faux message qui essaie de te voler des infos (mot de passe, carte, code).",
  mfa: "MFA: double verification (mot de passe + code sur telephone).",
  hash: "Hash: empreinte irreversible d'un texte. Sert souvent pour verifier un mot de passe.",
  chiffrement: "Chiffrement: rendre une information illisible sans la bonne cle.",
  vpn: "VPN: tunnel securise entre ton appareil et internet.",
  firewall: "Pare-feu: filtre les connexions autorisees ou bloquees.",
  xss: "XSS: injection de script dans une page web. Protection: valider/echapper les donnees.",
  sqli: "SQL injection: injection dans une requete base de donnees. Protection: requetes preparees.",
};

function getStoreJSON(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStoreJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderLessonState() {
  const current = getStoreJSON(LESSONS_KEY, {});
  const cards = [...document.querySelectorAll(".track-card")];
  let done = 0;

  for (const card of cards) {
    const id = card.dataset.track;
    const button = card.querySelector(".toggle-lesson");
    const isDone = Boolean(current[id]);
    card.classList.toggle("completed", isDone);
    button.textContent = "Voir la lecon";
    if (isDone) done += 1;
  }

  moduleProgress.textContent = `${done}/${cards.length}`;
}

function setList(node, items) {
  node.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
  }
}

function renderLesson(lessonId) {
  const lesson = lessonCatalog[lessonId];
  if (!lesson) return;

  currentLessonId = lessonId;
  lessonTitle.textContent = lesson.title;
  lessonIntro.textContent = lesson.intro;
  setList(lessonMustKnow, lesson.mustKnow);
  setList(lessonChecklist, lesson.checklist);
  lessonExercise.textContent = lesson.exercise;

  const state = getStoreJSON(LESSONS_KEY, {});
  const isDone = Boolean(state[lessonId]);
  markLessonDone.textContent = isDone ? "Retirer cette lecon de mes acquis" : "Marquer cette lecon comme apprise";
  lessonStatus.textContent = isDone ? "Lecon deja marquee comme acquise." : "Lis la lecon puis marque-la comme apprise.";
  lessonStatus.classList.remove("error");
}

function openLessonView(lessonId) {
  renderLesson(lessonId);
  lessonPanel.hidden = false;
  document.body.classList.add("lesson-open");
}

function closeLessonPanel() {
  lessonPanel.hidden = true;
  document.body.classList.remove("lesson-open");
}

function renderQuizScore() {
  const score = Number(localStorage.getItem(QUIZ_KEY) || 0);
  quizProgress.textContent = `${score}%`;
}

function renderLabCount() {
  const count = Number(localStorage.getItem(LAB_KEY) || 0);
  labProgress.textContent = String(count);
}

trackGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".toggle-lesson");
  if (!btn) return;

  const card = btn.closest(".track-card");
  if (!card) return;

  openLessonView(card.dataset.track);
});

markLessonDone.addEventListener("click", () => {
  const state = getStoreJSON(LESSONS_KEY, {});
  state[currentLessonId] = !state[currentLessonId];
  setStoreJSON(LESSONS_KEY, state);

  renderLessonState();
  renderLesson(currentLessonId);
});

closeLessonView.addEventListener("click", () => {
  closeLessonPanel();
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(quizForm);
  let score = 0;
  let total = 0;

  for (const [key, expected] of Object.entries(correctQuiz)) {
    total += 1;
    if (formData.get(key) === expected) score += 1;
  }

  const percentage = Math.round((score / total) * 100);
  localStorage.setItem(QUIZ_KEY, String(percentage));
  renderQuizScore();

  if (percentage === 100) {
    quizStatus.textContent = "Parfait. Tu maitrises les bases.";
    quizStatus.classList.remove("error");
  } else if (percentage >= 50) {
    quizStatus.textContent = `Bien. Score ${score}/${total}. Revois les etapes non acquises.`;
    quizStatus.classList.remove("error");
  } else {
    quizStatus.textContent = `Score ${score}/${total}. Pas grave: reprends les modules 1 a 4.`;
    quizStatus.classList.add("error");
  }
});

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^\w\s]/.test(password)) score += 1;

  if (score <= 1) return "Faible";
  if (score <= 3) return "Moyen";
  return "Fort";
}

labForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const phishingAnswer = mailCheck.value;
  const pwd = passwordInput.value.trim();
  const strength = passwordStrength(pwd);

  if (!phishingAnswer || !pwd) {
    labOutput.textContent = "Remplis tous les champs.";
    labOutput.classList.add("error");
    return;
  }

  const okPhishing = phishingAnswer === "risk";
  const okPwd = strength !== "Faible";
  const output = [];

  output.push(okPhishing ? "Bonne detection du phishing." : "Mauvaise detection: c'est un message suspect.");
  output.push(`Niveau mot de passe: ${strength}.`);

  if (!okPwd) {
    output.push("Conseil: 12+ caracteres, majuscule, minuscule, chiffres, symbole.");
  }

  labOutput.textContent = output.join(" ");
  labOutput.classList.toggle("error", !(okPhishing && okPwd));

  const current = Number(localStorage.getItem(LAB_KEY) || 0);
  localStorage.setItem(LAB_KEY, String(current + 1));
  renderLabCount();
});

starterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const mins = Number(dailyMinutes.value);
  const goal = goalChoice.value;

  if (!mins || !goal) {
    starterOutput.textContent = "Choisis ton temps et ton objectif.";
    starterOutput.classList.add("error");
    return;
  }

  const common = [
    "1) 5 min: relire un concept en mots simples.",
    "2) 5 min: un mini quiz ou mini exercice.",
    "3) 5 min: noter ce que tu as compris.",
  ];

  if (mins === 30) {
    common.push("4) 10 min: poser 2 questions au Coach IA.");
  }

  if (mins === 60) {
    common.push("4) 20 min: pratique guidee (quiz + mini lab).", "5) 10 min: revision active.");
  }

  let focus = "";
  if (goal === "protection") focus = "Focus: phishing, mots de passe, hygiene numerique, securite mobile.";
  if (goal === "metier") focus = "Focus: reseau, logs, SOC, incident response, CV cyber debutant.";
  if (goal === "code") focus = "Focus: JS/Python basics, scripts simples, securite web et validation d'entrees.";

  starterOutput.textContent = [`Ton plan quotidien (${mins} min):`, ...common, focus].join(" ");
  starterOutput.classList.remove("error");
});

termGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".term-btn");
  if (!button) return;

  const key = button.dataset.term;
  termOutput.textContent = glossary[key] || "Terme non trouve. Pose la question au Coach IA.";
  termOutput.classList.remove("error");
});

renderLessonState();
renderQuizScore();
renderLabCount();
renderLesson("step1");
closeLessonPanel();
