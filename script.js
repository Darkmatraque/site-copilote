// Année dynamique dans le footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Mini logique de sub goals (test visuel)
const addSubBtn = document.getElementById("add-sub");
const subCountSpan = document.getElementById("sub-count");
const progressFill = document.getElementById("progress-fill");
const squatsTotalText = document.getElementById("squats-total");

let subCount = 0;
const subGoal = 25;

function calculateSquats(subs) {
  // Base : 5 squats par sub
  return subs * 5;
}

function updateSubUI() {
  subCountSpan.textContent = subCount;
  const ratio = Math.min(subCount / subGoal, 1);
  progressFill.style.width = (ratio * 100).toFixed(0) + "%";

  const squats = calculateSquats(subCount);
  squatsTotalText.textContent = `Total squats à faire : ${squats}`;
}

if (addSubBtn) {
  addSubBtn.addEventListener("click", () => {
    subCount++;
    updateSubUI();
  });
}

updateSubUI();
