const songs = document.querySelectorAll('.song-name');

function displayCompletedSongs() {
  let allCompleted = {};

  songs.forEach(songEl => {
    band = songEl.dataset.band;
    song = songEl.dataset.song;

    if (allCompleted[band] == null) {
      allCompleted[band] = true;
    }

    const completed = getOption('completed') || false;
    if (completed) {
      songEl.classList.add('completed');
    } else {
      songEl.classList.remove('completed');
      allCompleted[band] = false;
    }

    console.log(`Band: ${band}, Song: ${song}, Completed: ${completed}`);
  });

  document.querySelectorAll('.band-name').forEach(bandEl => {
    const band = bandEl.dataset.band;
    if (allCompleted[band]) {
      bandEl.classList.add('completed');
    } else {
      bandEl.classList.remove('completed');
    }
  });
}

function resetCompletedSongs() {
  if (window.confirm('Reset all completed songs?')) {
    songs.forEach(songEl => {
      band = songEl.dataset.band;
      song = songEl.dataset.song;
      setOption('completed', false);
    });

    displayCompletedSongs();
    console.log('Reset completed songs');
  }

  closeFab();
}

function resetAllOptions() {
  if (window.confirm('Reset all song visuals (font, columns) and completed songs?')) {
    resetOptions();
    displayCompletedSongs();
    console.log('Reset all options');
  } else {
    console.log('Reset all options cancelled');
  }

  closeFab();
}
