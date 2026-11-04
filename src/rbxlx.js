const esc = (s) => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const rgb = (hex) => { const h = String(hex || "#888888").replace("#",""); return [0,2,4].map(i => parseInt(h.slice(i,i+2),16) || 0); };
const prop = (name, value) => `<${name} name="Name"><string name="Name">${esc(value)}</string></${name}>`;
function part(item, ref) {
  const [x,y,z] = item.position, [sx,sy,sz] = item.size, [r,g,b] = rgb(item.color);
  return `<Item class="Part" referent="RBX${ref}"><Properties>
    <string name="Name">${esc(item.name)}</string><bool name="Anchored">true</bool><bool name="CanCollide">true</bool>
    <Vector3 name="Size"><X>${sx}</X><Y>${sy}</Y><Z>${sz}</Z></Vector3>
    <CoordinateFrame name="CFrame"><X>${x}</X><Y>${y}</Y><Z>${z}</Z><R00>1</R00><R01>0</R01><R02>0</R02><R10>0</R10><R11>1</R11><R12>0</R12><R20>0</R20><R21>0</R21><R22>1</R22></CoordinateFrame>
    <Color3uint8 name="Color3uint8">${r}, ${g}, ${b}</Color3uint8><token name="Material">256</token>
  </Properties></Item>`;
}
function scriptItem(name, source, ref) {
  return `<Item class="Script" referent="RBX${ref}"><Properties><string name="Name">${esc(name)}</string><ProtectedString name="Source"><![CDATA[${String(source).replaceAll("]]>","]]]]><![CDATA[>")}]]></ProtectedString><bool name="Disabled">false</bool></Properties></Item>`;
}
export function buildPlaceXml(world) {
  const children = [];
  let ref = 100;
  for (const o of world.objects.slice(0, 500)) {
    if (o.type === "tree") {
      children.push(part(o, ref++));
      const [x,y,z] = o.position;
      children.push(part({name:"Tree Canopy",position:[x,y+5,z],size:[7,7,7],color:o.canopy || "#347a50"},ref++));
    } else if (o.type === "npc" || o.type === "animal" || o.type === "enemy") {
      const [x,y,z] = o.position;
      const color = o.color;
      children.push(part({name:o.name+" Body",position:[x,y,z],size:[o.size[0],o.size[1]*.58,o.size[2]],color},ref++));
      children.push(part({name:o.name+" Head",position:[x,y+o.size[1]*.45,z],size:[1.8,1.8,1.8],color:"#d7b18b"},ref++));
    } else children.push(part(o, ref++));
  }
  const scripts = world.scripts || {};
  for (const [file, source] of Object.entries(scripts)) {
    children.push(scriptItem(file.split("/").pop(), source, ref++));
  }
  return `<?xml version="1.0" encoding="utf-8"?>
<roblox version="4"><Item class="Workspace" referent="RBX1"><Properties><string name="Name">Workspace</string></Properties>
${children.join("\n")}
</Item></roblox>`;
}
