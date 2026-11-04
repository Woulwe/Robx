const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=s=>[...s].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const noise=(x,z,seed)=>{const n=Math.sin(x*127.1+z*311.7+seed*.00013)*43758.5453;return (n-Math.floor(n))*2-1};
const smooth=t=>t*t*(3-2*t);

export function generateWorld(prompt){
 const text=String(prompt||"").toLowerCase(),seed=hash(prompt);
 const island=true;
 const title=String(prompt||"Остров").slice(0,54).replace(/[<>]/g,"")||"Остров выживания";
 const size=320,segments=48,heights=[],biomes=[];
 const heightAt=(x,z)=>{
   const nx=x/(size*.49),nz=z/(size*.49);
   const edge=Math.max(Math.abs(nx),Math.abs(nz));
   const coast=clamp((1-edge)/.19,0,1);
   const shape=Math.pow(Math.max(0,1-Math.pow(Math.abs(nx),3.2)-Math.pow(Math.abs(nz),3.2)),.48);
   const hills=noise(x*.035,z*.035,seed)*3.6+noise(x*.095,z*.095,seed+9)*1.1;
   const mountain=Math.max(0,1-Math.hypot(x+3,z+3)/75);
   const ridge=Math.max(0,1-Math.hypot(x-8,z+10)/43);
   return -3+coast*(7+shape*7+hills+mountain*43+ridge*17);
 };
 const biomeAt=(x,z,h)=>{
   if(h>19)return "snow";
   if(z < -95)return "snow";
   if(x>42&&z>48)return "desert";
   if(Math.max(Math.abs(x),Math.abs(z))>145)return "coast";
   return "forest";
 };
 for(let z=0;z<=segments;z++)for(let x=0;x<=segments;x++){
   const px=(x/segments-.5)*size,pz=(z/segments-.5)*size,h=heightAt(px,pz);
   heights.push(h);biomes.push(biomeAt(px,pz,h));
 }
 const objects=[];
 const add=(type,name,x,z,sx,sy,sz,color,extra={})=>{
   const y=(type==="water"&&name==="Океан")?-4:heightAt(x,z)+sy/2;
   objects.push({id:objects.length+1,type,name,position:[x,y,z],size:[sx,sy,sz],color,...extra});
 };
 // Surrounding sea and shoreline
 add("water","Океан",0,0,size*1.18,.5,size*1.18,"#176d83");
 add("spawn","Стартовая точка",0,0,8,1,8,"#4de0a5");
 // Main mountain massif in the middle, with snowy summit and rocky ridges
 for(let i=0;i<38;i++){
   const a=i/38*Math.PI*2,r=18+(i%5)*8,x=Math.cos(a)*r,z=Math.sin(a)*r;
   add("rock","Горный хребет",x,z,9+(i%4)*4,7+(i%5)*5,8+(i%3)*5,i%3?"#737b7b":"#d9e1e4");
 }
 // Dense forest regions, avoiding desert, snowfield and central mountain
 for(let i=0;i<210;i++){
   const x=-137+((seed+i*7919)>>>0)%274;
   const z=-137+((seed+i*104729)>>>0)%274;
   const h=heightAt(x,z);
   if(Math.hypot(x,z)<65||z< -103||(x>42&&z>48)||h<0)continue;
   const treeH=8+((i*7)%9);
   add("tree","Сосна",x,z,1.6,treeH,1.6,"#76513a",{canopy:"#286746"});
 }
 // Rivers and lakes
 for(let i=0;i<22;i++){
   const z=-68+i*6.2,x=Math.sin(i*.32)*43+20;
   add("water","Река",x,z,7,.22,15,"#368eaa");
 }
 add("water","Горное озеро",-24,51,27,.25,19,"#368eaa");
 add("water","Лесное озеро",-91,24,23,.25,17,"#368eaa");
 // Northern snowfield and southern-east desert
 for(let i=0;i<26;i++){
   const x=-105+(i*47%210),z=-133+(i*19%38);
   add("rock","Снежные скалы",x,z,5,2,5,"#e2e9ed");
 }
 for(let i=0;i<20;i++){
   const x=54+(i*17%83),z=57+(i*23%70);
   add("rock","Песчаные дюны",x,z,8+(i%4)*3,2,10+(i%3)*4,"#c7a36b");
 }
 // Settlements, ports, military and industrial sites
 const buildings=[
  ["Старый порт",-119,119,34,12,23,"#777d83"],
  ["Промышленная база",103,112,36,14,31,"#77736b"],
  ["Северная деревня",-58,-78,24,10,20,"#9b8062"],
  ["Лесная деревня",67,-58,26,9,23,"#987654"],
  ["Руины на западе",-105,-84,29,8,24,"#77716b"],
  ["Восточная крепость",125,-12,22,18,22,"#827b72"],
  ["Заброшенная станция",48,87,19,9,16,"#8a7861"],
  ["Южный аэродром",38,135,42,5,22,"#777c7c"]
 ];
 for(const [name,x,z,sx,sy,sz,color] of buildings)add("building",name,x,z,sx,sy,sz,color);
 // Roads connect settlements and coast
 add("road","Главная дорога",0,82,5,.4,130,"#9b8c70");
 add("road","Западная дорога",-72,15,5,.4,150,"#9b8c70");
 add("road","Восточная дорога",78,34,5,.4,130,"#9b8c70");
 // Small coastal watchtowers and islands
 for(let i=0;i<12;i++){
   const a=i*Math.PI/6,x=Math.cos(a)*151,z=Math.sin(a)*151;
   add("building","Маяк",x,z,5,12,5,"#ded7c5");
 }
 // Wildlife, NPCs, loot and exploration markers
 const kinds=["Олень","Кролик","Кабан","Волк"];
 for(let i=0;i<26;i++){
   const x=-125+((i*53+seed)%250),z=-120+((i*37+seed)%240),wolf=i%6===0;
   add(wolf?"enemy":"animal",wolf?"Волк":kinds[i%kinds.length],x,z,3,2.5,4,wolf?"#68616c":"#b78e62");
 }
 for(let i=0;i<10;i++){
   const x=-95+(i*41%190),z=-85+(i*29%170);
   add("npc",i===0?"Проводник":"Выживший",x,z,2.5,5.5,2.2,"#d5a77e");
 }
 for(let i=0;i<18;i++){
   const x=-130+(i*31%260),z=-120+(i*43%240);
   add("resource","Месторождение ресурсов",x,z,3,2.5,3,i%2?"#9b9fa3":"#d4a74f");
 }
 add("checkpoint","Первая цель",-12,16,4,5,4,"#f4c95d");
 const heightData=heights.map(v=>Math.round(v*10)/10);
 const terrainScript=`-- Robx: island terrain matching the supplied scene layout
local Terrain = workspace.Terrain
Terrain:Clear()
local heights = {${heightData.join(",")}}
local size, segments = ${size}, ${segments}
local step = size / segments
for z = 0, segments-1 do
 for x = 0, segments-1 do
  local i = z*(segments+1)+x+1
  local h = (heights[i]+heights[i+1]+heights[i+segments+1]+heights[i+segments+2])/4
  if h > -1 then
   local material = Enum.Material.Grass
   if h > 19 or z < 6 then material = Enum.Material.Snow
   elseif x > 30 and z > 30 then material = Enum.Material.Sand
   elseif h > 12 then material = Enum.Material.Rock end
   Terrain:FillBlock(CFrame.new(-size/2+(x+.5)*step,h/2,-size/2+(z+.5)*step),Vector3.new(step+0.2,math.max(2,h+3),step+0.2),material)
  end
 end
end
Terrain:FillBlock(CFrame.new(0,-5,0),Vector3.new(size*1.35,8,size*1.35),Enum.Material.Water)
`;
 const playerScript=`local Players=game:GetService("Players")
local DataStoreService=game:GetService("DataStoreService")
local store=DataStoreService:GetDataStore("RobxIslandSave_v1")
Players.PlayerAdded:Connect(function(player)
 local stats=Instance.new("Folder");stats.Name="leaderstats";stats.Parent=player
 for _,n in ipairs({"Food","Water"}) do local v=Instance.new("IntValue");v.Name=n;v.Value=100;v.Parent=stats end
 local ok,data=pcall(function() return store:GetAsync(tostring(player.UserId)) end)
 if ok and type(data)=="table" then for k,v in pairs(data) do if stats:FindFirstChild(k) then stats[k].Value=v end end end
 task.spawn(function() while player.Parent do task.wait(45);stats.Food.Value=math.max(0,stats.Food.Value-1);stats.Water.Value=math.max(0,stats.Water.Value-2) end end)
end)
local function save(p) local s=p:FindFirstChild("leaderstats");if s then pcall(function() store:SetAsync(tostring(p.UserId),{Food=s.Food.Value,Water=s.Water.Value}) end) end end
Players.PlayerRemoving:Connect(save)
game:BindToClose(function() for _,p in ipairs(Players:GetPlayers()) do save(p) end end)
`;
 return {title,prompt,seed,theme:"island-survival",summary:"Стартовая сцена: большой остров с центральным горным массивом, северными снегами, юго-восточной пустыней, лесами, реками, портом и поселениями. Создано объектов: "+objects.length+".",terrain:{size,segments,heights:heightData,biomes},objects,systems:["IslandTerrain","MobileControls","DayNightCycle","SurvivalStats","DataSave","NPCInteraction","QuestMarkers"],scripts:{"ServerScriptService/IslandTerrain.server.lua":terrainScript,"ServerScriptService/PlayerData.server.lua":playerScript}};
}
