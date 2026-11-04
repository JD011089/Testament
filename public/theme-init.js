(function () {
  try {
    var saved = localStorage.getItem('testament_theme');
    // Daybreak (light) is default unless user explicitly chose dark
    var isDark = saved === 'dark';
    var color = isDark ? '#0D1325' : '#F6F4EF';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
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
