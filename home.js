window.addEventListener('scroll', () => {
  document.querySelectorAll('.role-card').forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 50) {
      el.classList.add('show');
    }
  });
});

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.role-card').forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('show');
    }, i * 300);
  });
});
