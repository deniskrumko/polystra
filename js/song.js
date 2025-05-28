const COMPLETED = "completed";
const COLUMNS_COUNT = "columnsCount";
const FONT_SIZE = "fontSize";

const defaultFontSize = 20;
const defaultColumnsCount = 1;

function updateIsCompleted(completed=null, redirect=false) {
  if (completed == null) {
    completed = getOption(COMPLETED) || false;
  }

  const markCompleted = document.querySelectorAll(".mark-completed");
  markCompleted.forEach((el) => el.style.display = completed ? "none" : "inline-block" );

  const markUncompleted = document.querySelectorAll(".mark-uncompleted");
  markUncompleted.forEach((el) => el.style.display = completed ? "inline-block" : "none" );

  setOption(COMPLETED, completed);
  console.log("Set completed: " + completed);

  if (redirect) {
    window.location.href = "../../index.html";
  }
}

function resetOptions() {
  updateFontSize(0, true);
  updateColumns(0, true);
  console.log('Options reset');
}

// Update lyrics font size
function updateFontSize(step = 0, asDefault = false) {
  let fontSize = parseInt(getOption(FONT_SIZE)) || defaultFontSize;
  if (asDefault) {
    fontSize = defaultFontSize;
  }

  fontSize += step;
  if (fontSize < 10) {
    console.error("Font size is too small");
    return; // Negative font size is not possible
  }

  let lines = document.querySelectorAll(".lyrics-line");
  for (let i = 0; i < lines.length; i++) {
    lines[i].style.fontSize = fontSize + "px";
  }

  setOption(FONT_SIZE, fontSize);
  console.log("Set font size: " + fontSize + "px");
}

function updateColumns(step = 0, asDefault = false) {
  let columnsCount = parseInt(getOption(COLUMNS_COUNT)) || defaultColumnsCount;
  if (asDefault) {
    columnsCount = defaultColumnsCount;
  }

  columnsCount += step;
  if (columnsCount < 1) {
    console.error("At least one column must exist");
    return;
  }

  const original = document.getElementById("lyrics-block-original");
  const clones = document.querySelectorAll(".lyrics-block-clone");
  clones.forEach((clone) => clone.remove());

  for (let i = 1; i < columnsCount; i++) {
    const clone = original.cloneNode(true);
    clone.id = ""; // Remove id to avoid duplicates
    clone.classList.add("lyrics-block-clone");
    original.parentNode.insertBefore(clone, original.nextSibling);
  }

  setOption(COLUMNS_COUNT, columnsCount);
  console.log("Set columns count: " + columnsCount);
}


function collapseBlock(el) {
  let sibling = el.nextElementSibling;
  let isCollapsed = true;
  while (sibling && sibling.classList.contains("collapsable")) {
    if (sibling.style.display === "none") {
      sibling.style.display = "";
      isCollapsed = false;
    } else {
      sibling.style.display = "none";
      isCollapsed = true;
    }
    sibling = sibling.nextElementSibling;
  }
  if (isCollapsed) {
    el.classList.add("collapsed");
  } else {
    el.classList.remove("collapsed");
  }
}
