// Main tree to store lyrics
let lyricsTree = {};

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

function buildSongPage(bandName, songName) {
  let content = document.getElementById('content');
  content.innerHTML = '';  // Wipe content

  // Add controls section
  let controlsNode = document.createElement('div');
  content.appendChild(controlsNode);

  // Add back button
  let backButton = document.createElement('div');
  controlsNode.appendChild(backButton);
  backButton.appendChild(document.createTextNode('BACK'));
  backButton.setAttribute('onclick', 'buildMainPage();');

  // Add song lyrics
  let songContent = lyricsTree[bandName][songName];
  let songLyrics = decodeURIComponent(escape(atob(songContent)));

  console.log(songLyrics.split('\n'));

  let lyricsNode = document.createElement('div');
  content.appendChild(lyricsNode);
  lyricsNode.appendChild(document.createTextNode(songLyrics));

}

// Build main page
function buildMainPage() {
  let content = document.getElementById('content');
  content.innerHTML = '';  // Wipe content

  for (const [bandName, songDict] of Object.entries(lyricsTree)) {
    // Band node (div)
    let bandNode = document.createElement('div');
    content.appendChild(bandNode);
    bandNode.setAttribute('id', 'band-' + bandName);
    bandNode.setAttribute('class', 'bandNode');

    // Band name
    let bandNameNode = document.createElement('div');
    bandNode.appendChild(bandNameNode);
    bandNameNode.setAttribute('class', 'bandName');
    bandNameNode.appendChild(document.createTextNode(bandName));

    for (const [songName, songContent] of Object.entries(songDict)) {
      let songNode = document.createElement('div');
      bandNode.append(songNode);

      songNode.setAttribute('onclick', 'buildSongPage("' + bandName + '", "' + songName + '");');
      songNode.appendChild(document.createTextNode(songName));
      bandNode.setAttribute('class', 'songNode');
    }
  }
}

document.addEventListener('DOMContentLoaded', async function(event) {
  await buildLyricsTree();
  await buildMainPage();
});
