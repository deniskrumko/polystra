function loadMobileFab() {
  var fab = document.getElementById("mobile-fab");
  var fabActions = document.getElementById("mobile-fab-actions");
  var fabOpen = false;

  if (fab && fabActions) {
    fab.addEventListener("click", function () {
      if (!fabOpen) {
        // Clone visible buttons from control-center
        fabActions.style.display = "flex";
        fabOpen = true;
      } else {
        fabActions.style.display = "none";
        fabOpen = false;
      }
    });
    // Hide actions when clicking outside
    document.addEventListener("click", function (e) {
      if (fabOpen && !fab.contains(e.target) && !fabActions.contains(e.target)) {
        fabActions.style.display = "none";
        fabOpen = false;
      }
    });
  }
}
