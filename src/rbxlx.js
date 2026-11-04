const esc = (s) => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const rgb = (hex) => { const h = String(hex || "#888888").replace("#",""); return [0,2,4].map(i => parseInt(h.slice(i,i+2),16) || 0); };
function part(item, ref) {
  const [x,y,z] = item.position, [sx,sy,sz] = item.size, [r,g,b] = rgb(item.color);
  return `<Item class="Part" referent="RBX${ref}"><Properties>
    <string name="Name">${esc(item.name)}</string><bool name="Anchored">true</bool><bool name="CanCollide">true</bool>
    <Vector3 name="Size"><X>${sx}</X><Y>${sy}</Y><Z>${sz}</Z></Vector3>
    <CoordinateFrame name="CFrame"><X>${x}</X><Y>${y}</Y><Z>${z}</Z><R00>1</R00><R01>0</R01><R02>0</R02><R10>0</R10><R11>1</R11><R12>0</R12><R20>0</R20><R21>0</R21><R22>1</R22></CoordinateFrame>
    <Color3uint8 name="Color3uint8">${r}, ${g}, ${b}</Color3uint8><token name="Material">256</token>
  </Properties></Item>`;
}
function modelItem(o, ref) {
  const [x,y,z] = o.position, [sx,sy,sz] = o.size;
  const humanoid = o.type === "npc" ? '<Item class="Humanoid" referent="RBX'+(ref+3)+'"><Properties><string name="Name">Humanoid</string></Properties></Item>' : "";
  return `<Item class="Model" referent="RBX${ref}"><Properties><string name="Name">${esc(o.name)}</string></Properties>
    ${part({name:"HumanoidRootPart",position:[x,y,z],size:[1.8,2.2,1.2],color:"#777777"},ref+1)}
    ${part({name:o.name+" Body",position:[x,y+1.3,z],size:[sx,sy*.58,sz],color:o.color},ref+2)}
    ${part({name:"Head",position:[x,y+sy*.48,z],size:[1.8,1.8,1.8],color:"#d7b18b"},ref+4)}
    ${humanoid}
  </Item>`;
}
function scriptItem(name, source, ref, localScript = false) {
  const klass = localScript ? "LocalScript" : "Script";
  return `<Item class="${klass}" referent="RBX${ref}"><Properties><string name="Name">${esc(name)}</string><ProtectedString name="Source"><![CDATA[${String(source).replaceAll("]]>","]]]]><![CDATA[>")}]]></ProtectedString><bool name="Disabled">false</bool></Properties></Item>`;
}
export function buildPlaceXml(world) {
  let ref = 100;
  const workspace = [];
  for (const o of world.objects.slice(0, 500)) {
    if (["npc","animal","enemy"].includes(o.type)) {
      workspace.push(modelItem(o, ref)); ref += 10;
    } else if (o.type === "tree") {
      workspace.push(part(o, ref++));
      const [x,y,z] = o.position;
      workspace.push(part({name:"Tree Canopy",position:[x,y+5,z],size:[7,7,7],color:o.canopy || "#347a50"},ref++));
    } else workspace.push(part(o, ref++));
  }
  const scripts = world.scripts || {};
  const serverScripts = [], playerScripts = [];
  for (const [file, source] of Object.entries(scripts)) {
    const name = file.split("/").pop();
    if (file.includes("StarterPlayerScripts")) playerScripts.push(scriptItem(name, source, ref++, true));
    else serverScripts.push(scriptItem(name, source, ref++));
  }
  const serverFolder = serverScripts.length ? `<Item class="ServerScriptService" referent="RBX20"><Properties><string name="Name">ServerScriptService</string></Properties>${serverScripts.join("\n")}</Item>` : "";
  const starterPlayer = playerScripts.length ? `<Item class="StarterPlayer" referent="RBX21"><Properties><string name="Name">StarterPlayer</string></Properties><Item class="StarterPlayerScripts" referent="RBX22"><Properties><string name="Name">StarterPlayerScripts</string></Properties>${playerScripts.join("\n")}</Item></Item>` : "";
  return `<?xml version="1.0" encoding="utf-8"?>
<roblox version="4">
<Item class="Workspace" referent="RBX1"><Properties><string name="Name">Workspace</string></Properties>${workspace.join("\n")}</Item>
${serverFolder}
${starterPlayer}
</roblox>`;
}
