document.addEventListener("DOMContentLoaded", function() {
  const track = document.querySelector(".carousel-track");
  const originalSlides = Array.from(track.children);
  const dotsNav = document.querySelector(".carousel-dots");
  const dots = Array.from(dotsNav.children);
  let currentIndex = originalSlides.length + 2;
  let slidesPerView = window.innerWidth <= 800 ? 1 : 3;
  let startX = 0;
  let isDragging = false;

  originalSlides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  originalSlides.slice(-slidesPerView).forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.insertBefore(clone, track.firstChild);
  });

  const allSlides = Array.from(track.children);

  function updateSlidePosition() {
    slidesPerView = window.innerWidth <= 800 ? 1 : 3;
    const slideWidth = (100 / slidesPerView) * (90 / 100);
    allSlides.forEach((slide) => {
      slide.style.flex = `0 0 ${slideWidth}%`;
    });
    const offset = -slideWidth * currentIndex;
    track.style.transform = `translateX(${offset}%)`;
  }

  function moveToSlide(index) {
    currentIndex = index;
    track.style.transition = "transform 0.5s ease";
    updateSlidePosition();
    updateDots();
  }

  function updateDots() {
    const actualIndex = ((currentIndex - originalSlides.length) % originalSlides.length + originalSlides.length) % originalSlides.length;
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === actualIndex);
    });
  }

  track.addEventListener("click", (e) => {
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = rect.width;
    if (clickX < trackWidth / 2) {
      moveToSlide(currentIndex - 1);
    } else {
      moveToSlide(currentIndex + 1);
    }
  });

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    track.style.transition = "none";
  });

  track.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    const slideWidth = track.clientWidth / slidesPerView;
    const offset = -slideWidth * currentIndex - diff;
    track.style.transform = `translateX(${offset}px)`;
  });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        moveToSlide(currentIndex + 1);
      } else {
        moveToSlide(currentIndex - 1);
      }
    } else {
      moveToSlide(currentIndex);
    }
    isDragging = false;
  });

  track.addEventListener("transitionend", () => {
    if (currentIndex + 1 >= originalSlides.length * 2) {
      track.style.transition = "none";
      currentIndex = originalSlides.length;
      updateSlidePosition();
      requestAnimationFrame(() => {
        track.style.transition = "transform 0.5s ease";
      });
    } else if (currentIndex < originalSlides.length) {
      track.style.transition = "none";
      currentIndex = originalSlides.length * 2 - slidesPerView;
      updateSlidePosition();
      requestAnimationFrame(() => {
        track.style.transition = "transform 0.5s ease";
      });
    }
  });

  function autoPlay() {
    moveToSlide(currentIndex + 1);
  }

  let autoPlayInterval = setInterval(autoPlay, 2000);

  track.addEventListener("mouseenter", () => clearInterval(autoPlayInterval));
  track.addEventListener("mouseleave", () => (autoPlayInterval = setInterval(autoPlay, 2000)));

  dotsNav.addEventListener("click", (e) => {
    const targetDot = e.target.closest(".carousel-dot");
    if (!targetDot) return;
    const targetIndex = dots.indexOf(targetDot);
    moveToSlide(targetIndex + originalSlides.length);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newSlidesPerView = window.innerWidth <= 800 ? 1 : 3;
      if (newSlidesPerView !== slidesPerView) {
        location.reload();
      }
      updateSlidePosition();
    }, 250);
  });

  updateSlidePosition();
});
