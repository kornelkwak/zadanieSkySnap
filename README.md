# Zadanie rekrutacyjne SkySnap 2025

## Technologie
- Projekt stworzony jest za pomocą pnpm i narzędzia vite-create na podstawie szablonu: `React + TypeScript + Vite`.
- Dodana została biblioteka `OpenLayers` w celu obsługi map oraz `proj4` do obsługi projekcji.
- Dodana została biblioteka `lerc` w celu obsługi rastrów wysokościowych.
- Dodana została biblioteka `Potree` w celu obsługi chmur punktów.

## Dane

Dane testowe należy pobrać osobno (ze względu na ich objętość) i wypakować do lokalizacji `./public/data`

Po uruchomieniu projektu komendą `pnpm preview` lub `pnpm dev` będą dostępne pod adresem `http://localhost:5173/data/` 

Plik `vectors_response.json` będzie przykładowo posiadał adres `http://localhost:5173/data/vectors_response.json`.

W folderze `data` umieszczone są przykładowe dane z jakimi na co dzień spotykamy się w pracy nad naszymi rozwiązaniami.

Plik `vectors_response.json` to przykładowa odpowiedź servera na zapytanie od dostępne dane wektorowe. Zawierają geometrię gotową do wyświetlenia na mapie. Używają World Geodetic System 84, jego kod EPSG to `EPSG:4326`.

Folder `6` zawiera trzy zestawy danych:
- Chmurę punktów - w folderze `pointclouds` - jest to przetworzona, gotowa do wyświetlenia chmura punktów, wszystkie potrzebne pliki oraz meta-dane dostępne są w tym katalogu.
- Dane Rastrowe - w folderze `rasters` - są to dwa zestawy pokafelkowanych obrazów. Katalog `499` zawiera raster wysokościowy, możliwy do wyświetlenia używając OpenLayers z pomocą biblioteki `lerc`, oraz w folderze `500` zwyczajny raster RGB.
- Dane wektorowe - w folderze `vectors` - są to przetworzone dane wektorowe w formacie `geojson`.

Wszystkie dane z folderu `6` używają projekcji `ETRF2000-PL / CS2000/15` o kodzie EPSG = `EPSG:2176`.

Folder `public/data` dodany jest do .gitignore

## Zadanie

### WYMAGANE: Należy utworzyć layout wyświetlający dwa widoki: `Mapa 2D` oraz `Chmura Punktów 3D`.

Możesz dowolnie zmienić kod, doinstalowywać paczki itp. 

1. W widoku `2D` za pomocą biblioteki `OpenLayers` wyświetlić: (warstwy liczone od najniższej)
    - Podkład `OpenStreetMap`,
    - `Raster RGB` (z katalogu o numerze `500`)
    - `Raster Wysokościowy` (z katalogu o numerze `499`)
    - `Wektory` - dwie warstwy. Jedna z katalogu `vectors` a druga z pliku `vectors_response.json`

2. Dodać panel wyświetlający konkretne warstwy i pozwalający na włączenie i wyłączenie widoczności dowolnej z nich.

3. Widok początkowy powinien być wyśrodkowany i przybliżony na dane.

4. W widoku `3D` za pomocą biblioteki `potree` wyświetlić dane chmury punktów. Biblioteka nie ma swojej paczk npm,
trzeba kod z repozytorium dostosować do użycia w projekcie

### DODATKOWE:

1. Skonfigurowanie i napisanie testów jednostkowych
2. Dodatkowe narzędzia obsługi warstw lub chmury punktów - np. zmiana widoczności lub transparentności
3. Dopisanie dokumentacji JSDocs wewnątrz kodu

## Wykonanie Zadania

1. Należy rozpakować plik projektu
2. Dane testowe należy rozpakować i umieścić w katalogu projektu w lokalizacji `public/data`
3. Swoją wersję rozwiązanego zadania należy umiećić we własnym repozytorium Git (GitHub, GitLab lub dowolne inne publiczne repozytorium).
4. Link do rozwiązania wysłać na maile: marcin.kawczynski@skysnap.pl oraz igor.buczak@skysnap.pl i w razie potrzeby udzielić im dostęp do repozytorium.

Na wykonanie zadania przeznaczone jest maksmalnie 7 dni, liczone od momentu jego wysłania.

### Wynik

Oceniana będzie jakość kodu, jego czytelnośc i organizacja struktury plików; metody implementacji jak i sposoby użycia wymaganych bibliotek.
Po zapoznaniu się z kodem rozwiązania, nastąpi prezentacja, w której trzeba będzie opowiedzieć o wyborach, trudnościach i podjętych decyzjach podczas jego rozwiązywania.

### Biblioteki

[https://openlayers.org/]

[https://github.com/potree/potree]
