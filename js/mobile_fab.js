function loadMobileFab() {
  var fab = document.getElementById("mobile-fab");
  var fabActions = document.getElementById("mobile-fab-actions");

  function isFabActionsVisible() {
    return fabActions.style.display === "flex";
  }

  if (fab && fabActions) {
    fab.addEventListener("click", function () {
      if (!isFabActionsVisible()) {
        fabActions.style.display = "flex";
      } else {
        fabActions.style.display = "none";
      }
    });

    // Hide actions when clicking outside
    document.addEventListener("click", function (e) {
      if (isFabActionsVisible() && !fab.contains(e.target) && !fabActions.contains(e.target)) {
        fabActions.style.display = "none";
      }
    });
  }
}

function closeFab() {
  var fabActions = document.getElementById("mobile-fab-actions");
  fabActions.style.display = "none";
}
