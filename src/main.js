import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

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

  // morph into X
  bar1.style.transform = 'translateY(8px) rotate(45deg)';
  bar2.style.opacity = '0';
  bar3.style.transform = 'translateY(-8px) rotate(-45deg)';
}

function closeMenu() {
  isOpen = false;
  mobileMenu.classList.add('translate-x-full');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  // morph back into hamburger
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


