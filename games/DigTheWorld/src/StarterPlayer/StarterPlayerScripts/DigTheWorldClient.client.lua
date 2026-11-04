local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("DigTheWorldRemotes")
local digEvent = remotes:WaitForChild("Dig")
local actionEvent = remotes:WaitForChild("Action")
local resultEvent = remotes:WaitForChild("Result")

local C = {
    bg = Color3.fromRGB(12,16,22), panel = Color3.fromRGB(23,30,40),
    panel2 = Color3.fromRGB(34,44,57), line = Color3.fromRGB(72,88,105),
    white = Color3.fromRGB(242,246,250), muted = Color3.fromRGB(153,168,183),
    gold = Color3.fromRGB(255,190,70), cyan = Color3.fromRGB(65,205,225),
    green = Color3.fromRGB(93,218,145), purple = Color3.fromRGB(171,128,255)
}
local state = {Coins=0, Depth=0, BagCount=0, BagValue=0, Shovel="Стартовая лопата", Power=1}
local currentTarget, progress = nil, 0
local gui = Instance.new("ScreenGui")
gui.Name, gui.ResetOnSpawn, gui.IgnoreGuiInset, gui.DisplayOrder = "DigTheWorldHUD", false, true, 30
gui.Parent = player:WaitForChild("PlayerGui")

local root = Instance.new("Frame")
root.Name, root.Size, root.BackgroundTransparency = "Root", UDim2.fromScale(1,1), 1
root.Parent = gui
local scale = Instance.new("UIScale")
scale.Parent = root

local function round(o, r)
    local x=Instance.new("UICorner"); x.CornerRadius=UDim.new(0,r or 12); x.Parent=o
end
local function outline(o)
    local x=Instance.new("UIStroke"); x.Color=C.line; x.Transparency=.28; x.Thickness=1; x.Parent=o
end
local function frame(parent,name,size,pos,color)
    local x=Instance.new("Frame"); x.Name=name; x.Size=size; x.Position=pos
    x.BackgroundColor3=color or C.panel; x.BorderSizePixel=0; x.Parent=parent; round(x,14); return x
end
local function label(parent,text,size,pos,font,color,align)
    local x=Instance.new("TextLabel"); x.BackgroundTransparency=1; x.Size=size; x.Position=pos
    x.Text=text; x.Font=font or Enum.Font.GothamMedium; x.TextColor3=color or C.white
    x.TextSize=14; x.TextXAlignment=align or Enum.TextXAlignment.Left
    x.TextYAlignment=Enum.TextYAlignment.Center; x.TextWrapped=true; x.Parent=parent; return x
end
local function button(parent,text,size,pos,color)
    local x=Instance.new("TextButton"); x.Size=size; x.Position=pos; x.BackgroundColor3=color or C.panel2
    x.BorderSizePixel=0; x.Text=text; x.TextColor3=C.white; x.TextSize=14
    x.Font=Enum.Font.GothamBold; x.AutoButtonColor=true; x.Parent=parent; round(x,11); outline(x); return x
end

-- Header and live stats
local top=frame(root,"TopBar",UDim2.new(1,-28,0,62),UDim2.new(0,14,0,14),C.bg); outline(top)
local brand=label(top,"⛏  DIG THE WORLD",UDim2.new(.34,0,1,0),UDim2.new(0,18,0,0),Enum.Font.GothamBlack,C.white)
brand.TextSize=17
local statBox=frame(top,"Stats",UDim2.new(0,370,0,42),UDim2.new(1,-384,.5,-21),C.panel2)
local coins=label(statBox,"◈  0",UDim2.new(.25,0,1,0),UDim2.new(0,12,0,0),Enum.Font.GothamBold,C.gold)
local depth=label(statBox,"↓ 0 м",UDim2.new(.23,0,1,0),UDim2.new(.27,0,0,0),Enum.Font.GothamBold,C.cyan)
local tool=label(statBox,"⛏ Лопата",UDim2.new(.49,0,1,0),UDim2.new(.51,0,0,0),Enum.Font.GothamBold,C.white)

-- Left navigation
local nav=frame(root,"Navigation",UDim2.new(0,76,0,310),UDim2.new(0,14,.5,-155),C.bg); outline(nav)
local navList=Instance.new("UIListLayout"); navList.Padding=UDim.new(0,9)
navList.HorizontalAlignment=Enum.HorizontalAlignment.Center; navList.SortOrder=Enum.SortOrder.LayoutOrder; navList.Parent=nav
local pad=Instance.new("UIPadding"); pad.PaddingTop=UDim.new(0,9); pad.Parent=nav

-- Dig action and progress
local mining=frame(root,"MiningPanel",UDim2.new(0,340,0,142),UDim2.new(.5,-170,1,-164),C.bg); outline(mining)
label(mining,"ТЕКУЩИЙ БЛОК",UDim2.new(1,-28,0,20),UDim2.new(0,14,0,8),Enum.Font.GothamBold,C.muted)
local blockName=label(mining,"Прицелься на блок",UDim2.new(1,-28,0,24),UDim2.new(0,14,0,29),Enum.Font.GothamBold,C.white)
blockName.TextSize=15
local bar=frame(mining,"ProgressBack",UDim2.new(1,-28,0,10),UDim2.new(0,14,0,60),C.panel2)
local fill=frame(bar,"Fill",UDim2.new(0,0,1,0),UDim2.new(),C.cyan); fill.Size=UDim2.new(0,0,1,0)
local pct=label(mining,"0%",UDim2.new(1,-28,0,18),UDim2.new(0,14,0,72),Enum.Font.GothamMedium,C.muted)
pct.TextSize=12
local digButton=button(mining,"⛏  КОПАТЬ",UDim2.new(1,-28,0,38),UDim2.new(0,14,0,96),C.cyan)
digButton.TextColor3=C.bg

-- Backpack / sell
local bag=frame(root,"Backpack",UDim2.new(0,180,0,132),UDim2.new(1,-194,1,-152),C.bg); outline(bag)
label(bag,"РЮКЗАК",UDim2.new(1,-24,0,18),UDim2.new(0,12,0,8),Enum.Font.GothamBold,C.muted)
local bagCount=label(bag,"0 предметов",UDim2.new(1,-24,0,26),UDim2.new(0,12,0,27),Enum.Font.GothamBlack,C.white); bagCount.TextSize=18
local bagValue=label(bag,"Стоимость: 0 ◈",UDim2.new(1,-24,0,18),UDim2.new(0,12,0,53),Enum.Font.GothamMedium,C.gold); bagValue.TextSize=12
local sell=button(bag,"ПРОДАТЬ",UDim2.new(1,-24,0,34),UDim2.new(0,12,0,82),C.gold)
sell.TextColor3=C.bg

-- Modal pages
local modal=frame(root,"Modal",UDim2.new(0,390,0,410),UDim2.new(.5,-195,.5,-205),C.bg); modal.Visible=false; outline(modal)
local title=label(modal,"ИНВЕНТАРЬ",UDim2.new(1,-65,0,42),UDim2.new(0,18,0,8),Enum.Font.GothamBlack,C.white); title.TextSize=19
local close=button(modal,"✕",UDim2.new(0,36,0,36),UDim2.new(1,-48,0,10),C.panel2)
local body=frame(modal,"Body",UDim2.new(1,-28,1,-66),UDim2.new(0,14,0,54),C.panel)
local function clearBody()
    for _,v in ipairs(body:GetChildren()) do if v:IsA("GuiObject") then v:Destroy() end end
end
local function bodyText(text,y,color)
    return label(body,text,UDim2.new(1,-24,0,48),UDim2.new(0,12,0,y),Enum.Font.GothamMedium,color or C.white)
end
local function showPage(page)
    modal.Visible=true; title.Text=string.upper(page); clearBody()
    if page=="Инвентарь" then
        bodyText("ДОБЫЧА В РЮКЗАКЕ",8,C.muted)
        bodyText("🪨  Найдено предметов: "..state.BagCount,66)
        bodyText("◈  Общая стоимость: "..state.BagValue.." монет",120,C.gold)
        bodyText("Продай находки на зелёной площадке SELL на поверхности.",190,C.muted)
    elseif page=="Кирка" then
        bodyText("ТЕКУЩИЙ ИНСТРУМЕНТ",8,C.muted)
        bodyText("⛏  "..state.Shovel,65)
        bodyText("Сила инструмента: "..state.Power,120,C.cyan)
        bodyText("Улучшай инструмент на синей площадке UPGRADE.",190,C.muted)
    elseif page=="Магазин" then
        bodyText("УЛУЧШЕНИЕ ИНСТРУМЕНТА",8,C.muted)
        bodyText("Следующая кирка покупается на синей площадке UPGRADE.",65)
        bodyText("Стоимость и доступность проверяет сервер. Текущие монеты: "..state.Coins,125,C.gold)
        local b=button(body,"ОБНОВИТЬ ИНСТРУМЕНТ",UDim2.new(1,-24,0,44),UDim2.new(0,12,0,215),C.cyan)
        b.TextColor3=C.bg; b.Activated:Connect(function() actionEvent:FireServer("Upgrade") end)
    elseif page=="Задания" then
        bodyText("ЕЖЕДНЕВНЫЕ ЦЕЛИ",8,C.muted)
        bodyText("⛏  Добудь блоки и исследуй глубины.",62)
        bodyText("💎  Ищи редкие находки — они дороже.",120)
        bodyText("⬇  Спускайся глубже, чтобы найти новые породы.",178)
    elseif page=="Настройки" then
        bodyText("УПРАВЛЕНИЕ",8,C.muted)
        bodyText("Телефон: нажми кнопку КОПАТЬ, целясь в блок.",62)
        bodyText("ПК: наведи прицел на блок и нажми ЛКМ или E.",120)
        bodyText("Продажа и улучшение доступны у площадок на поверхности.",178)
    end
end
close.Activated:Connect(function() modal.Visible=false end)

local function refresh()
    coins.Text="◈  "..state.Coins
    depth.Text="↓ "..state.Depth.." м"
    tool.Text="⛏ "..state.Shovel
    bagCount.Text=state.BagCount.." предметов"
    bagValue.Text="Стоимость: "..state.BagValue.." ◈"
end
local function targetBlock()
    local camera=workspace.CurrentCamera
    if not camera then return nil end
    local size=camera.ViewportSize
    local ray=camera:ViewportPointToRay(size.X/2,size.Y/2)
    local params=RaycastParams.new()
    params.FilterType=Enum.RaycastFilterType.Exclude
    params.FilterDescendantsInstances={player.Character}
    local hit=workspace:Raycast(ray.Origin,ray.Direction*24,params)
    if hit and hit.Instance and hit.Instance:GetAttribute("IsDiggable")==true then return hit.Instance end
    return nil
end
local function doDig()
    local block=targetBlock()
    if not block then
        blockName.Text="Наведи прицел на блок"
        return
    end
    if currentTarget~=block then currentTarget=block; progress=0 end
    local health=block:GetAttribute("Health") or 1
    local d=block:GetAttribute("Depth") or 0
    local maxHealth=math.min(16,1+math.floor(d/100))
    progress=math.clamp((maxHealth-health+state.Power)/maxHealth,0,1)
    fill:TweenSize(UDim2.new(progress,0,1,0),Enum.EasingDirection.Out,Enum.EasingStyle.Quad,.12,true)
    pct.Text=math.floor(progress*100).."%"
    blockName.Text="Слой "..math.floor(d/4).."  •  "..math.max(0,health-state.Power).." HP"
    digEvent:FireServer(block)
    if health<=state.Power then
        currentTarget=nil; progress=0
        task.delay(.12,function() fill.Size=UDim2.new(0,0,1,0); pct.Text="Новый блок" end)
    end
end
digButton.Activated:Connect(doDig)
sell.Activated:Connect(function() actionEvent:FireServer("Sell") end)

local tabs={{"⌂","Инвентарь"},{"⛏","Кирка"},{"▣","Магазин"},{"☆","Задания"},{"⚙","Настройки"}}
for i,item in ipairs(tabs) do
    local b=button(nav,item[1],UDim2.new(0,54,0,48),UDim2.new(),C.panel2)
    b.LayoutOrder=i; b.TextSize=21
    b.Activated:Connect(function() showPage(item[2]) end)
end
UserInputService.InputBegan:Connect(function(input,processed)
    if processed or UserInputService.TouchEnabled then return end
    if input.UserInputType==Enum.UserInputType.MouseButton1 or input.KeyCode==Enum.KeyCode.E then doDig() end
end)

local notice=label(root,"",UDim2.new(.6,0,0,44),UDim2.new(.2,0,.15,0),Enum.Font.GothamBold,C.white,Enum.TextXAlignment.Center)
notice.BackgroundColor3=C.panel; notice.BackgroundTransparency=.08; notice.Visible=false; round(notice,12); outline(notice)
local noticeId=0
local function showNotice(text)
    noticeId+=1; local id=noticeId; notice.Text=text; notice.Visible=true
    task.delay(2.5,function() if id==noticeId then notice.Visible=false end end)
end

resultEvent.OnClientEvent:Connect(function(kind,payload)
    if kind=="Stats" then
        for k,v in pairs(payload) do state[k]=v end
        refresh()
    elseif kind=="Found" then
        showNotice("НАЙДЕНО: "..payload.Name.."  +"..payload.Value.." ◈  •  "..payload.Rarity)
    elseif kind=="Message" then
        showNotice(payload)
    end
end)

local function resize()
    local camera=workspace.CurrentCamera
    if not camera then return end
    local v=camera.ViewportSize
    local f=math.min(v.X/950,v.Y/650,1)
    scale.Scale=math.clamp(f,.62,1)
    if v.X<650 then
        top.Size=UDim2.new(1,-16,0,54); top.Position=UDim2.new(0,8,0,8)
        brand.TextSize=13; statBox.Size=UDim2.new(0,238,0,38); statBox.Position=UDim2.new(1,-246,.5,-19)
        coins.Size=UDim2.new(.27,0,1,0); depth.Size=UDim2.new(.23,0,1,0); tool.Size=UDim2.new(.49,0,1,0)
        nav.Size=UDim2.new(0,58,0,260); nav.Position=UDim2.new(0,8,.5,-130)
        mining.Size=UDim2.new(0,250,0,132); mining.Position=UDim2.new(.5,-125,1,-140)
        bag.Size=UDim2.new(0,128,0,112); bag.Position=UDim2.new(1,-136,1,-120)
        bagValue.Visible=false; sell.TextSize=11
        modal.Size=UDim2.new(0,math.min(v.X-24,390),0,math.min(v.Y-90,410))
        modal.Position=UDim2.new(.5,-modal.Size.X.Offset/2,.5,-modal.Size.Y.Offset/2)
    else
        top.Size=UDim2.new(1,-28,0,62); top.Position=UDim2.new(0,14,0,14)
        brand.TextSize=17; statBox.Size=UDim2.new(0,370,0,42); statBox.Position=UDim2.new(1,-384,.5,-21)
        nav.Size=UDim2.new(0,76,0,310); nav.Position=UDim2.new(0,14,.5,-155)
        mining.Size=UDim2.new(0,340,0,142); mining.Position=UDim2.new(.5,-170,1,-164)
        bag.Size=UDim2.new(0,180,0,132); bag.Position=UDim2.new(1,-194,1,-152)
        bagValue.Visible=true; sell.TextSize=14
        modal.Size=UDim2.new(0,390,0,410); modal.Position=UDim2.new(.5,-195,.5,-205)
    end
end
refresh(); resize()
if workspace.CurrentCamera then workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(resize) end
