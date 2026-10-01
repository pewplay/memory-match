# Memory Match

Gioco di memoria per [PewPlay](https://www.pewplay.com): gira le carte e trova tutte le coppie con meno mosse possibile. Tre livelli (Easy 4×3, Normal 4×4, Hard 5×4), record salvato per livello, giocabile con mouse, touch e tastiera.

È anche il **gioco di test** della nuova pipeline:

- `game.json` usa tutti i campi (come si gioca, comandi, `featured`, `added`, `exclude`).
- Parte con `"draft": true`: anche se è su `main` non va sul sito pubblico.
- La cartella `docs/` non viene pubblicata (`"exclude": ["docs"]`).
- Non c'è `og.png`: l'immagine per i link condivisi viene generata da `preview.png` + titolo.

## Provarlo

- Da solo: apri `index.html`.
- Dentro il sito, in locale: dalla cartella `pewplay` → `npm run dev -- --games .. --only memory-match`.

## Pubblicarlo

1. Crea il branch `preview` e fai push → compare su `preview.<progetto>.pages.dev` (con il badge "Draft").
2. Quando va bene: togli `"draft": true`, fai il merge di `preview` in `main` e push → online su pewplay.com/memory-match/.
3. Per le modifiche successive lavora sempre su `preview` e fai il merge in `main` quando sono pronte.

MIT
