var ppmbuddy = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("ppmbuddy-strings");
  },

  onMenuItemCommand: function(e) {
        window.openDialog("chrome://ppmbuddy/content/wizard.xul", "wizard", "chrome, dialog, centerscreen, width=800,height=430", content).focus();
  },

  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    ppmbuddy.onMenuItemCommand(e);
  }
};

window.addEventListener("load", function () { ppmbuddy.onLoad(); }, false);
