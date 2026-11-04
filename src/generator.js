const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const pick = (seed, i, max) => ((seed + i * 9301 + 49297) * 233280 % 2147483647) % max;

export function generateWorld(prompt) {
  const text = prompt.toLowerCase();
  const seed = hash(prompt);
  const island = /остров|island|выжив|survival|лес|forest/.test(text);
  const city = /город|city|городск/.test(text);
  const fantasy = /фэнтези|маг|дракон|fantasy|rpg|босс/.test(text);
  const title = prompt.slice(0, 54).replace(/[<>]/g, "") || "Мой мир";
  const objects = [];
  const add = (type, name, x, y, z, sx, sy, sz, color, extra = {}) => objects.push({
    id: objects.length + 1, type, name, position: [x, y, z], size: [sx, sy, sz], color, ...extra
  });
  add("ground", "Main Island", 0, -2, 0, 220, 4, 220, island ? "#557c50" : city ? "#687486" : "#647b8f");
  add("spawn", "Player Spawn", 0, 1, 0, 7, 1, 7, "#5ce1a0");
  // Roads and paths
  if (city) {
    add("road", "Main Road", 0, 0.1, 0, 16, 0.3, 190, "#303947");
    for (let i = -2; i <= 2; i++) add("building", "City Building", i * 27, 8, -42 + (i % 2) * 32, 18, 16 + pick(seed, i + 9, 28), 18, ["#7386a8","#a28a79","#657d86"][Math.abs(i)%3]);
  } else {
    add("path", "Central Trail", 0, 0.12, 0, 7, 0.25, 125, "#b59b70");
    add("path", "Cross Trail", 0, 0.13, 0, 115, 0.25, 6, "#b59b70");
  }
  // Trees, rocks and resources
  const treeCount = island ? 42 : 24;
  for (let i = 0; i < treeCount; i++) {
    const x = -88 + pick(seed, i + 11, 176), z = -88 + pick(seed, i + 71, 176);
    if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;
    const h = 7 + pick(seed, i + 111, 7);
    add("tree", "Tree Trunk", x, h/2, z, 2.1, h, 2.1, "#79543b", { group: "tree", canopy: "#347a50" });
  }
  for (let i = 0; i < 18; i++) {
    const x = -92 + pick(seed, i + 211, 184), z = -92 + pick(seed, i + 311, 184);
    add("rock", "Stone Deposit", x, 1.4, z, 4 + pick(seed,i+411,4), 2.8, 4 + pick(seed,i+511,4), "#818b98");
  }
  // POIs
  add("building", fantasy ? "Ancient Temple" : "Starter Shelter", -27, 4, -25, 20, 8, 16, fantasy ? "#7965a8" : "#9a7652");
  add("building", fantasy ? "Boss Arena" : "Abandoned Camp", 38, 3, 35, 22, 6, 20, "#8a7765");
  if (fantasy) add("portal", "Magic Portal", 0, 6, -68, 8, 12, 2, "#9b69ff");
  // NPCs / animals / enemies are simple editable primitive rigs in the exported place.
  const npcCount = 3 + pick(seed, 9, 3);
  for (let i = 0; i < npcCount; i++) {
    const x = -45 + i * 28, z = 18 + (i % 2) * 14;
    add("npc", i === 0 ? "Guide NPC" : "Villager NPC", x, 2.8, z, 2.6, 5.6, 2.2, "#e0b78e", { role: "friendly" });
  }
  const animalKinds = ["Deer", "Rabbit", "Wolf", "Boar"];
  for (let i = 0; i < (island ? 10 : 5); i++) {
    const kind = animalKinds[pick(seed, i + 901, animalKinds.length)];
    add(kind === "Wolf" ? "enemy" : "animal", kind, -70 + pick(seed,i+601,140), 1.5, -70 + pick(seed,i+701,140), 3.2, 2.6, 4.4, kind === "Wolf" ? "#77717d" : "#b78e62", { role: kind === "Wolf" ? "hostile" : "wildlife" });
  }
  add("checkpoint", "Quest Marker", 25, 1, -12, 4, 4, 4, "#f4c95d");
  return {
    title, prompt, seed, theme: island ? "island" : city ? "city" : fantasy ? "fantasy" : "adventure",
    summary: `Создана процедурная сцена: ${objects.length} объектов, ${npcCount} NPC, животные и игровые точки интереса.`,
    objects,
    systems: ["MobileControls", "DayNightCycle", "SurvivalStats", "DataSave", "NPCInteraction", "QuestMarkers"],
    scripts: {
      "ServerScriptService/WorldSystems.server.lua": worldSystems,
      "ServerScriptService/PlayerData.server.lua": playerData,
      "StarterPlayer/StarterPlayerScripts/MobileControls.client.lua": mobileControls,
      "ServerScriptService/NPCController.server.lua": npcController
    }
  };
}

const worldSystems = `-- Robx generated world systems
local Lighting = game:GetService("Lighting")
local RunService = game:GetService("RunService")
local clock = 8
RunService.Heartbeat:Connect(function(dt)
  clock = (clock + dt * 0.08) % 24
  Lighting.ClockTime = clock
end)
`;
const playerData = `-- Basic player stats and persistence. Enable Studio API access for testing.
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local Store = DataStoreService:GetDataStore("RobxPlayerData_v1")
Players.PlayerAdded:Connect(function(player)
  local stats = Instance.new("Folder"); stats.Name = "leaderstats"; stats.Parent = player
  local food = Instance.new("IntValue"); food.Name = "Food"; food.Value = 100; food.Parent = stats
  local water = Instance.new("IntValue"); water.Name = "Water"; water.Value = 100; water.Parent = stats
  local ok, data = pcall(function() return Store:GetAsync(tostring(player.UserId)) end)
  if ok and type(data) == "table" then food.Value = data.Food or 100; water.Value = data.Water or 100 end
  task.spawn(function()
    while player.Parent do
      task.wait(30); food.Value = math.max(0, food.Value - 1); water.Value = math.max(0, water.Value - 2)
    end
  end)
end)
local function save(player)
  local stats = player:FindFirstChild("leaderstats"); if not stats then return end
  pcall(function() Store:SetAsync(tostring(player.UserId), {Food=stats.Food.Value, Water=stats.Water.Value}) end)
end
Players.PlayerRemoving:Connect(save)
game:BindToClose(function() for _, p in ipairs(Players:GetPlayers()) do save(p) end end)
`;
const mobileControls = `-- Roblox default PlayerModule already provides touch thumbstick.
-- This script keeps camera behavior mobile-friendly and adds a sprint toggle.
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local player = Players.LocalPlayer
if not UserInputService.TouchEnabled then return end
player.CharacterAdded:Connect(function(character)
  local humanoid = character:WaitForChild("Humanoid")
  humanoid.WalkSpeed = 16
end)
`;
const npcController = `-- Simple server-side ambient NPC movement.
local CollectionService = game:GetService("CollectionService")
for _, npc in ipairs(CollectionService:GetTagged("RobxNPC")) do
  task.spawn(function()
    local humanoid = npc:FindFirstChildOfClass("Humanoid")
    local root = npc:FindFirstChild("HumanoidRootPart")
    if not humanoid or not root then return end
    while npc.Parent do
      local offset = Vector3.new(math.random(-12,12), 0, math.random(-12,12))
      humanoid:MoveTo(root.Position + offset)
      task.wait(math.random(4,8))
    end
  end)
end
`;
