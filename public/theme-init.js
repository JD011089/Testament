(function () {
  try {
    var saved = localStorage.getItem('testament_theme');
    // Daybreak (light) is default unless user explicitly chose dark
    var isDark = saved === 'dark';
    var color = isDark ? '#131722' : '#F8F1E0';
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
