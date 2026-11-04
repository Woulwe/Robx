local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("DigTheWorldRemotes")
local digEvent = remotes:WaitForChild("Dig")
local actionEvent = remotes:WaitForChild("Action")
local resultEvent = remotes:WaitForChild("Result")

local gui = Instance.new("ScreenGui")
gui.Name = "DigTheWorldUI"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local function makeLabel(name, text, position, size, parent)
    local label = Instance.new("TextLabel")
    label.Name = name
    label.Text = text
    label.Position = position
    label.Size = size
    label.BackgroundColor3 = Color3.fromRGB(20, 25, 31)
    label.BackgroundTransparency = 0.18
    label.TextColor3 = Color3.fromRGB(245, 247, 250)
    label.TextScaled = true
    label.Font = Enum.Font.GothamBold
    label.Parent = parent
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 12)
    corner.Parent = label
    return label
end

local stats = makeLabel("Stats", "DIG THE WORLD  |  Loading...", UDim2.fromScale(0.02, 0.03), UDim2.fromScale(0.48, 0.075), gui)
local notice = makeLabel("Notice", "", UDim2.fromScale(0.28, 0.15), UDim2.fromScale(0.44, 0.07), gui)
notice.Visible = false

local function makeButton(name, text, pos, size, callback)
    local button = Instance.new("TextButton")
    button.Name = name
    button.Text = text
    button.Position = pos
    button.Size = size
    button.BackgroundColor3 = Color3.fromRGB(35, 112, 87)
    button.TextColor3 = Color3.new(1, 1, 1)
    button.TextScaled = true
    button.Font = Enum.Font.GothamBold
    button.Parent = gui
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 16)
    corner.Parent = button
    button.Activated:Connect(callback)
    return button
end

local isTouch = UserInputService.TouchEnabled
local digButton = makeButton("DigButton", "DIG", UDim2.fromScale(0.80, 0.72), UDim2.fromScale(0.16, 0.18), function()
    local camera = workspace.CurrentCamera
    local center = camera.ViewportSize / 2
    local ray = camera:ViewportPointToRay(center.X, center.Y)
    local params = RaycastParams.new()
    params.FilterType = Enum.RaycastFilterType.Exclude
    params.FilterDescendantsInstances = {player.Character}
    local hit = workspace:Raycast(ray.Origin, ray.Direction * 24, params)
    if hit and hit.Instance and hit.Instance:GetAttribute("IsDiggable") then
        digEvent:FireServer(hit.Instance)
    end
end)
digButton.Visible = isTouch

makeButton("SellButton", "SELL FINDS", UDim2.fromScale(0.02, 0.78), UDim2.fromScale(0.19, 0.09), function()
    actionEvent:FireServer("Sell")
end)
makeButton("UpgradeButton", "UPGRADE", UDim2.fromScale(0.02, 0.89), UDim2.fromScale(0.19, 0.09), function()
    actionEvent:FireServer("Upgrade")
end)

local function tryDig()
    if isTouch then return end
    local camera = workspace.CurrentCamera
    local center = camera.ViewportSize / 2
    local ray = camera:ViewportPointToRay(center.X, center.Y)
    local params = RaycastParams.new()
    params.FilterType = Enum.RaycastFilterType.Exclude
    params.FilterDescendantsInstances = {player.Character}
    local hit = workspace:Raycast(ray.Origin, ray.Direction * 24, params)
    if hit and hit.Instance and hit.Instance:GetAttribute("IsDiggable") then
        digEvent:FireServer(hit.Instance)
    end
end

UserInputService.InputBegan:Connect(function(input, processed)
    if processed then return end
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.KeyCode == Enum.KeyCode.E then
        tryDig()
    end
end)

local noticeToken = 0
local function showNotice(message)
    noticeToken += 1
    local token = noticeToken
    notice.Text = message
    notice.Visible = true
    task.delay(2.2, function()
        if token == noticeToken then notice.Visible = false end
    end)
end

resultEvent.OnClientEvent:Connect(function(kind, payload)
    if kind == "Stats" then
        stats.Text = string.format("DIG THE WORLD  |  $%d  |  DEPTH %dm  |  BAG %d", payload.Coins, payload.Depth, payload.BagCount)
    elseif kind == "Found" then
        showNotice("FOUND: " .. payload.Name .. "  +" .. payload.Value .. " coins  [" .. payload.Rarity .. "]")
    elseif kind == "Message" then
        showNotice(payload)
    end
end)
