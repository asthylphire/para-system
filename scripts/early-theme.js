// apply dark mode before page renders to avoid a flash
(function () {
  try {
    if (localStorage.getItem('para_dark') === 'true') {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // if storage is blocked/unavailable, render default theme
  }
})();

