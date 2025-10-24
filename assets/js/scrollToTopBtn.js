// Select the button
const backToTopBtn = document.getElementById("backToTopBtn");

// Show/hide the button when scrolling
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove("hidden");
    backToTopBtn.classList.add("opacity-100");
  } else {
    backToTopBtn.classList.add("hidden");
    backToTopBtn.classList.remove("opacity-100");
  }
});

// Smooth scroll to top when clicked
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
