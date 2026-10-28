# SEO — wdrożenie z 28.10.2026

## Zmiany w projekcie

1. **27 statycznych stron HTML w PL/EN/DE.** Strona główna, przegląd realizacji, cztery kategorie i kolejne strony galerii. Wszystkie 104 zdjęcia znajdują się w HTML; ich odkrycie nie wymaga uruchamiania JavaScript ani klikania przycisków.
2. **Rzeczywiste linki kategorii i paginacji.** Każda strona ma własny URL oraz canonical wskazujący na nią, również druga i trzecia strona galerii. Rozmiar strony wynosi 20 zdjęć niezależnie od urządzenia. Odświeżanie, historia przeglądarki i przełączanie języka zachowują wybraną stronę galerii.
3. **Metadane generowane centralnie.** Unikalne tytuły i opisy, canonical, index/follow, max-image-preview:large, Open Graph oraz Twitter Cards. Wersje językowe mają wzajemne hreflang, x-default, lang i og:locale. Parametry śledzące nie trafiają do canonical.
4. **Treść i nagłówki.** Jeden H1 na każdej stronie, opisy poszczególnych usług w trzech językach, widoczna informacja o materiałach, działalności i współpracy na stronie głównej. Usunięto pusty nagłówek w logo, zachowując jego element dekoracyjny.
5. **Dane strukturalne JSON-LD.** Organization, WebSite, WebPage/CollectionPage i BreadcrumbList. Spójne identyfikatory firmy i witryny, telefon, e-mail, istniejące profile społecznościowe oraz obsługiwane miasta.
6. **Prywatność adresu.** Zgodnie z decyzją właściciela nie ma adresu warsztatu, kodu pocztowego ani współrzędnych. Usunięto nieprawidłowy PostalAddress, w którym trzy obsługiwane miasta były jednym adresem. Użyto Organization bez deklarowania kompletnego LocalBusiness. Nie dodano ocen, cen, godzin pracy ani niepotwierdzonych danych firmy.
7. **Zdjęcia.** Wymiary width/height odczytywane z plików, teksty alternatywne galerii z kategorią i numerem zdjęcia, lazy loading dalszych zdjęć oraz preload zdjęcia hero. Miniatury są linkami do plików i działają bez JavaScript; przy włączonym JS nadal otwierają podgląd. Przy zmianie rozmiarów zachowano proporcje logo i podglądu.
8. **Sitemap i robots.txt.** Mapa stron jest generowana podczas buildu z tego samego katalogu co HTML. Zawiera wszystkie kanoniczne strony i zdjęcia. Usunięto ręczne priority i Host. Nie generujemy fikcyjnej daty lastmod przy każdym buildzie. Mapa jest też dostępna na serwerze developerskim pod `/sitemap.xml`.
9. **Błędy 404.** Dodano stronę błędu z noindex i linkami PL/EN/DE; Vite pracuje w trybie MPA, więc nieznane adresy nie otrzymują strony głównej ze statusem 200. GitHub Pages korzysta z pliku `404.html` po publikacji.
10. **Stare adresy.** Linki `projects.html?category=...` przenoszą użytkownika do właściwej kategorii, zachowując pozostałe parametry i fragment URL. Jest to przekierowanie po stronie klienta, nie HTTP 301 — sam GitHub Pages nie udostępnia reguł przekierowań zależnych od query string. Bez JS dostępny pozostaje przegląd kategorii. Nowe linki wewnętrzne prowadzą bezpośrednio do statycznych adresów.

## Wyniki sprawdzeń

- Build produkcyjny i TypeScript: poprawne.
- 44 testy Node: wszystkie przeszły; obejmują 27 stron, tytuły, opisy, canonical, hreflang, JSON-LD, prywatność danych, wymiary i dostępność zasobów, kompletność katalogu, mapę stron i poprawność linków.
- 42 testy Playwright: wszystkie przeszły na desktopowym Chromium i emulacji telefonu. Sprawdzono także nawigację bez JavaScript, stare adresy, historię przeglądarki, języki, 404 i wcześniejsze poprawki formularza oraz okien.
- Sprawdzono wizualnie widok desktopowy kategorii, niemiecką kategorię na telefonie i polską stronę główną na telefonie.
- Sprawdzono nowe strony oraz `/sitemap.xml` na serwerze developerskim.
- Lighthouse, kategoria SEO: **100/100** dla strony głównej i `/projects/kitchen.html` na lokalnym serwerze developerskim. Raporty JSON: `.cache/lighthouse-home.json` i `.cache/lighthouse-category.json`. Wynik dotyczy automatycznych kontroli technicznych, nie pozycji w Google ani produkcyjnych Core Web Vitals.
- Testy formularza nie wysyłają prawdziwej poczty. Nie przeprowadzono publikacji ani zmian w Search Console.

## Kontrola po wdrożeniu — po kolei

1. Otwórz `/`, `/projects.html`, `/projects/kitchen.html`, `/projects/wardrobe-2.html` oraz ich odpowiedniki `/en/` i `/de/`. Sprawdź nagłówki, teksty i zdjęcia.
2. Wyłącz JavaScript i przejdź z przeglądu realizacji do kategorii, potem do następnej strony i do zdjęcia. Linki powinny działać normalnie.
3. Włącz JavaScript, sprawdź podgląd zdjęć, menu mobilne, formularz i przełączanie języka na drugiej stronie galerii.
4. Otwórz stary link `/projects.html?category=wardrobe`. Przy włączonym JS powinien prowadzić do `/projects/wardrobe.html`.
5. Sprawdź `/robots.txt` i `/sitemap.xml`. Mapa powinna zawierać 27 adresów stron, bez parametrów i bez 404.
6. Sprawdź statusy HTTP: istniejąca strona 200, nieistniejąca 404; HTTP i domena bez www powinny kierować na docelowe HTTPS z www. Przekierowania domeny i HTTPS zależą od konfiguracji hostingu/DNS, nie od samego HTML.
7. W Google Rich Results Test sprawdź adres strony głównej i kategorii. Dla kategorii sprawdź breadcrumbs; Organization celowo nie zawiera prywatnego adresu. Test nie potwierdza pozycji ani indeksacji.
8. W Google Search Console zweryfikuj własność domeny, zgłoś `https://www.wioryleca-meblenawymiar.pl/sitemap.xml` i użyj Inspekcji URL dla strony głównej oraz jednej kategorii w każdym języku. Zweryfikuj canonical wybrany przez Google po ponownym przetworzeniu stron.
9. Sprawdź podgląd udostępnianego linku w używanych serwisach społecznościowych; mogą przechowywać poprzednie metadane w cache.
10. Po zebraniu danych oceniaj zapytania, kliknięcia, indeksację i Core Web Vitals w Search Console. Wynik testu lokalnego nie zastępuje danych użytkowników na produkcji.

## Utrzymanie

- Kategorie i pliki zdjęć: `build/catalog.mjs` oraz `public/images/`.
- Opisy usług i metadane językowe: `src/locales/pages/{pl,en,de}.json`.
- Dane firmy, SEO i sitemap: `build/seo.mjs`.
- Zmiana liczby zdjęć wymaga restartu Vite lub nowego buildu. Nie edytuj wygenerowanych katalogów `projects/`, `en/projects/`, `de/projects/` ani `dist/`.
- Przed publikacją uruchom `npm test`; CI robi to również automatycznie.
- Teksty alternatywne identyfikują kategorię i zdjęcie. Bardziej szczegółowe opisy pojedynczych realizacji, materiałów i lokalizacji warto dodawać na podstawie potwierdzonych danych, bez zgadywania na podstawie nazw plików.

## Źródła zasad

- [Google: wersje językowe i hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: paginacja, osobne URL i canonical](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google: wymagania LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: obrazy](https://developers.google.com/search/docs/appearance/google-images)
- [Google: sitemap i lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
