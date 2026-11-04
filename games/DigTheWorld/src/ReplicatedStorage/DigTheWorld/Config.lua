local Config = {}

Config.FieldSize = 36
Config.BlockSize = 4
Config.MaxDigDistance = 18
Config.DigCooldown = 0.55
Config.StartingCoins = 0

Config.Shovels = {
    {Name = "Starter Shovel", Power = 1, Price = 0},
    {Name = "Iron Shovel", Power = 2, Price = 150},
    {Name = "Steel Shovel", Power = 4, Price = 650},
    {Name = "Crystal Drill", Power = 8, Price = 2500},
}

Config.Layers = {
    {Name = "Surface Soil", Health = 1, Color = Color3.fromRGB(115, 83, 57), Material = Enum.Material.Ground, Depth = 0},
    {Name = "Packed Dirt", Health = 2, Color = Color3.fromRGB(91, 65, 49), Material = Enum.Material.Ground, Depth = 1},
    {Name = "Stone", Health = 4, Color = Color3.fromRGB(105, 108, 111), Material = Enum.Material.Slate, Depth = 2},
    {Name = "Deep Rock", Health = 8, Color = Color3.fromRGB(57, 63, 73), Material = Enum.Material.Rock, Depth = 3},
}

Config.Finds = {
    {Name = "Old Coin", Chance = 42, Value = 12, Color = Color3.fromRGB(194, 151, 67), Rarity = "Common"},
    {Name = "Quartz", Chance = 28, Value = 22, Color = Color3.fromRGB(210, 224, 230), Rarity = "Uncommon"},
    {Name = "Ancient Relic", Chance = 17, Value = 65, Color = Color3.fromRGB(83, 173, 151), Rarity = "Rare"},
    {Name = "Golden Idol", Chance = 9, Value = 180, Color = Color3.fromRGB(255, 190, 48), Rarity = "Epic"},
    {Name = "Meteor Shard", Chance = 4, Value = 550, Color = Color3.fromRGB(168, 106, 255), Rarity = "Legendary"},
}

return Config
