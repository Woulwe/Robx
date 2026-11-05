import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld } from "../src/generator.js";
import { buildPlaceXml } from "../src/rbxlx.js";

test("generator creates a map with NPCs and wildlife", () => {
  const world = generateWorld("Выживание на большом острове с лесом и животными");
  assert.ok(world.objects.length > 50);
  assert.ok(world.objects.some((o) => o.type === "npc"));
  assert.ok(world.objects.some((o) => o.type === "animal" || o.type === "enemy"));
  assert.ok(world.scripts["ServerScriptService/PlayerData.server.lua"]);
});

test("RBXLX export contains workspace, models and scripts", () => {
  const world = generateWorld("Фэнтези RPG с магией и боссом");
  const xml = buildPlaceXml(world);
  assert.match(xml, /<roblox version="4">/);
  assert.match(xml, /class="Workspace"/);
  assert.match(xml, /Terrain Grass/);
  assert.ok((xml.match(/Terrain Grass/g) || []).length > 100, "RBXLX must contain static terrain parts, not only a runtime script");
  assert.match(xml, /class="Model"/);
  assert.match(xml, /class="ServerScriptService"/);
  assert.match(xml, /<ProtectedString name="Source">/);
});
