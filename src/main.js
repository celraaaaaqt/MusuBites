
import emailjs from '@emailjs/browser';
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

emailjs.init({
  publicKey: '2hSZU8pZFqSE0GL8c',
});

const menuBtn = document.getElementById('menuBtn');
const bar1 = document.getElementById('bar1');
const bar2 = document.getElementById('bar2');
const bar3 = document.getElementById('bar3');
const mobileMenu = document.getElementById('mobileMenu');

let isOpen = false;

function openMenu() {
  isOpen = true;
  mobileMenu.style.transform = '';
  mobileMenu.classList.remove('translate-x-full');
  menuBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';  

  //change into X
  bar1.style.transform = 'translateY(8px) rotate(45deg)';
  bar2.style.opacity = '0';
  bar3.style.transform = 'translateY(-8px) rotate(-45deg)';
}

function closeMenu() {
  isOpen = false;
  mobileMenu.classList.add('translate-x-full');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  //change back into hamburger
  bar1.style.transform = 'none';
  bar2.style.opacity = '1';
  bar3.style.transform = 'none';
}

menuBtn.addEventListener('click', () => {
  isOpen ? closeMenu() : openMenu();
});


document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen) closeMenu();
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

  const modal = document.querySelector("#contactModal");
  const openBtns = document.querySelectorAll("#openModal, #openModalMobile");
  const closeBtn = document.querySelector("#closeModal");


  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      // if this was opened from the mobile menu, close that too
      closeMenu();
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
  });

  const form = document.querySelector("#contactForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  emailjs
    .sendForm(
      "service_61exd4f",
      "template_urzc3hx",
      form
    )
    .then(
      () => {
        alert("Message sent successfully!");

        form.reset();

        modal.classList.add("hidden");
      },
      (error) => {
        console.error("FAILED...", error);
        alert("Failed to send message. Please try again.");
      }
    );
});