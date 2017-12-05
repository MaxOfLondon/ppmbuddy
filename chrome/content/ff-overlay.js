ppmbuddy.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ ppmbuddy.showFirefoxContextMenu(e); }, false);
};

ppmbuddy.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-ppmbuddy").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { ppmbuddy.onFirefoxLoad(); }, false);
