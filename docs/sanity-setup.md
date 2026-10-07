# Sanity CMS — setup i obsługa

Zakres (Krok 4): blog (en/pl/es/it) + singleton `notificationRecipients`
(dokument o stałym ID `private.notificationRecipients` — kropka w ID
ukrywa go przed zapytaniami bez tokena, także na planie Free).
Reszta treści (jachty/marki/dealerzy) zostaje w `src/content/` — patrz
`docs/agency_handover.md`.

Project ID: `9djarxf8`, dataset: `production` (publiczny od wygaśnięcia
triala Growth — co to oznacza: decyzja D13 w `docs/cms-plan.md`).

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

## CMS i podgląd (krok 9.1) — `cms.herev.com`

Studio i podgląd wersji roboczych działają na osobnym projekcie Vercel
z tego samego repo. Flaga `SANITY_PREVIEW=true` włącza adapter Vercel,
Studio (`/admin`), endpointy `/api/draft-mode/enable|disable` i renderowanie
stron z treścią z CMS na żądanie (`src/cms/integration.ts`). Produkcja
(`herev.com`) jest budowana bez flagi: czysto statyczna, bez Studio;
`herev.com/admin` przekierowuje na `cms.herev.com/admin` (`vercel.json`).

Kroki ręczne (jednorazowo):

1. **Vercel → Add New → Project** → to samo repo, nazwa `herev-cms`.
   Environment Variables: `SANITY_PREVIEW=true`,
   `PUBLIC_SANITY_PROJECT_ID=9djarxf8`, `PUBLIC_SANITY_DATASET=production`,
   `SANITY_API_READ_TOKEN` (ten sam token co produkcja), `PUBLIC_MAPBOX_TOKEN`.
   **Nie** ustawiać `PUBLIC_INDEXING_ENABLED` — CMS ma zawsze `noindex`.
2. **Domena:** `herev-cms` → Settings → Domains → `cms.herev.com`; w DNS
   rekord CNAME `cms` → `cname.vercel-dns.com`.
   **Do czasu domeny klienta:** CMS działa pod `https://herev-cms.vercel.app`
   (produkcja pod `https://herev-yachts.vercel.app`); `vercel.json` ma
   tymczasową regułę `herev-yachts.vercel.app/admin` →
   `herev-cms.vercel.app/admin` — po podpięciu domen usunąć ją
   i wykonać ten punkt.
3. **Sanity → manage → API → CORS origins:** `https://cms.herev.com`
   (tymczasowo `https://herev-cms.vercel.app`) i `http://localhost:4321`,
   wszystkie z „Allow credentials”.
4. **Vercel (projekt produkcyjny) → Settings → Git → Deploy Hooks:** hook
   dla brancha produkcyjnego; skopiować URL.
5. **Sanity → API → Webhooks:** URL = Deploy Hook, trigger: Create / Update /
   Delete, filtr `_type == "post"` (w kolejnych krokach rozszerzany o nowe
   typy treści; nigdy `notificationRecipients`), „Trigger on drafts” wyłączone.
6. **Vercel → Settings → Notifications:** e-mail przy nieudanym deploymencie
   (oba projekty).

Jak to działa: w Studio zakładka **Podgląd** (Presentation tool) otwiera
stronę w ramce. Studio zapisuje w datasecie jednorazowy sekret i woła
`/api/draft-mode/enable`; endpoint sprawdza sekret i ustawia cookie
`herev-draft-mode` (httpOnly, wartość = HMAC z tokena odczytu — nie da się
jej podrobić). Z cookie strony bloga czytają wersje robocze i oznaczają teksty
niewidocznymi znacznikami (stega), więc klik w tekst otwiera pole. Każda
zmiana w Studio przeładowuje podgląd. Bez cookie `cms.herev.com` pokazuje
tylko opublikowaną treść.

Lokalnie: `SANITY_PREVIEW=true pnpm dev` → `http://localhost:4321/admin`.
`SANITY_PREVIEW=true pnpm build` na Windows kończy się błędem `EPERM symlink`
w ostatnim kroku adaptera (brak uprawnień do symlinków bez trybu dewelopera) —
ograniczenie lokalne; kompilacja Astro przechodzi przed tym krokiem, a build
na Vercelu (Linux) jest pełny.

## Dla edytora treści (jak dodać/edytować post)

1. Wejdź na `https://cms.herev.com/admin`, zaloguj się kontem Sanity
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
