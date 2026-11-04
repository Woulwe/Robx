import { generateWorld as generateIslandWorld } from "./src/generator.js";
// Robx AI Core: deterministic semantic planner. Runs entirely in the browser; no API keys or external AI service.
const lex = {
 island: ["остров","архипелаг","island"], city:["город","мегаполис","улиц","city","town"], forest:["лес","лесн","джунгл","forest","jungle"], desert:["пустын","саванн","desert"], snow:["снег","лед","арктик","зим","snow","ice"], fantasy:["фэнтези","маг","дракон","эльф","волшеб","fantasy","magic","dragon"], scifi:["космос","футур","космич","sci-fi","space"], survival:["выжив","голод","жажд","survival"], horror:["ужас","хоррор","страш","horror"], medieval:["средневек","замок","рыцар","medieval","castle"], pirate:["пират","кораб","порт","pirate","ship"], war:["войн","военн","база","оруж","war","military"], parkour:["паркур","обби","прыж","obby","parkour"], village:["деревн","посел","ферм","village","farm"], cave:["пещер","шахт","рудник","cave","mine"], river:["река","озер","водопад","ручей","river","lake","waterfall"], mountain:["гор","скал","вершин","mountain","cliff"], beach:["пляж","берег","побереж","beach","coast"], dungeon:["подземел","данж","лабиринт","dungeon"], boss:["босс","дракон","гигант","boss"], animals:["животн","волк","олень","медвед","звер","animal","wolf","deer"], npc:["npc","жител","торгов","персонаж"], quest:["квест","задан","мисси","quest","mission"], roads:["дорог","троп","шоссе","road","path"], realistic:["реалист","реальн","детализ","realistic"], large:["огром","больш","масштаб","гигант","large","huge"]
};
const hit=(s,words)=>words.some(w=>s.includes(w));
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function noise(x,z,seed){const v=Math.sin(x*127.1+z*311.7+seed*.001)*43758.5453;return (v-Math.floor(v))*2-1}
function smooth(x){return x*x*(3-2*x)}
export function analyzePrompt(prompt){
 const s=prompt.toLowerCase(),tags=Object.keys(lex).filter(k=>hit(s,lex[k]));
 let genre=tags.includes("horror")?"horror":tags.includes("fantasy")?"fantasy":tags.includes("scifi")?"sci-fi":tags.includes("war")?"military":tags.includes("parkour")?"obby":tags.includes("survival")?"survival":tags.includes("medieval")?"medieval":"adventure";
 let biome=tags.includes("snow")?"snow":tags.includes("desert")?"desert":tags.includes("city")?"urban":tags.includes("forest")?"forest":tags.includes("island")?"temperate-island":tags.includes("fantasy")?"enchanted":"temperate";
 const scale=tags.includes("large")?300:220;
 const objectsWanted=[];
 for(const [key,label] of [["mountain","горы"],["river","реки и озёра"],["cave","пещеры"],["village","поселения"],["animals","животные"],["npc","NPC"],["quest","квестовые точки"],["boss","босс"],["beach","пляжи"],["roads","дороги"]])if(tags.includes(key))objectsWanted.push(label);
 return {genre,biome,scale,tags,objectsWanted,seed:hash(prompt),difficulty:hit(s,["сложн","хардкор","hardcore"])?"hard":"normal",realistic:tags.includes("realistic"),summary:"Распознано: "+genre+" · "+biome+"; "+(objectsWanted.join(", ")||"исследование мира")+".",prompt};
}
export function buildWorld(prompt){
 if(/остров|island|архипелаг|выжив/i.test(prompt)) return generateIslandWorld(prompt);
 const plan=analyzePrompt(prompt),seed=plan.seed,rng=i=>{let x=Math.sin(seed*.00001+i*78.233)*43758.5453;return x-Math.floor(x)};
 const size=plan.scale,segments=64,heights=[],objects=[];
 const island=plan.tags.includes("island")||plan.biome==="temperate-island";
 const mountain=plan.tags.includes("mountain")||plan.genre==="fantasy";
 const water= island||plan.tags.includes("river")||plan.tags.includes("beach");
 const heightAt=(x,z)=>{const edge=island?Math.max(0,1-Math.pow(Math.max(Math.abs(x),Math.abs(z))/(size*.49),2.2)):1;let h=(noise(x*.035,z*.035,seed)*5+noise(x*.09,z*.09,seed+3)*1.7);if(mountain)h+=Math.max(0,1-Math.hypot(x+size*.18,z-size*.12)/(size*.48))*25;return Math.max(-2,h*edge+(island?-3:0))};
 for(let z=0;z<=segments;z++)for(let x=0;x<=segments;x++){const px=(x/segments-.5)*size,pz=(z/segments-.5)*size;heights.push(heightAt(px,pz))}
 const add=(type,name,x,z,sx,sy,sz,color,extra={})=>objects.push({id:objects.length+1,type,name,position:[x,heightAt(x,z)+sy/2,z],size:[sx,sy,sz],color,...extra});
 const rand=(min,max,i)=>min+rng(i)*(max-min);
 const groundColor=plan.biome==="snow"?"#dce8ec":plan.biome==="desert"?"#c6a064":plan.biome==="urban"?"#687887":plan.biome==="enchanted"?"#668b70":"#668b59";
 add("spawn","Точка появления",0,0,7,1,7,"#4de0a5");
 // forest patches are spatially clustered rather than evenly scattered
 const treeN=plan.tags.includes("large")?180:105;
 for(let i=0;i<treeN;i++){let x=rand(-size*.43,size*.43,i+10),z=rand(-size*.43,size*.43,i+300);if(Math.hypot(x,z)<18|| (island&&Math.max(Math.abs(x),Math.abs(z))>size*.39))continue;const h=rand(8,16,i+700);add("tree","Дерево",x,z,rand(1.3,2.2,i+900),h,rand(1.3,2.2,i+1000),plan.biome==="snow"?"#6d6256":"#76513a",{canopy:plan.biome==="snow"?"#dce9ed":plan.biome==="enchanted"?"#5a8f78":"#34784a",variant:i%2})}
 for(let i=0;i<42;i++){const x=rand(-size*.46,size*.46,i+1400),z=rand(-size*.46,size*.46,i+1700);if(island&&Math.max(Math.abs(x),Math.abs(z))>size*.43)continue;add("rock","Скала",x,z,rand(3,9,i+2000),rand(2,8,i+2200),rand(3,9,i+2400),"#858b8d")}
 if(water){add("water","Океан",0,0,size*1.25,.2,size*1.25,"#3c9dbb")}
 // settlements and points of interest
 const buildingCount=plan.tags.includes("city")?34:plan.tags.includes("village")?12:4;
 for(let i=0;i<buildingCount;i++){let x=plan.tags.includes("city")?((i%6)-2.5)*24:rand(-size*.3,size*.3,i+3000),z=plan.tags.includes("city")?(Math.floor(i/6)-2)*26:rand(-size*.3,size*.3,i+3300);if(Math.hypot(x,z)<20){x+=32;z+=22}const w=rand(10,18,i+3600),h=plan.tags.includes("city")?rand(15,42,i+3900):rand(7,13,i+4200);add("building",plan.tags.includes("city")?"Городское здание":"Дом поселения",x,z,w,h,w,plan.genre==="fantasy"?"#8876a8":"#9a7652",{roof:"#454d5c"})}
 if(plan.tags.includes("cave")||mountain){for(let i=0;i<5;i++){let x=rand(-size*.35,size*.35,i+5000),z=rand(-size*.35,size*.35,i+5300);add("cave","Вход в пещеру",x,z,12,7,5,"#30363b")}}
 if(plan.tags.includes("river")){for(let i=0;i<8;i++){let z=-size*.42+i*size*.12;add("water","Участок реки",Math.sin(i*.7)*18,z,12,.3,35,"#328fb7")}}
 if(plan.tags.includes("beach"))for(let i=0;i<18;i++){let a=i/18*Math.PI*2,x=Math.cos(a)*size*.39,z=Math.sin(a)*size*.39;add("path","Песчаный берег",x,z,18,.4,12,"#d5c18c")}
 const animalCount=plan.tags.includes("animals")?22:plan.genre==="survival"?10:4;
 for(let i=0;i<animalCount;i++){let x=rand(-size*.4,size*.4,i+6000),z=rand(-size*.4,size*.4,i+6300),wolf=plan.genre==="survival"&&i%4===0;add(wolf?"enemy":"animal",wolf?"Волк":"Дикое животное",x,z,3,2.8,4,wolf?"#68616c":"#b78e62")}
 for(let i=0;i<(plan.tags.includes("npc")?12:5);i++){let x=rand(-size*.3,size*.3,i+7000),z=rand(-size*.3,size*.3,i+7300);add("npc","Житель",x,z,2.5,5.5,2.2,"#d5a77e")}
 if(plan.tags.includes("boss")||plan.genre==="fantasy")add("enemy","Главный босс",size*.28,-size*.28,9,12,9,"#6e526e",{boss:true});
 for(let i=0;i<10;i++){let x=rand(-size*.4,size*.4,i+8000),z=rand(-size*.4,size*.4,i+8300);add("resource","Ресурс",x,z,2,3,2,i%2?"#b5a8a0":"#d3a94e")}
 for(let i=0;i<7;i++){let x=-size*.36+i*size*.12,z=Math.sin(i*.9)*size*.15;add("path","Дорога",x,z,5,.35,size*.15,"#b49a70")}
 add("checkpoint","Центр интереса",size*.1,size*.08,3,4,3,"#f4c95d");
 return {title:prompt.slice(0,60),prompt,theme:plan.genre,biome:plan.biome,plan,terrain:{size,segments,heights},objects,summary:plan.summary+" Создано объектов: "+objects.length+".",systems:["MobileControls","DayNightCycle","SurvivalStats","DataSave","NPCInteraction","QuestMarkers"],scripts:{"ServerScriptService/RobxWorld.server.lua":worldScript(plan)}};
}
function worldScript(plan){return `-- Generated by Robx AI Core
local Lighting = game:GetService("Lighting")
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local store = DataStoreService:GetDataStore("RobxWorldSave_v1")
Lighting.ClockTime = 8
task.spawn(function()
 while true do Lighting.ClockTime = (Lighting.ClockTime + 0.03) % 24; task.wait(1) end
end)
Players.PlayerAdded:Connect(function(player)
 local stats = Instance.new("Folder"); stats.Name = "leaderstats"; stats.Parent = player
 for _, name in ipairs({"Health","Food","Water"}) do local v=Instance.new("IntValue"); v.Name=name; v.Value=100; v.Parent=stats end
 local ok, data = pcall(function() return store:GetAsync(tostring(player.UserId)) end)
 if ok and type(data)=="table" then for k,v in pairs(data) do if stats:FindFirstChild(k) then stats[k].Value=v end end end
 task.spawn(function() while player.Parent do task.wait(45); if stats.Food.Value>0 then stats.Food.Value-=1 end; if stats.Water.Value>0 then stats.Water.Value-=2 end end end)
end)
Players.PlayerRemoving:Connect(function(player)
 local s=player:FindFirstChild("leaderstats"); if s then pcall(function() store:SetAsync(tostring(player.UserId),{Health=s.Health.Value,Food=s.Food.Value,Water=s.Water.Value}) end) end
end)
`}
export function exportPlace(world){
 const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 let id=0,parts=[];
 const part=(name,pos,size,color,shape="Block")=>{const [x,y,z]=pos,[sx,sy,sz]=size;const c=color.replace("#","");const r=parseInt(c.slice(0,2),16)/255,g=parseInt(c.slice(2,4),16)/255,b=parseInt(c.slice(4,6),16)/255;parts.push(`<Item class="Part" referent="RBX${++id}"><Properties><string name="Name">${esc(name)}</string><CoordinateFrame name="CFrame"><X>${x}</X><Y>${y}</Y><Z>${z}</Z><R00>1</R00><R01>0</R01><R02>0</R02><R10>0</R10><R11>1</R11><R12>0</R12><R20>0</R20><R21>0</R21><R22>1</R22></CoordinateFrame><Vector3 name="Size"><X>${sx}</X><Y>${sy}</Y><Z>${sz}</Z></Vector3><Color3 name="Color"><R>${r}</R><G>${g}</G><B>${b}</B></Color3><bool name="Anchored">true</bool><bool name="CanCollide">true</bool><token name="Shape">${shape==="Ball"?1:0}</token></Properties></Item>`)}
 for(const o of world.objects){if(o.type==="water"||o.type==="path"||o.type==="road"||o.type==="resource"||o.type==="checkpoint"||o.type==="building"||o.type==="rock"||o.type==="tree"||o.type==="spawn"){part(o.name,o.position,o.size,o.color)}else if(["npc","animal","enemy"].includes(o.type)){part(o.name+" Body",o.position,o.size,o.color)}}
 const scriptItems=Object.entries(world.scripts||{}).map(([path,source])=>{
  const name=path.split("/").pop(),safe=String(source).replaceAll("]]>","]]]]><![CDATA[>");
  return `<Item class="Script" referent="RBX${++id}"><Properties><string name="Name">${esc(name)}</string><ProtectedString name="Source"><![CDATA[${safe}]]></ProtectedString><bool name="Disabled">false</bool></Properties></Item>`;
 }).join("");
 const scriptService=scriptItems?`<Item class="ServerScriptService" referent="RBX90000"><Properties><string name="Name">ServerScriptService</string></Properties>${scriptItems}</Item>`:"";
 return `<?xml version="1.0" encoding="utf-8"?><roblox version="4"><Item class="Workspace" referent="RBX0"><Properties><string name="Name">Workspace</string></Properties>${parts.join("")}</Item>${scriptService}</roblox>`;
}
