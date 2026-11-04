# Настройка публикации Robx Studio в Roblox

Robx отправляет XML place-файл напрямую в Roblox Open Cloud Place Publishing API. API key хранится только в секретах Supabase и не попадает в браузер.

## 1. Создай API key Roblox

1. Открой Creator Dashboard: https://create.roblox.com/dashboard/credentials
2. Создай новый API key.
3. В Access Permissions добавь `universe-places`.
4. Для нужной игры выбери разрешение `Write`.
5. Скопируй ключ. Не вставляй его в GitHub, HTML или этот чат.

## 2. Найди идентификаторы игры

- **Universe ID**: Creator Dashboard → Creations → меню игры ⋯ → Copy Universe ID.
- **Place ID**: открой игру → Places → открой нужный place. ID находится в URL после `/places/`.

## 3. Добавь секреты в Supabase

Открой Edge Function Secrets:
https://supabase.com/dashboard/project/fktzejpcipjuiuoodmpe/functions/secrets

Добавь пять переменных:

| Name | Value |
|---|---|
| `ROBLOX_API_KEY` | API key, созданный в Roblox |
| `ROBLOX_UNIVERSE_ID` | Числовой Universe ID |
| `ROBLOX_PLACE_ID` | Числовой Place ID |
| `ROBLOX_PUBLISH_PASSWORD` | Сильный отдельный пароль, который знаешь только ты |

Сохрани секреты. API key не нужно вводить в интерфейс Robx.

## 4. Опубликуй мир

1. Открой опубликованную страницу Robx Studio.
2. Создай мир и дождись завершения генерации.
3. В блоке «Опубликовать в Roblox» введи значение `ROBLOX_PUBLISH_PASSWORD`.
4. Нажми «Опубликовать мир».
5. Дождись номера версии от Roblox.

Публикация обновляет указанный существующий Place. Она не создаёт новую игру и не меняет её название, описание или настройки доступа.

## 5. Включи сохранение прогресса

В Roblox Creator Dashboard открой настройки Experience → Security и включи **Enable Studio Access to API Services** для тестирования DataStore. Для опубликованной игры проверь, что API Services разрешены. Скрипты сохраняют характеристики игрока и прогресс заданий в DataStore.

## Важные ограничения

- Roblox Place Publishing API принимает place-файлы размером до 10 МБ.
- API key должен иметь `universe-places:write` для выбранной игры.
- Не публикуй секреты в GitHub и не передавай их в чат.
- После первой публикации проверь игру в Roblox и включи нужные настройки доступа.
