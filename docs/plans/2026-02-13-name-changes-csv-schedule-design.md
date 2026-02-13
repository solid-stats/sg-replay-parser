# Name Changes CSV Schedule Design

## Context
- Парсер запускается по cron в `src/schedule.ts`.
- Список смен ников читается из `~/sg_stats/config/nameChanges.csv` в `prepareNamesList()`.
- `prepareNamesList()` использует in-memory кэш (`getNamesList()` / `resetNamesList()`), поэтому обновление файла без сброса кэша не гарантирует применение свежих данных.

## Goal
Перед каждым запуском парсинга автоматически обновлять `nameChanges.csv` из Google Sheets CSV URL.

## Decisions
1. Использовать подход №2: отдельный helper в `src/schedule.ts` (`downloadNameChangesCsv`).
2. Вызывать helper прямо в parsing cron-job перед `startParsingReplays()`.
3. При ошибке загрузки/сохранения не останавливать парсинг: логировать ошибку и продолжать с локальным файлом.
4. Сбрасывать кэш имён (`resetNamesList()`) только после успешной записи CSV.
5. Не добавлять отдельную самостоятельную cron-джобу обновления CSV.

## Data Flow
1. parsing cron callback стартует.
2. `downloadNameChangesCsv()` делает `request(googleCsvUrl)`.
3. При успешном `Response` читает `response.text()`.
4. Создаёт `configPath` при необходимости и сохраняет `nameChanges.csv`.
5. Вызывает `resetNamesList()`.
6. Запускает `startParsingReplays()`.

## Error Handling
- `request` вернул `null`, бросил ошибку, или запись на диск завершилась ошибкой:
  - пишется `logger.error(...)` с trace;
  - выполнение продолжается;
  - вызывается `startParsingReplays()`.

## Testing Scope
- `src/!tests/unit-tests/schedule.test.ts`:
  - успешный путь: download -> write -> reset -> parse;
  - ошибочный путь: download error -> parse still runs.
