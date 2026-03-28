document.addEventListener("DOMContentLoaded", () => {
  const freqBtns = document.querySelectorAll(".freq-btn");
  const amtBtns = document.querySelectorAll(".amt-btn");
  const otherInput = document.getElementById("other-amount");
  const donateBtn = document.getElementById("donate-btn");
  const feeCheckbox = document.getElementById("check");
  const nameInput = document.querySelector(
    'input[placeholder=" Enter your name "]',
  );

  let selectedFreq = "monthly";
  let selectedAmount = 10;
  let baseAmount = 10;
  const FEE = 0.75;

  function calculateTotal() {
    let total = baseAmount;
    if (feeCheckbox.checked && selectedFreq === "monthly") {
      total += FEE;
    }
    return Math.round(total * 100) / 100;
  }

  function updateDonateText() {
    selectedAmount = calculateTotal();
    const suffix = selectedFreq === "monthly" ? "/mo" : "";
    const feeNote =
      feeCheckbox.checked && selectedFreq === "monthly"
        ? ` (+$${FEE.toFixed(2)} fee)`
        : "";
    donateBtn.textContent = `Donate now — $${selectedAmount}${feeNote}${suffix}`;
  }

  freqBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      freqBtns.forEach((b) => {
        b.classList.remove("bg-slate-800");
        b.classList.add("bg-slate-600");
      });
      btn.classList.remove("bg-slate-600");
      btn.classList.add("bg-slate-800");
      selectedFreq =
        btn.dataset.frequency === "one-time" ? "one-time" : "monthly";
      updateDonateText();
    });
  });

  amtBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      amtBtns.forEach((b) => {
        b.classList.remove("bg-slate-800", "text-white");
        b.classList.add("bg-slate-50", "text-slate-800");
      });

      btn.classList.remove("bg-slate-50", "text-slate-800");
      btn.classList.add("bg-slate-800", "text-white");

      const a = btn.dataset.amount;
      if (a === "other") {
        otherInput.classList.remove("hidden");
        otherInput.focus();
        baseAmount = otherInput.value ? Number(otherInput.value) : 0;
      } else {
        otherInput.classList.add("hidden");
        baseAmount = Number(a);
      }
      updateDonateText();
    });
  });

  otherInput.addEventListener("input", () => {
    const v = Number(otherInput.value);
    if (v > 0) baseAmount = v;
    updateDonateText();
  });

  feeCheckbox.addEventListener("change", () => {
    updateDonateText();
  });

  donateBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert("Please enter your name before donating.");
      nameInput.focus();
      return;
    }
    if (!selectedAmount || selectedAmount <= 0) {
      alert("Please choose or enter a valid donation amount.");
      return;
    }
    const freqText = selectedFreq === "monthly" ? "monthly" : "one-time";
    if (
      confirm(
        `Confirm donation of $${selectedAmount} (${freqText}) from ${name}?`,
      )
    ) {
      donateBtn.disabled = true;
      donateBtn.textContent = "Processing...";
      setTimeout(() => {
        donateBtn.textContent = "Thank you!";
        donateBtn.classList.remove("bg-blue-600");
        donateBtn.classList.add("bg-green-600");
      }, 1000);
    }
  });

  updateDonateText();
});
