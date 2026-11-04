local Config = {}

Config.FieldSize = 15
Config.BlockSize = 4
Config.MaxLayers = 300
Config.MaxDigDistance = 18
Config.DigCooldown = 0.55
Config.StartingCoins = 0

Config.Shovels = {
    {Name = "Starter Shovel", Power = 1, Price = 0},
    {Name = "Iron Shovel", Power = 2, Price = 150},
    {Name = "Steel Shovel", Power = 4, Price = 650},
    {Name = "Crystal Drill", Power = 8, Price = 2500},
}

-- 300 distinct underground strata. Each mined block advances one layer.
Config.Layers = {}
local bands = {
    {Name = "Topsoil", Material = Enum.Material.Ground, Color = Color3.fromRGB(115, 83, 57)},
    {Name = "Clay", Material = Enum.Material.Ground, Color = Color3.fromRGB(151, 91, 67)},
    {Name = "Sandstone", Material = Enum.Material.Sandstone, Color = Color3.fromRGB(184, 151, 105)},
    {Name = "Shale", Material = Enum.Material.Slate, Color = Color3.fromRGB(92, 101, 112)},
    {Name = "Limestone", Material = Enum.Material.Limestone, Color = Color3.fromRGB(174, 170, 151)},
    {Name = "Granite", Material = Enum.Material.Granite, Color = Color3.fromRGB(105, 105, 112)},
    {Name = "Basalt", Material = Enum.Material.Basalt, Color = Color3.fromRGB(61, 66, 77)},
    {Name = "Crystal Bed", Material = Enum.Material.Neon, Color = Color3.fromRGB(105, 74, 170)},
    {Name = "Magma Rock", Material = Enum.Material.CrackedLava, Color = Color3.fromRGB(103, 47, 35)},
    {Name = "Ancient Core", Material = Enum.Material.Rock, Color = Color3.fromRGB(40, 48, 66)},
    {Name = "Abyss Stone", Material = Enum.Material.Slate, Color = Color3.fromRGB(28, 34, 48)},
    {Name = "Meteorite", Material = Enum.Material.Metal, Color = Color3.fromRGB(76, 69, 87)},
}
for layerIndex = 1, Config.MaxLayers do
    local bandIndex = math.min(#bands, math.floor((layerIndex - 1) / 25) + 1)
    local band = bands[bandIndex]
    Config.Layers[layerIndex] = {
        Name = band.Name .. " - Layer " .. string.format("%03d", layerIndex),
        Health = math.min(16, 1 + math.floor((layerIndex - 1) / 25)),
        Color = band.Color,
        Material = band.Material,
    }
end

Config.Finds = {
    {Name = "Old Coin", Chance = 42, Value = 12, Color = Color3.fromRGB(194, 151, 67), Rarity = "Common"},
    {Name = "Quartz", Chance = 28, Value = 22, Color = Color3.fromRGB(210, 224, 230), Rarity = "Uncommon"},
    {Name = "Ancient Relic", Chance = 17, Value = 65, Color = Color3.fromRGB(83, 173, 151), Rarity = "Rare"},
    {Name = "Golden Idol", Chance = 9, Value = 180, Color = Color3.fromRGB(255, 190, 48), Rarity = "Epic"},
    {Name = "Meteor Shard", Chance = 4, Value = 550, Color = Color3.fromRGB(168, 106, 255), Rarity = "Legendary"},
}

return Config
