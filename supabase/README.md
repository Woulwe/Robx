# Supabase setup

Project: fktzejpcipjuiuoodmpe

Deployed function:
https://fktzejpcipjuiuoodmpe.supabase.co/functions/v1/robx-studio

Database migration:
supabase/migrations/20261104000000_robx_projects.sql

The migration defines per-user projects with row-level security. Apply it to the linked Supabase project before enabling project saving in the UI.

The deployed function currently serves the app, world generation and RBXLX export. Roblox publishing needs server-side secrets:
ROBLOX_API_KEY
ROBLOX_UNIVERSE_ID
ROBLOX_PLACE_ID
ROBLOX_PUBLISH_PASSWORD

Never put secret values in this repository or browser code.
