document.addEventListener("DOMContentLoaded", () => {
    const targets = document.querySelectorAll(".scroll-lift, .scroll-lift-group");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.15, // trigger when 15% of element is visible
        rootMargin: "0px 0px -60px 0px", // trigger slightly before fully in view
      }
    );

    targets.forEach((el) => observer.observe(el));
  });