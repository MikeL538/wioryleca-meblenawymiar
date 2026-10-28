# Raport poprawek — 27.10.2026

Najnowszy przegląd układu, nawigacji i testów (28.10.2026): [UI_REPORT.md](UI_REPORT.md).

Ten raport opisuje pierwszy pakiet poprawek. Późniejszą przebudowę galerii, aktualne wyniki testów i kontrolę indeksowania opisuje [raport SEO z 28.10.2026](SEO_REPORT.md).

## Zakres

- Stopka i okno kontaktu prowadzą do tego samego adresu: `wiory_leca@wp.pl`.
- Formularz obsługuje zdarzenie `submit`, w tym Enter. Błędy pojawiają się przy polach, a fokus trafia do pierwszego błędnego pola.
- Komunikaty walidacji, wysyłania, powodzenia, błędu i przekroczenia czasu są dostępne w PL/EN/DE.
- Podczas wysyłania przycisk jest zablokowany, pola są tylko do odczytu, a kolejne próby nie tworzą nowych żądań. Zamknięcie i ponowne otwarcie okna nie omija blokady.
- Po sukcesie formularz jest czyszczony. Po błędzie dane pozostają. Po 15 sekundach bez odpowiedzi żądanie jest przerywane; komunikat nie sugeruje pewności, że serwer nie wysłał wiadomości.
- Wszystkie okna korzystają ze wspólnej obsługi: jedno otwarte okno, nieaktywne tło, Tab/Shift+Tab wewnątrz okna, Escape, zamknięcie krzyżykiem lub tłem oraz przywracanie fokusu.
- Przejście z menu mobilnego do Kontakt/O nas/Współpraca zamyka menu. Zamknięcie nowego okna przywraca fokus do przycisku menu i odblokowuje przewijanie.
- Galeria zapętla zdjęcia bieżącej strony bez alertu o końcu. Obsługuje strzałki i przywraca fokus do miniatury.
- Poprawiono selektor fokusu menu i animację widoczności okien, która kolidowała z ustawianiem fokusu.
- CI uruchamia build, testy Node oraz testy przeglądarkowe przed publikacją. Pull requesty są testowane bez wdrażania.
- Dodano Playwright; zaktualizowano zależności w ramach istniejących zakresów wersji, w tym Vite do 7.3.7 w lockfile.

## Weryfikacja automatyczna

- Build produkcyjny i kontrola TypeScript.
- 19 testów Node: sześć stron, metadane, tłumaczenia, zasoby, bezpieczeństwo osadzania tekstów, linki językowe i kategorie galerii.
- 24 testy przeglądarkowe: Chromium desktop oraz emulacja mobilna. Formularz w PL/EN/DE, puste pola i same spacje, wszystkie limity długości, Enter, zgodność adresów e-mail, blokada duplikatów, HTTP 503, błąd sieci, ponowienie, timeout, fokus i zamykanie okien, menu mobilne oraz galeria.
- Dawne trzy testy formularza na uproszczonym DOM zastąpiono testami w przeglądarce.
- Żądania kontaktowe w testach są symulowane. Testy blokują ruch do zewnętrznych serwisów.
- Audyt npm po aktualizacji: 0 zgłoszonych podatności.

## Sprawdzanie ręczne — po kolei

1. **Uruchom podgląd.** `npm.cmd run build`, potem `npm.cmd run preview -- --host 127.0.0.1`. Otwórz adres wskazany w terminalu, zwykle `http://127.0.0.1:4173`.
2. **Adres e-mail.** Najedź na link w stopce i porównaj z oknem Kontakt. Oba powinny wskazywać `mailto:wiory_leca@wp.pl`. Otwarcie linku zależy od konfiguracji programu pocztowego.
3. **Menu mobilne.** Na telefonie lub w wąskim widoku otwórz menu, następnie Kontakt. Powinien pozostać tylko formularz. Zamknij go; strona powinna się przewijać. Powtórz dla O nas i Współpraca.
4. **Klawiatura.** Otwórz Kontakt, używaj Tab i Shift+Tab. Fokus nie powinien przechodzić na stronę pod oknem. Escape zamyka okno i przywraca fokus do przycisku otwierającego. Sprawdź również krzyżyk i kliknięcie poza oknem.
5. **Puste pola.** Wyślij pusty formularz, następnie wpisz tylko spacje w wymagane pole. Oczekuj komunikatów przy polach, fokusu na pierwszym błędzie i braku wysyłki. Poprawienie pola powinno usuwać jego błąd.
6. **Języki.** Powtórz sprawdzenie formularza na `/en/` i `/de/`. Sprawdź, czy komunikaty i etykiety mieszczą się na telefonie; przewiń formularz do końca.
7. **Błąd sieci bez wysyłania poczty.** Po załadowaniu strony włącz Offline w DevTools → Network. Wypełnij formularz i wyślij. Oczekuj komunikatu błędu, zachowanych danych i ponownie aktywnego przycisku. Przywróć Online.
8. **Galeria.** Otwórz realizacje, zmień kategorię i stronę galerii. Kliknij zdjęcie, użyj strzałek na ekranie i klawiaturze. Przejście z ostatniego zdjęcia na pierwsze odbywa się bez alertu. Escape powinien wrócić do wybranej miniatury. Podgląd nadal obejmuje bieżącą stronę galerii.
9. **Prawdziwy telefon.** Sprawdź ekran pionowy i poziomy, przewijanie formularza przy otwartej klawiaturze oraz widoczność komunikatu po wysłaniu. Automatyczna emulacja mobilna nie zastępuje fizycznego telefonu ani Safari na iOS.
10. **Dostarczenie poczty po wdrożeniu.** Wyślij jedno oznaczone zapytanie testowe i sprawdź skrzynkę odbiorczą oraz spam. Oczekuj blokady przycisku podczas wysyłania i wyczyszczenia pól po sukcesie. Testy automatyczne nie potwierdzają dostarczenia wiadomości ani konfiguracji CORS produkcyjnego API.
11. **GitHub Actions.** Przy pull requeście powinien przejść build i testy bez publikacji. Przy wdrożeniu z `main` publikacja powinna rozpocząć się dopiero po ich sukcesie.

## Granice tego pakietu

Zmiany dotyczą pierwszego pakietu napraw: kontaktu, okien, galerii i kontroli przed wdrożeniem. Opisane realizacje, FAQ, opinie klientów, pasek kontaktu, osobne miniatury i rozbudowa katalogu nie są częścią tego wdrożenia. Kod produkcyjnego serwera poczty znajduje się poza tym repozytorium. Nie przeprowadzono publikacji strony ani wysyłki prawdziwych wiadomości.
