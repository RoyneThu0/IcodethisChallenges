document.addEventListener("DOMContentLoaded", function () {
  let slides = Array.from(document.querySelectorAll(".slide"));
  let currentFirstSlideIndex = 0;

  document.querySelector(".left-0").addEventListener("click", function () {
    slides[currentFirstSlideIndex + 3].classList.add("hidden");
    if (currentFirstSlideIndex > 0) {
      slides[--currentFirstSlideIndex].classList.remove("hidden");
    } else {
      currentFirstSlideIndex = slides.length - 4;
      for (let i = 0; i < 4; i++) {
        slides[currentFirstSlideIndex + i].classList.remove("hidden");
      }
    }
  });

  document.querySelector(".right-0").addEventListener("click", function () {
    slides[currentFirstSlideIndex].classList.add("hidden");
    if (currentFirstSlideIndex < slides.length - 4) {
      slides[++currentFirstSlideIndex + 3].classList.remove("hidden");
    } else {
      currentFirstSlideIndex = 0;
      for (let i = 0; i < 4; i++) {
        slides[i].classList.remove("hidden");
      }
    }
  });
});
