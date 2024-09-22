/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
};

function flipCard() {
  const card = document.getElementById("card");
  const isFlipped = card.style.transform === "rotateY(180deg)";
  card.style.transform = isFlipped ? "rotateY(0deg)" : "rotateY(180deg)";
}
