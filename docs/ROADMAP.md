# Robx Studio — capability notes

## Included in v1 scaffold
1. **World generation:** prompt-driven deterministic procedural map layout with island/city/fantasy presets, paths, buildings, resources, spawn and quest marker.
2. **Luau scripts:** generated server scripts for day/night, basic survival stats and DataStore persistence, ambient NPC movement, and mobile-friendly controls.
3. **NPCs and animals:** generated primitive Roblox character/creature stand-ins in the exported place. These are editable placeholder rigs, not production-quality animated meshes.
4. **Web preview:** interactive Three.js scene with orbit controls and object inspection.
5. **RBXLX export:** server serializes generated Parts and scripts into an XML place file for Roblox Studio import.
6. **Roblox publishing:** optional Open Cloud place publishing endpoint. Requires a Creator Dashboard API key with `universe-places:write`, Universe ID and Place ID stored as server environment variables.

## Important limits
- This first version uses a local procedural generator, not a connected LLM. The prompt controls theme and seeded layout. Connect a model provider in `src/generator.js` for richer semantic generation.
- NPCs and creatures are primitive placeholders. Add rigged meshes, animation assets and pathfinding to productionize them.
- The generated RBXLX is a starter place, not a complete polished game. Open and test it in Roblox Studio before publishing.
- Roblox publishing is disabled until server environment variables are configured. Never put the Roblox API key in browser code or commit it to Git.

## Run
`npm install` then `npm start`; open port 3000.
