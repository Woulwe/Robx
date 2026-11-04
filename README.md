# Robx Studio

Mobile-first Roblox experience builder for creating a starter world from a text description.

## Features

- Prompt-based procedural map generation (island, city, fantasy/adventure layouts).
- Luau starter systems: day/night, basic survival stats and DataStore persistence, NPC interaction prompts, mobile-ready default touch controls.
- Editable primitive Model stand-ins for NPCs, wildlife and hostile creatures.
- Interactive 3D scene preview (Three.js): orbit, zoom and inspect generated objects.
- Server-side Roblox XML place export as `.rbxlx`.
- Optional publishing to an existing Roblox place through Roblox Open Cloud.
- Automated Node syntax checks and tests through GitHub Actions.

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env
npm start
``

Open `http://localhost:3000`.

## Publish to Roblox

1. Create an Open Cloud API key in Creator Dashboard.
2. Give it `universe-places` access with the **Write** operation for the target experience.
3. Set `ROBLOX_API_KEY`, `ROBLOX_UNIVERSE_ID` and `ROBLOX_PLACE_ID` as private server environment variables.
4. Generate a project and choose **Опубликовать в Roblox**.

The key is read only by the server and is never sent to the browser. The publishing endpoint uploads the generated RBXLX place file as a new published version. Review and test a generated project in Roblox Studio before publishing it to a live experience.

Official guide: https://create.roblox.com/docs/cloud/guides/usage-place-publishing

## Current scope

The generator is deterministic and prompt-seeded; it does not yet call a hosted LLM. It creates a playable starter scene and editable primitive stand-ins, not polished custom meshes or fully animated characters. The 3D preview is a visual preview of the generated layout, not a live Roblox runtime. Expand `src/generator.js` to integrate an AI model and add production assets, pathfinding, animations, quests and full survival gameplay.
