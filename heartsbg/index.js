const btn = document.getElementById("startStop");

let btnStatus = "stopped";

let inter = null;

function createHeart() {
  const heart = document.createElement("img");
  heart.src = "https://pngimg.com/uploads/heart/heart_PNG51335.png";
  heart.classList.add("heart");
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 5 + 3 + "s ";
  // heart.innerText = "🦄";
  document.body.appendChild(heart);
  setTimeout(() => {
    heart.remove();
  }, 7000);
}

function startStop() {
  if (btnStatus === "stopped") {
    btn.innerHTML = "STOP";
    inter = setInterval(createHeart, 100);
    btnStatus = "started";
  } else {
    btn.innerHTML = "START";
    clearInterval(inter);
    btnStatus = "stopped";
  }
}

btn.addEventListener("click", startStop);
