# Sanity CMS — setup i obsługa

Zakres (Krok 4): blog (en/pl/es/it) + singleton `notificationRecipients`.
Reszta treści (jachty/marki/dealerzy) zostaje w `src/content/` — patrz
`docs/agency_handover.md`.

Project ID: `9djarxf8`, dataset: `production` (prywatny).

## Setup — status

- [x] `sanity login` / `sanity init`
- [x] Dataset przełączony na prywatny (`sanity datasets visibility set production private`)
- [x] Token odczytu (Viewer) wygenerowany, w `.env` jako `SANITY_API_READ_TOKEN`
- [x] CORS origins dodane (localhost:4321 + produkcyjny URL Vercel)
- [ ] Deploy Hook w Vercel (Project → Settings → Git → Deploy Hooks) —
      utworzyć jeden dla brancha produkcyjnego, skopiować URL
- [ ] Webhook w Sanity (manage.sanity.io → projekt → API → Webhooks) —
      URL = Deploy Hook z kroku wyżej, **filtr GROQ: `_type == "post"`**
      (świadomie bez `notificationRecipients` — ten dokument czyta endpoint
      leadowy w locie, edycja nie powinna odpalać rebuilda)

## Dla edytora treści (jak dodać/edytować post)

1. Wejdź na `/admin`, zaloguj się kontem Sanity
2. **Blog posts** → **Create** → uzupełnij pola:
   - Title, Slug (generuje się automatycznie z tytułu, także dla polskich znaków)
   - Language
   - Translation of — **tylko dla wersji pl/es/it**: wybierz z listy angielski
     odpowiednik tego artykułu (łączy wersje dla SEO/hreflang). Pole znika
     przy wersji angielskiej — ona jest "oryginałem", nie musi się do
     niczego odnosić. **Angielską wersję trzeba więc utworzyć i opublikować
     jako pierwszą**, zanim będzie ją można wybrać w pl/es/it.
   - Excerpt (max 200 znaków, widoczny na liście)
   - Published at
   - Category (dowolny tekst, opcjonalnie)
   - Cover image (opcjonalnie; alt text wymagany jeśli dodajesz obraz)
   - Content
   - SEO (opcjonalnie — title/description do meta tagów, inaczej używa tytułu/excerptu)
3. **Publish** — strona zaktualizuje się automatycznie po chwili (webhook → rebuild)

## Odbiorcy powiadomień o leadach

**Notification recipients** (jedyny taki dokument, nie da się stworzyć drugiego)
→ lista adresów e-mail → **Publish**. Zmiana działa od razu, bez przebudowy
strony (endpoint `/api/lead`, Krok 5, czyta ten dokument przy każdym
zgłoszeniu).

## Cztery istniejące posty — do ręcznego wprowadzenia w Studio

Poniższe zostały usunięte z `src/content/blog/` (zastąpione przez Sanity).
To wszystko wersje tego samego artykułu — stwórz najpierw EN, potem pl/es/it
i w każdej z nich ustaw "Translation of" na wersję EN. Treść do skopiowania:

### EN

- Title: `How to Choose Your First Yacht`
- Slug: `how-to-choose-your-first-yacht`
- Language: `en`
- Excerpt: `Selecting a yacht for the first time is unlike any other purchase. Here is what to consider before you speak to a builder.`
- Published at: `2026-07-01`
- Category: `BUYING GUIDE`
- SEO title: `How to Choose Your First Yacht — Herev`
- SEO description: `A considered guide to selecting your first yacht. Length, category, and what five of the world's best builders actually recommend.`
- Content: see `git show b59ea88:src/content/blog/en/how-to-choose-your-first-yacht.md` (or previous commit history) for the full Markdown body — copy the prose into the Portable Text editor section by section (headings, bold, links).

### PL

- Title: `Jak wybrać swój pierwszy jacht`
- Slug: `jak-wybrac-swoj-pierwszy-jacht`
- Language: `pl`
- Translation of: wersja EN powyżej
- Excerpt: `Wybór jachtu po raz pierwszy nie przypomina żadnego innego zakupu. Oto co warto przemyśleć zanim porozmawiasz z producentem.`
- Published at: `2026-07-01`
- Category: `PORADNIK KUPUJĄCEGO`
- SEO title: `Jak wybrać swój pierwszy jacht — Herev`
- SEO description: `Przemyślany przewodnik po wyborze pierwszego jachtu. Długość, kategoria i to, co pięciu najlepszych producentów na świecie naprawdę rekomenduje.`
- Content: pełny tekst w historii gita, ta sama ścieżka co wyżej dla wersji `pl/`.

### ES

- Title: `Cómo elegir tu primer yate`
- Slug: `como-elegir-tu-primer-yate`
- Language: `es`
- Translation of: wersja EN powyżej
- Excerpt: `Seleccionar un yate por primera vez no se parece a ninguna otra compra. Esto es lo que conviene considerar antes de hablar con un constructor.`
- Published at: `2026-07-01`
- Category: `GUÍA DE COMPRA`
- SEO title: `Cómo elegir tu primer yate — Herev`
- SEO description: `Una guía reflexiva para seleccionar tu primer yate. Eslora, categoría y lo que cinco de los mejores constructores del mundo realmente recomiendan.`
- Content: pełny tekst w historii gita (`src/content/blog/es/como-elegir-tu-primer-yate.md` sprzed usunięcia).

### IT

- Title: `Come scegliere il tuo primo yacht`
- Slug: `come-scegliere-il-tuo-primo-yacht`
- Language: `it`
- Translation of: wersja EN powyżej
- Excerpt: `Scegliere uno yacht per la prima volta non assomiglia a nessun altro acquisto. Ecco cosa considerare prima di parlare con un costruttore.`
- Published at: `2026-07-01`
- Category: `GUIDA ALL'ACQUISTO`
- SEO title: `Come scegliere il tuo primo yacht — Herev`
- SEO description: `Una guida ponderata per scegliere il tuo primo yacht. Lunghezza, categoria e ciò che cinque dei migliori costruttori al mondo raccomandano davvero.`
- Content: pełny tekst w historii gita (`src/content/blog/it/come-scegliere-il-tuo-primo-yacht.md` sprzed usunięcia).
