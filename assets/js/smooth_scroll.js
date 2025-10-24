// Bind to the click of all links with a #hash in the href
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    // Prevent the default jump behavior
    e.preventDefault();

    // Get the target element by the hash
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Smooth scroll to the target element
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth' // Smooth scrolling for modern browsers
      });

      // Fallback for older browsers
      if (!('scrollBehavior' in document.documentElement.style)) {
        let scrollInterval = setInterval(() => {
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const currentPosition = window.pageYOffset;
          const distance = targetPosition - currentPosition;

          if (Math.abs(distance) < 10) {
            clearInterval(scrollInterval);
            window.scrollTo(0, targetPosition);
          } else {
            window.scrollBy(0, distance / 10);
          }
        }, 16); // ~60fps
      }
    }
  });
});
