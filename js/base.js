// Main tree to store lyrics
let lyricsTree = {};
let fontSize = 40;

// Make HTTP request
async function makeRequest(url) {
  return await fetch(url).then((response) => {
    return response.json();
  });
}

// Get lyrics of single song
async function getSongLyrics(bandName, song) {
  let songData = await makeRequest(song['url']);
  let songName = song['path'].replace('.txt', '');
  lyricsTree[bandName][songName] = songData['content'];
}

// Get all songs of single band
async function getBandSongs(band) {
  let bandName = band['path'];
  lyricsTree[bandName] = {}; // Initialize band dict

  let songs_tree = await makeRequest(band['url']);
  for (const song of songs_tree['tree']) {
    await getSongLyrics(bandName, song);
  }
}

// Build initial lyrics tree
async function buildLyricsTree() {
  let root_url = 'https://api.github.com/repos/deniskrumko/polystra/git/trees/master';
  let root_json = await makeRequest(root_url);
  let text_dir = root_json['tree'].find(function (element, index, array) {
    return element['path'] == 'lyrics';
  })

  let bands_tree = await makeRequest(text_dir['url']);
  for (const band of bands_tree['tree']) {
    await getBandSongs(band);
  }
}

// Wipe all page content
function wipeContent() {
  let content = document.getElementById('content');
  let buttons = document.getElementById('buttons');
  let info = document.getElementById('info');
  content.innerHTML = '';
  buttons.innerHTML = '';
  info.innerHTML = '';
  return content, buttons, info
}

// Add another lyrics block
function appendLyricsBlock(bandName, songName) {
  let songContent = lyricsTree[bandName][songName];
  let songLyrics = decodeURIComponent(escape(atob(songContent)));

  let lyricsParentNode = document.getElementById('lyrics-parent');
  let lyricsBlock = document.createElement('div');
  lyricsParentNode.appendChild(lyricsBlock);
  lyricsBlock.setAttribute('class', 'lyrics-block');

  for (const line of songLyrics.split('\n')) {
    if (!line) {continue;}
    let p = document.createElement('p');
    p.setAttribute('class', 'lyrics-line');
    p.appendChild(document.createTextNode(line));
    lyricsBlock.appendChild(p);

    if (line.startsWith('[')) {
      p.setAttribute('class', 'lyrics-line highlighted');
    }
  }

  let scrollPastEnd = document.createElement('div');
  lyricsBlock.appendChild(scrollPastEnd);
  scrollPastEnd.setAttribute('class', 'scroll-past-end');

  updateFontSize();
}

// Update lyrics font size
function updateFontSize(step=0) {
  fontSize += step;
  console.log(fontSize);

  let lines = document.querySelectorAll('.lyrics-line');
  for (let i = 0; i < lines.length; i ++ ) {
      console.log(i);
      lines[i].style.fontSize = fontSize + 'px';
  }
}

function buildSongPage(bandName, songName) {
  content, buttons, info = wipeContent();
  fontSize = 40;

  info.appendChild(document.createTextNode(bandName + ' — ' + songName))

  // BACK button
  let backButton = document.createElement('div');
  buttons.appendChild(backButton);
  backButton.appendChild(document.createTextNode('BACK'));
  backButton.setAttribute('onclick', 'buildMainPage();');

  // ADD COLUMN button
  let addColumn = document.createElement('div');
  buttons.appendChild(addColumn);
  addColumn.appendChild(document.createTextNode('ADD COLUMN'));
  addColumn.setAttribute('onclick', 'appendLyricsBlock("' + bandName + '", "' + songName + '");');

  // REFRESH button
  let refreshButton = document.createElement('div');
  buttons.appendChild(refreshButton);
  refreshButton.appendChild(document.createTextNode('REFRESH'));
  refreshButton.setAttribute('onclick', 'buildSongPage("' + bandName + '", "' + songName + '");');

  // FONT+ button
  let fontPlus = document.createElement('div');
  buttons.appendChild(fontPlus);
  fontPlus.appendChild(document.createTextNode('FONT+'));
  fontPlus.setAttribute('onclick', 'updateFontSize(5);');

  // FONT- button
  let fontMinus = document.createElement('div');
  buttons.appendChild(fontMinus);
  fontMinus.appendChild(document.createTextNode('FONT-'));
  fontMinus.setAttribute('onclick', 'updateFontSize(-5);');

  // Add song lyrics
  let lyricsParentNode = document.createElement('div');
  content.appendChild(lyricsParentNode);
  lyricsParentNode.setAttribute('id', 'lyrics-parent')

  appendLyricsBlock(bandName, songName);
}

// Build main page
function buildMainPage() {
  content, buttons, info = wipeContent();

  for (const [bandName, songDict] of Object.entries(lyricsTree)) {
    // Band node (div)
    let bandNode = document.createElement('div');
    content.appendChild(bandNode);
    bandNode.setAttribute('id', 'band-' + bandName);
    bandNode.setAttribute('class', 'bandNode');

    // Band name
    let bandNameNode = document.createElement('div');
    bandNode.appendChild(bandNameNode);
    bandNameNode.setAttribute('class', 'band-name');
    bandNameNode.appendChild(document.createTextNode(bandName));

    for (const [songName, songContent] of Object.entries(songDict)) {
      let songNode = document.createElement('div');
      bandNode.append(songNode);

      songNode.setAttribute('onclick', 'buildSongPage("' + bandName + '", "' + songName + '");');
      songNode.appendChild(document.createTextNode(songName));
      songNode.setAttribute('class', 'song-name');
    }
  }
}

document.addEventListener('DOMContentLoaded', async function(event) {
  await buildLyricsTree();
  await buildMainPage();
});

window.onbeforeunload = function() {
  return 'Do not refresh me!';
}
