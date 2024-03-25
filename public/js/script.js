export {applyTheme, setCookie, getCookie};

//Dark mode toggle
async function applyTheme() {
  // Check for saved theme preference on page load
  const savedTheme = getCookie("theme");
  if (savedTheme) {
    $('#theme-style').attr('href', savedTheme);
  }

  $('#dark-mode-btn').click(function() {
    toggleDarkMode();
  });

  function toggleDarkMode() {
    const themeStyle = $('#theme-style');
    const currentTheme = themeStyle.attr('href');
    const darkTheme = '../css/darkstyle.css';
    const lightTheme = '../css/style.css';

    // Switch between themes
    const newTheme = currentTheme === lightTheme ? darkTheme : lightTheme;
    themeStyle.attr('href', newTheme);

    // Save theme preference in a cookie
    setCookie("theme", newTheme, 365); // Cookie expires in a year
  }
}

//Cookies
function setCookie(name, value, daysToLive){
  const date = new Date();
  date.setTime(date.getTime()+ (daysToLive * 24 * 60 * 60 * 10000));
  let expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/`
}
function getCookie(name) {
  const cDecoded = decodeURIComponent(document.cookie);
  const cArray = cDecoded.split(";");
  
  for (let element of cArray) {
    const cookie = element.trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

