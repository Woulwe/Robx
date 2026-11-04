local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage:WaitForChild("DigTheWorld"):WaitForChild("Config"))
local Store = DataStoreService:GetDataStore("DigTheWorld_PlayerData_v1")

local remotes = Instance.new("Folder")
remotes.Name = "DigTheWorldRemotes"
remotes.Parent = ReplicatedStorage

local digEvent = Instance.new("RemoteEvent")
digEvent.Name = "Dig"
digEvent.Parent = remotes

local actionEvent = Instance.new("RemoteEvent")
actionEvent.Name = "Action"
actionEvent.Parent = remotes

local resultEvent = Instance.new("RemoteEvent")
resultEvent.Name = "Result"
resultEvent.Parent = remotes

local field = Workspace:FindFirstChild("DigField") or Instance.new("Folder")
field.Name = "DigField"
field.Parent = Workspace

local lastDig = {}
local playerData = {}

local function makePart(parent, name, size, cframe, color, material)
    local part = Instance.new("Part")
    part.Name = name
    part.Size = size
    part.CFrame = cframe
    part.Color = color
    part.Material = material
    part.Anchored = true
    part.TopSurface = Enum.SurfaceType.Smooth
    part.BottomSurface = Enum.SurfaceType.Smooth
    part.Parent = parent
    return part
end

local function layerAt(depth)
    local index = math.clamp(math.floor(depth / 8) + 1, 1, #Config.Layers)
    return Config.Layers[index]
end

local function createField()
    if #field:GetChildren() > 0 then return end
    local half = Config.FieldSize / 2
    for x = -half, half - 1 do
        for z = -half, half - 1 do
            local block = makePart(field, "DigBlock", Vector3.new(Config.BlockSize, 4, Config.BlockSize),
                CFrame.new(x * Config.BlockSize, 1, z * Config.BlockSize),
                Config.Layers[1].Color, Config.Layers[1].Material)
            block:SetAttribute("Depth", 0)
            block:SetAttribute("Health", Config.Layers[1].Health)
            block:SetAttribute("MaxHealth", Config.Layers[1].Health)
            block:SetAttribute("IsDiggable", true)
        end
    end
    makePart(Workspace, "GroundBase", Vector3.new(Config.FieldSize * 4 + 80, 8, Config.FieldSize * 4 + 80),
        CFrame.new(0, -5, 0), Color3.fromRGB(40, 43, 47), Enum.Material.Rock)
    
    local spawn = Workspace:FindFirstChildOfClass("SpawnLocation")
    if not spawn then
        spawn = Instance.new("SpawnLocation")
        spawn.Name = "DigSpawn"
        spawn.Size = Vector3.new(12, 1, 12)
        spawn.Position = Vector3.new(0, 5, -Config.FieldSize * 2 - 16)
        spawn.Anchored = true
        spawn.Neutral = true
        spawn.Parent = Workspace
    end
    makePart(Workspace, "SellPad", Vector3.new(14, 1, 14), CFrame.new(0, 0.5, -Config.FieldSize * 2 - 36),
        Color3.fromRGB(50, 190, 130), Enum.Material.Neon)
    makePart(Workspace, "UpgradePad", Vector3.new(14, 1, 14), CFrame.new(20, 0.5, -Config.FieldSize * 2 - 36),
        Color3.fromRGB(75, 145, 255), Enum.Material.Neon)
end

local function chooseFind()
    local roll = math.random(1, 100)
    local total = 0
    for _, item in ipairs(Config.Finds) do
        total += item.Chance
        if roll <= total then return item end
    end
    return Config.Finds[1]
end

local function updateStats(player)
    local data = playerData[player]
    if not data then return end
    local stats = player:FindFirstChild("leaderstats")
    if stats then
        stats.Coins.Value = data.Coins
        stats.Depth.Value = data.Depth
    end
    resultEvent:FireClient(player, "Stats", {
        Coins = data.Coins, Depth = data.Depth, BagValue = data.BagValue,
        BagCount = data.BagCount, Shovel = Config.Shovels[data.Shovel].Name,
        Power = Config.Shovels[data.Shovel].Power
    })
end

local function loadPlayer(player)
    local data = {Coins = Config.StartingCoins, Depth = 0, BagValue = 0, BagCount = 0, Shovel = 1}
    local ok, saved = pcall(function() return Store:GetAsync("u_" .. player.UserId) end)
    if ok and type(saved) == "table" then
        data.Coins = tonumber(saved.Coins) or data.Coins
        data.Depth = tonumber(saved.Depth) or 0
        data.Shovel = math.clamp(tonumber(saved.Shovel) or 1, 1, #Config.Shovels)
    end
    playerData[player] = data
    local stats = Instance.new("Folder")
    stats.Name = "leaderstats"
    stats.Parent = player
    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = data.Coins
    coins.Parent = stats
    local depth = Instance.new("IntValue")
    depth.Name = "Depth"
    depth.Value = data.Depth
    depth.Parent = stats
    updateStats(player)
end

local function savePlayer(player)
    local data = playerData[player]
    if not data then return end
    pcall(function()
        Store:SetAsync("u_" .. player.UserId, {
            Coins = data.Coins, Depth = data.Depth, Shovel = data.Shovel
        })
    end)
end

local function validDig(player, block)
    if typeof(block) ~= "Instance" or not block:IsA("BasePart") then return false end
    if not block:IsDescendantOf(field) or block:GetAttribute("IsDiggable") ~= true then return false end
    local character = player.Character
    local root = character and character:FindFirstChild("HumanoidRootPart")
    if not root or (root.Position - block.Position).Magnitude > Config.MaxDigDistance then return false end
    return true
end

digEvent.OnServerEvent:Connect(function(player, block)
    local now = os.clock()
    if lastDig[player] and now - lastDig[player] < Config.DigCooldown then return end
    if not validDig(player, block) then return end
    lastDig[player] = now
    local data = playerData[player]
    if not data then return end

    local power = Config.Shovels[data.Shovel].Power
    local health = (block:GetAttribute("Health") or 1) - power
    block:SetAttribute("Health", health)

    local dust = Instance.new("ParticleEmitter")
    dust.Texture = "rbxasset://textures/particles/smoke_main.dds"
    dust.Lifetime = NumberRange.new(0.2, 0.45)
    dust.Speed = NumberRange.new(2, 5)
    dust.Rate = 0
    dust.Parent = block
    dust:Emit(8)
    game:GetService("Debris"):AddItem(dust, 1)

    if health <= 0 then
        local depth = (block:GetAttribute("Depth") or 0) + 4
        data.Depth = math.max(data.Depth, depth)
        local found = chooseFind()
        data.BagValue += found.Value
        data.BagCount += 1
        local position = block.Position
        block:Destroy()
        resultEvent:FireClient(player, "Found", {
            Name = found.Name, Value = found.Value, Rarity = found.Rarity, Color = found.Color.Name
        })
        local layer = layerAt(depth)
        local replacement = makePart(field, "DigBlock", Vector3.new(Config.BlockSize, 4, Config.BlockSize),
            CFrame.new(position.X, position.Y - 4, position.Z), layer.Color, layer.Material)
        replacement:SetAttribute("Depth", depth)
        replacement:SetAttribute("Health", layer.Health)
        replacement:SetAttribute("MaxHealth", layer.Health)
        replacement:SetAttribute("IsDiggable", true)
    end
    updateStats(player)
end)

actionEvent.OnServerEvent:Connect(function(player, action)
    local data = playerData[player]
    if not data then return end
    if action == "Sell" then
        if data.BagValue > 0 then
            data.Coins += data.BagValue
            data.BagValue = 0
            data.BagCount = 0
            resultEvent:FireClient(player, "Message", "Finds sold!")
        end
    elseif action == "Upgrade" then
        local nextIndex = data.Shovel + 1
        local nextShovel = Config.Shovels[nextIndex]
        if nextShovel and data.Coins >= nextShovel.Price then
            data.Coins -= nextShovel.Price
            data.Shovel = nextIndex
            resultEvent:FireClient(player, "Message", "New tool: " .. nextShovel.Name)
        else
            resultEvent:FireClient(player, "Message", nextShovel and "Not enough coins" or "Maximum tool reached")
        end
    end
    updateStats(player)
end)

createField()
Players.PlayerAdded:Connect(loadPlayer)
Players.PlayerRemoving:Connect(function(player)
    savePlayer(player)
    playerData[player] = nil
    lastDig[player] = nil
end)
game:BindToClose(function()
    for _, player in ipairs(Players:GetPlayers()) do savePlayer(player) end
end)

local lighting = game:GetService("Lighting")
lighting.Technology = Enum.Technology.Future
lighting.ClockTime = 15.5
lighting.Brightness = 2
lighting.EnvironmentDiffuseScale = 0.35
lighting.EnvironmentSpecularScale = 0.6
lighting.GlobalShadows = true
lighting.Ambient = Color3.fromRGB(90, 94, 105)
lighting.OutdoorAmbient = Color3.fromRGB(135, 140, 150)
local atmosphere = lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere")
atmosphere.Density = 0.28
atmosphere.Offset = 0.1
atmosphere.Color = Color3.fromRGB(199, 211, 225)
atmosphere.Decay = Color3.fromRGB(95, 108, 130)
atmosphere.Parent = lighting
