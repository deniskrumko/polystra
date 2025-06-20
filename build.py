import shutil
from dataclasses import dataclass
from pathlib import Path

from jinja2 import (
    Environment,
    FileSystemLoader,
)

LYRICS_DIR = Path("lyrics")
TEMPLATE_DIR = Path("templates")
PAGES_DIR = Path("pages")
CHORDS = ("A", "B", "C", "D", "E", "F", "G")


def detect_chords(line: str) -> bool:
    """Returns true if line is a line of chords."""
    parts = [len(c) <= 3 and any(map(c.startswith, CHORDS)) for c in line.split()]
    return all(parts) and len(parts) > 1


@dataclass
class Link:
    url: str
    name: str


@dataclass
class Line:
    text: str
    highlighted: bool = False
    breaked: bool = False
    divider: bool = False
    chords: bool = False

    def __str__(self) -> str:
        return self.formatted_text

    @property
    def formatted_text(self) -> str:
        text = self.text.strip()

        if not self.highlighted and "[" in self.text:
            text = text.replace("[", "<span class='hl'>[").replace("]", "]</span>")

        if not self.highlighted and "(" in self.text:
            text = text.replace("(", "<span class='dim'>(").replace(")", ")</span>")

        return text


@dataclass
class Song:
    name: str
    lines: list[Line]
    links: list[Link]
    tags: list[str]

    def __str__(self) -> str:
        return self.name

    def __repr__(self) -> str:
        return f"<Song {self.name}>"

    @classmethod
    def from_file(cls, name: str, data: str) -> "Song":
        tags: list[str] = []
        lines: list[Line] = []
        links: list[Link] = []

        for line in data.splitlines():
            line = line.strip()

            if line.startswith("#"):
                parts = line.split("#")
                for part in parts[1:]:
                    tags.append(part.strip().replace(" ", "_").lower())
            elif line.startswith("http://") or line.startswith("https://"):
                parts = line.split(";")

                url = url_name = parts[0].strip()
                if len(parts) > 1:
                    url_name = parts[1].strip()

                links.append(Link(url=url, name=url_name))
            else:
                # Skip first empty line
                if not lines and line == "":
                    continue

                lines.append(
                    Line(
                        text=line,
                        highlighted=line.startswith("["),
                        divider=line == "-",
                        breaked=line == "",
                        chords=detect_chords(line),
                    ),
                )

        return cls(
            name=name,
            lines=lines,
            tags=tags,
            links=links,
        )

    @property
    def slug(self) -> str:
        return self.name.lower().replace(" ", "-")


@dataclass
class Band:
    name: str
    songs: list[Song]

    def __str__(self) -> str:
        return self.name

    def __repr__(self) -> str:
        return f"<Band {self.name} ({len(self.songs)})>"

    @property
    def slug(self) -> str:
        return self.name.lower().replace(" ", "-")

    def get_song_page(self, song: Song) -> str:
        return f"pages/{self.slug}/{song.slug}.html"


def collect_bands() -> list[Band]:
    bands = []
    for band_dir in LYRICS_DIR.iterdir():
        if band_dir.is_dir() and not band_dir.name.startswith("."):
            band = Band(
                name=band_dir.name,
                songs=[
                    Song.from_file(name=f.stem, data=f.read_text(encoding="utf-8"))
                    for f in sorted(band_dir.glob("*.txt"))
                ],
            )
            bands.append(band)

    return sorted(bands, key=lambda b: b.name.lower())


def build_pages() -> None:
    bands = collect_bands()

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    index_template = env.get_template("index.html")
    song_template = env.get_template("song.html")

    index_content = index_template.render(bands=bands)
    Path("index.html").write_text(index_content, encoding="utf-8")
    print("Built index.html")

    shutil.rmtree(PAGES_DIR, ignore_errors=True)
    PAGES_DIR.mkdir(parents=True, exist_ok=True)

    for band in bands:
        band_dir = PAGES_DIR / band.slug
        band_dir.mkdir(parents=True, exist_ok=True)

        for song in band.songs:
            song_page = band.get_song_page(song)
            song_output = song_template.render(band=band, song=song)
            Path(song_page).write_text(song_output, encoding="utf-8")
            print(f"Built {song_page}")


if __name__ == "__main__":
    build_pages()
