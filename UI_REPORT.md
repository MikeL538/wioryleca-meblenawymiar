# Przegląd układu i nawigacji — 28.10.2026

## Wprowadzone zmiany

- Nagłówek i menu mobilne podkreślają aktywną stronę. Kategorie i kolejne strony galerii oznaczają sekcję „Realizacje”. Oznaczenie jest generowane w HTML i działa bez JavaScriptu.
- Wybrany język ma delikatne tło i krótkie podkreślenie zamiast ramki. Zmiana języka zachowuje kategorię i numer strony galerii.
- Na ekranach poniżej 1080 px używane jest menu mobilne, aby dłuższe etykiety nie ściskały nagłówka.
- Pierwszy ekran ma większe nagłówki i opisy, lepszy kontrast na zdjęciu oraz przycisk „Zapytaj o wycenę” (także tłumaczenia EN/DE).
- Karuzela pokazuje duże zdjęcie z fragmentem kolejnego na telefonie, dwa zdjęcia od 600 px i trzy od 1080 px. Obsługuje naturalne przewijanie dotykiem, strzałki klawiatury i przyciski. Przyciski wyłączają się na początku/końcu; preferencja ograniczonego ruchu wyłącza płynną animację.
- Sekcja „Dlaczego my?” ma szersze, czytelne karty: dwie kolumny na telefonie, cztery od 768 px.
- Galeria używa siatki od jednej do czterech kolumn, z równymi odstępami i zdjęciami dopasowanymi do szerokości.
- Podgląd zdjęcia ma licznik, większe przyciski i wydzielony pasek sterowania. Krzyżyk pozostaje nad zdjęciem.
- Poprawiono zawijanie stopki, kontrast opisów i przycisków, rozmiary pól formularza (16 px), widoczność fokusu oraz cele dotykowe. Dodano link „Przejdź do treści” dostępny z klawiatury.
- Sekcje informacyjne strony głównej i galerii pozostają widoczne i dopasowane do układu. Nie dodano publicznego adresu firmy.

## Wyniki sprawdzenia

- `npm.cmd test`: **44 testy Node + 48 testów Playwright — wszystkie zaliczone**. Build produkcyjny i TypeScript przeszły.
- 27 stron PL/EN/DE × szerokości 320, 390, 768, 1080, 1440, 1920 px: **162 kontrole bez poziomego przepełnienia i błędów JavaScriptu**.
- Kontrola zrzutów pierwszego ekranu, karuzeli, kart, stopki, galerii i menu mobilnego.
- Natywny gest dotykowy karuzeli sprawdzony w emulacji Chromium.
- Kontakt, O nas, Współpraca i menu: **24 kontrole** dla PL/EN/DE przy ekranach 320 × 568 i 844 × 390. Brak przepełnienia poziomego, formularz można przewinąć do przycisku, okna zamykają się.
- Testy obejmują aktywną nawigację, zmianę języka na drugiej stronie kategorii, licznik zdjęć, klawiaturę, końce karuzeli, zmianę szerokości, formularz i działanie galerii bez JavaScriptu.
- `git diff --check`: bez błędów białych znaków.

## Co sprawdzić po kolei

1. Uruchom `npm.cmd run dev` i otwórz adres z terminala. Sprawdź pierwszy ekran, opis, kontrast oraz przycisk „Zapytaj o wycenę”.
2. Przejdź do Realizacji, kategorii szaf i strony 2. Sprawdź podkreślenie „Realizacje”. Zmień język na EN/DE: powinna zostać ta sama kategoria i strona, a podkreślenie języka powinno się przenieść.
3. Zwęź okno do telefonu. Otwórz menu, sprawdź aktywną pozycję i języki. Wróć na stronę główną, przesuń zdjęcia palcem, następnie użyj obu strzałek do końca listy.
4. Sprawdź karty „Dlaczego my?”, opis warsztatu i stopkę. Tekst powinien być czytelny, bez poziomego przewijania i nachodzenia elementów.
5. W galerii otwórz zdjęcie, przełącz kilka zdjęć i sprawdź licznik. Zamknij krzyżykiem oraz Escape; fokus powinien wrócić na miniaturę.
6. Otwórz formularz na telefonie, wpisz tekst, rozwiń klawiaturę i przewiń do przycisku. Sprawdź również orientację poziomą i komunikaty wymaganych pól.
7. Sprawdź na fizycznym telefonie, zwłaszcza Safari na iOS. Testy automatyczne korzystały z Chromium i emulacji urządzenia.

Zmiany są lokalne; nie opublikowano strony. Wysyłka formularza była testowana z symulowanym API — nie wysłano prawdziwych wiadomości i nie potwierdzono dostarczenia poczty produkcyjnej.
