(function () {
  try {
    var saved = localStorage.getItem('testament_theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var isDark = saved === 'dark' || (!saved && !prefersLight);
    var color = isDark ? '#090b0e' : '#fcfbfa';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute('content', color);
    });
  } catch (e) {}
})();
