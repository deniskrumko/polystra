// Main tree to store lyrics
let lyricsTree = {};
let lyricsStorage = window.localStorage;
let cookieName = 'lyricsTreeCookie'
let completed = [];
let fontSize = 40;

// ICONS
let iconCheck = document.createElement('img');
iconCheck.setAttribute('src', 'icons/check.svg');

let iconBack = document.createElement('img');
iconBack.setAttribute('src', 'icons/arrow-left.svg');

let iconSync = document.createElement('img');
iconSync.setAttribute('src', 'icons/sync.svg');

let iconTask = document.createElement('img');
iconTask.setAttribute('src', 'icons/tasklist.svg');

let iconPlus = document.createElement('img');
iconPlus.setAttribute('src', 'icons/plus.svg');

let iconMinus = document.createElement('img');
iconMinus.setAttribute('src', 'icons/minus.svg');

let iconColumn = document.createElement('img');
iconColumn.setAttribute('src', 'icons/sidebar-collapse.svg');

// Make HTTP request
async function makeRequest(url) {
    let base64_public = 'Z2hwX004RW5sekJoOG02TU1pTzJFZkNhSFZ0ZVpxVzZLTjNEZFVmNA==';
    let public_oauth = decodeURIComponent(escape(atob(base64_public)));
    let headers = {
      "Content-Type": "application/json",
      "Authorization": `Token ${public_oauth}`
    };
    return await fetch(url, {headers,}).then((response) => {
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
    console.log('Build lyrics tree');
    lyricsTree = {};

    let root_url = 'https://api.github.com/repos/deniskrumko/polystra/git/trees/master';
    let root_json = await makeRequest(root_url);
    if (root_json['message']) {
        // API rate limit exceeded...
        content,
        buttons,
        info = wipeContent();

        let errorMsg = document.createElement('div');
        errorMsg.setAttribute('class', 'band-name');
        errorMsg.appendChild(document.createTextNode('Error getting content from Github...'));
        content.appendChild(errorMsg);
        return false;
    }

    console.log('Root directory downloaded');
    let text_dir = root_json['tree'].find(function(element, index, array) {
        return element['path'] == 'lyrics';
    })

    let bands_tree = await makeRequest(text_dir['url']);
    for (const band of bands_tree['tree']) {
        await getBandSongs(band);
    }

    if (lyricsTree) {
        console.log('Local storage updated');
        lyricsStorage.setItem(cookieName, JSON.stringify(lyricsTree));
    }

    return true;
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

function wipeBlock(el) {
  let deletableBlocks = ['lyrics-divider', 'lyrics-line'];
  while (deletableBlocks.includes(el.nextSibling.className)) {
    el.nextSibling.remove();
  }
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
        if (!line) {
            continue;
        } else if (line === '-') {
          let divider = document.createElement('div');
          divider.setAttribute('class', 'lyrics-divider');
          lyricsBlock.appendChild(divider);
        } else {
          let p = document.createElement('p');
          p.setAttribute('class', 'lyrics-line');
          p.appendChild(document.createTextNode(line));
          lyricsBlock.appendChild(p);

          if (line.startsWith('[')) {
              p.setAttribute('class', 'lyrics-highlighted');
              p.setAttribute('onclick', 'wipeBlock(this);');
          }
        }
    }

    let scrollPastEnd = document.createElement('div');
    lyricsBlock.appendChild(scrollPastEnd);
    scrollPastEnd.setAttribute('class', 'scroll-past-end');

    updateFontSize();
}

// Update lyrics font size
function updateFontSize(step = 0) {
    if (fontSize + step < 1) {
      console.error('Font size is too small');
      return;  // Negative font size is not possible
    }

    fontSize += step;
    console.log('Set font size: ' + fontSize + 'px');

    let lines = document.querySelectorAll('.lyrics-line');
    for (let i = 0; i < lines.length; i++) {
        lines[i].style.fontSize = fontSize + 'px';
    }
}

function markCompleted(bandName, songName) {
    console.log('Song "' + bandName + '-' + songName + '" marked as completed');
    completed.push(bandName + songName);
    buildMainPage();
}

function refreshMainPage() {
    if (window.confirm('Refresh all completed songs?')) {
      console.error('Completed songs are wiped');
      completed = [];
      buildMainPage();
    }
}

async function updateLibrary() {
    if (window.confirm('Update songs library? All content will be downloaded again.')) {
      console.error('Local storage wiped');
      lyricsStorage.clear();
      wipeContent();

      await buildLyricsTree();
      buildMainPage();
    }
}

function addDivider(buttons) {
  let divider = document.createElement('span');
  divider.setAttribute('class', 'divider');
  buttons.appendChild(divider);
}

function buildSongPage(bandName, songName) {
    console.log('Building song page');

    content,
    buttons,
    info = wipeContent();
    fontSize = 40;

    info.appendChild(document.createTextNode(bandName + ' — ' + songName))

    // COMPLETE button
    if (!completed.includes(bandName + songName)) {
        let compButton = document.createElement('div');
        buttons.appendChild(compButton);
        compButton.appendChild(document.createTextNode('COMPLETE'));
        compButton.prepend(iconCheck);
        compButton.setAttribute(
          'onclick', 'markCompleted("' + bandName + '", "' + songName + '");'
        );
        compButton.setAttribute('class', 'with-icon');
    }

    // BACK button
    let backButton = document.createElement('div');
    buttons.appendChild(backButton);
    backButton.appendChild(document.createTextNode('BACK'));
    backButton.prepend(iconBack);
    backButton.setAttribute('onclick', 'buildMainPage();');
    backButton.setAttribute('class', 'with-icon');

    // REFRESH button
    let refreshButton = document.createElement('div');
    buttons.appendChild(refreshButton);
    refreshButton.appendChild(document.createTextNode('REFRESH'));
    refreshButton.prepend(iconSync);
    refreshButton.setAttribute('onclick', 'buildSongPage("' + bandName + '", "' + songName + '");');
    refreshButton.setAttribute('class', 'with-icon');

    addDivider(buttons);

    // FONT+ button
    let fontPlus = document.createElement('div');
    buttons.appendChild(fontPlus);
    fontPlus.prepend(iconPlus);
    fontPlus.appendChild(document.createTextNode('FONT'));
    fontPlus.setAttribute('onclick', 'updateFontSize(5);');
    fontPlus.setAttribute('class', 'with-icon');

    // FONT- button
    let fontMinus = document.createElement('div');
    buttons.appendChild(fontMinus);
    fontMinus.prepend(iconMinus);
    fontMinus.appendChild(document.createTextNode('FONT'));
    fontMinus.setAttribute('onclick', 'updateFontSize(-5);');
    fontMinus.setAttribute('class', 'with-icon');

    addDivider(buttons);

    // ADD COLUMN button
    let addColumn = document.createElement('div');
    buttons.appendChild(addColumn);
    addColumn.appendChild(document.createTextNode('ADD COLUMN'));
    addColumn.prepend(iconColumn);
    addColumn.setAttribute('onclick', 'appendLyricsBlock("' + bandName + '", "' + songName + '");');
    addColumn.setAttribute('class', 'with-icon');

    // Add song lyrics
    let lyricsParentNode = document.createElement('div');
    content.appendChild(lyricsParentNode);
    lyricsParentNode.setAttribute('id', 'lyrics-parent')

    appendLyricsBlock(bandName, songName);
}

// Build main page
function buildMainPage() {
    console.log('Building main page');

    content,
    buttons,
    info = wipeContent();

    let contentMain = document.createElement('div');
    content.appendChild(contentMain);
    contentMain.setAttribute('id', 'content-main');

    // REFRESH button
    let refreshButton = document.createElement('div');
    buttons.appendChild(refreshButton);
    refreshButton.prepend(iconTask);
    refreshButton.appendChild(document.createTextNode('REFRESH COMPLETED'));
    refreshButton.setAttribute('onclick', 'refreshMainPage();');
    refreshButton.setAttribute('class', 'with-icon');

    addDivider(buttons);

    // UPDATE LIBRARY button
    let updateLibButton = document.createElement('div');
    buttons.appendChild(updateLibButton);
    updateLibButton.prepend(iconSync);
    updateLibButton.appendChild(document.createTextNode('UPDATE LIB'));
    updateLibButton.setAttribute('onclick', 'updateLibrary();');
    updateLibButton.setAttribute('class', 'with-icon');


    for (const [bandName, songDict] of Object.entries(lyricsTree)) {
        // Band node (div)
        let bandNode = document.createElement('div');
        contentMain.appendChild(bandNode);
        bandNode.setAttribute('id', 'band-' + bandName);
        bandNode.setAttribute('class', 'band-node');

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
            if (completed.includes(bandName + songName)) {
                songNode.setAttribute('class', 'song-name completed');
            } else {
                songNode.setAttribute('class', 'song-name');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', async function(event) {
    let lyricsTreeJSON = lyricsStorage.getItem(cookieName);
    let result = false;

    if (lyricsTreeJSON) {
        console.log('Init library from local storage');
        lyricsTree = JSON.parse(lyricsTreeJSON);
        result = true;
    } else {
        console.log('Init library from API');
        result = await buildLyricsTree();
    }

    if (result) {
        await buildMainPage();
    }
});

window.onbeforeunload = function() {
    return 'Do not refresh me!';
}
