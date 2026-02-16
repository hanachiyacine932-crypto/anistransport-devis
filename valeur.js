const challengeGrid = document.getElementById("challengeGrid");
const scoreValue = document.getElementById("scoreValue");
const solvedValue = document.getElementById("solvedValue");
const rankValue = document.getElementById("rankValue");
const gameStatus = document.getElementById("gameStatus");
const resetGame = document.getElementById("resetGame");

const GAME_KEY = "cyberstart_game_state";

const answers = {
  c1: "flag{pas_de_panique}",
  c2: "flag{ip_185.23.44.9}",
  c3: "flag{requete_preparee}",
  c4: "flag{mfa}",
  c5: "flag{aes_256}",
};

const pointsByChallenge = {
  c1: 10,
  c2: 20,
  c3: 20,
  c4: 20,
  c5: 30,
};

function readState() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) {
      return { solved: {} };
    }

    const parsed = JSON.parse(raw);
    return {
      solved: parsed.solved || {},
    };
  } catch {
    return { solved: {} };
  }
}

function writeState(state) {
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function computeScore(solvedMap) {
  return Object.entries(solvedMap).reduce((total, [id, solved]) => {
    if (!solved) return total;
    return total + (pointsByChallenge[id] || 0);
  }, 0);
}

function rankFromScore(score) {
  if (score >= 90) return "Cyber Hero";
  if (score >= 60) return "Analyst";
  if (score >= 30) return "Apprenti SOC";
  return "Novice";
}

function render() {
  const state = readState();
  const solved = state.solved;

  const solvedCount = Object.values(solved).filter(Boolean).length;
  const score = computeScore(solved);

  scoreValue.textContent = String(score);
  solvedValue.textContent = `${solvedCount}/5`;
  rankValue.textContent = rankFromScore(score);

  const cards = [...document.querySelectorAll(".challenge-card")];
  for (const card of cards) {
    const id = card.dataset.id;
    const feedback = card.querySelector(".feedback");
    const input = card.querySelector(".flag-input");
    const button = card.querySelector(".submit-flag");

    if (solved[id]) {
      card.classList.add("completed");
      input.disabled = true;
      button.disabled = true;
      feedback.textContent = "Challenge valide.";
    }
  }
}

challengeGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".submit-flag");
  if (!btn) return;

  const card = btn.closest(".challenge-card");
  if (!card) return;

  const id = card.dataset.id;
  const input = card.querySelector(".flag-input");
  const feedback = card.querySelector(".feedback");

  const userFlag = input.value.trim().toLowerCase();
  const expected = answers[id];

  if (!userFlag) {
    feedback.textContent = "Entre un flag.";
    feedback.classList.add("error");
    return;
  }

  if (userFlag === expected) {
    const state = readState();
    state.solved[id] = true;
    writeState(state);

    feedback.textContent = `Correct. +${pointsByChallenge[id]} points`;
    feedback.classList.remove("error");
    gameStatus.textContent = "Bonne progression. Continue.";
    gameStatus.classList.remove("error");

    render();
    return;
  }

  feedback.textContent = "Incorrect. Lis l'indice et reessaie.";
  feedback.classList.add("error");
});

resetGame.addEventListener("click", () => {
  localStorage.removeItem(GAME_KEY);
  const cards = [...document.querySelectorAll(".challenge-card")];

  for (const card of cards) {
    card.classList.remove("completed");
    const input = card.querySelector(".flag-input");
    const button = card.querySelector(".submit-flag");
    const feedback = card.querySelector(".feedback");

    input.value = "";
    input.disabled = false;
    button.disabled = false;
    feedback.textContent = "";
    feedback.classList.remove("error");
  }

  gameStatus.textContent = "Progression reinitialisee.";
  gameStatus.classList.remove("error");
  render();
});

render();
