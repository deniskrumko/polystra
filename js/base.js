// Main tree to store lyrics
let lyricsTree = {};
let cookieName = 'lyricsTreeCookie'
let completed = [];
let fontSize = 40;

// Create cookie
function createCookie(value) {
    let date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000)); // 1 day
    expires = "; expires=" + date.toUTCString();

    let cookie = cookieName + "=" + value + expires + "; path=/; SameSite=None; Secure";
    document.cookie = cookie;

    if (value) {
      console.log('Cookie set: ' + cookie);
    } else {
      console.error('Cookie wiped');
    }
    return cookie;
}

// Get cookie
function getCookie() {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(cookieName + "=");
        if (c_start != -1) {
            c_start = c_start + cookieName.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return '';
}

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

    let text_dir = root_json['tree'].find(function(element, index, array) {
        return element['path'] == 'lyrics';
    })

    let bands_tree = await makeRequest(text_dir['url']);
    for (const band of bands_tree['tree']) {
        await getBandSongs(band);
    }

    if (lyricsTree) {
        let lyricsTreeJSON = JSON.stringify(lyricsTree);
        createCookie(lyricsTreeJSON);
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
        }
        let p = document.createElement('p');
        p.setAttribute('class', 'lyrics-line');
        p.appendChild(document.createTextNode(line));
        lyricsBlock.appendChild(p);

        if (line.startsWith('[')) {
            p.setAttribute('class', 'lyrics-highlighted');
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

function updateLibrary() {
    if (window.confirm('Update songs library? All content will be downloaded again.')) {
      createCookie(''); // Clear cookie
      buildLyricsTree();
      buildMainPage();
    }
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
        compButton.setAttribute('onclick', 'markCompleted("' + bandName + '", "' + songName + '");');
    }

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
    refreshButton.appendChild(document.createTextNode('REFRESH COMPLETED'));
    refreshButton.setAttribute('onclick', 'refreshMainPage();');

    // UPDATE LIBRARY button
    let updateLibButton = document.createElement('div');
    buttons.appendChild(updateLibButton);
    updateLibButton.appendChild(document.createTextNode('UPDATE LIB'));
    updateLibButton.setAttribute('onclick', 'updateLibrary();');

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
    let lyricsTreeJSON = getCookie();
    let result = false;

    if (lyricsTreeJSON) {
        console.log('Init library from cookue');
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
