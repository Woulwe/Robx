const $=s=>document.querySelector(s);
const status=$("#status"),button=$("#generate"),canvas=$("#view");
let AI=null,current=null,draw3d=null;
function say(s){status.textContent=s}
function fallback(world){
 const c=canvas.getContext("2d");if(!c)return;const w=canvas.width=canvas.clientWidth*devicePixelRatio,h=canvas.height=canvas.clientHeight*devicePixelRatio;c.clearRect(0,0,w,h);c.fillStyle="#8fc4d2";c.fillRect(0,0,w,h);
 const t=world.terrain,n=t.segments+1,step=w/n;
 for(let z=0;z<t.segments;z++)for(let x=0;x<t.segments;x++){const v=t.heights[z*n+x],g=Math.max(50,Math.min(150,100+v*2));c.fillStyle=v<0?"#3b91b5":'rgb('+Math.round(g*.8)+','+g+','+Math.round(g*.65)+')';c.fillRect(x*step,z*step,step+1,step+1)}
 const sx=w/t.size,sz=h/t.size;for(const o of world.objects){const x=(o.position[0]+t.size/2)*sx,y=(o.position[2]+t.size/2)*sz;c.fillStyle=o.color||"#eee";if(o.type==="tree"){c.beginPath();c.arc(x,y,Math.max(3,5*sx),0,Math.PI*2);c.fill()}else if(o.type==="building"){c.fillRect(x-4,y-4,9,9)}else if(o.type==="npc"||o.type==="enemy"){c.beginPath();c.arc(x,y,4,0,7);c.fill()}}
}
async function setup3D(){
 const THREE=await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
 const {OrbitControls}=await import("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js");
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;
 const scene=new THREE.Scene();scene.background=new THREE.Color("#a8c9d8");scene.fog=new THREE.Fog("#a8c9d8",220,520);
 const camera=new THREE.PerspectiveCamera(48,1,.1,1200);camera.position.set(210,170,210);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;
 scene.add(new THREE.HemisphereLight(0xffffff,0x52634b,2));const sun=new THREE.DirectionalLight(0xfff1d5,2.4);sun.position.set(120,200,100);sun.castShadow=true;scene.add(sun);
 const root=new THREE.Group();scene.add(root);
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);resize();
 function draw(world){root.clear();const t=world.terrain,n=t.segments+1,verts=[],idx=[],cols=[];
 for(let z=0;z<n;z++)for(let x=0;x<n;x++){const i=z*n+x,px=-t.size/2+x*t.size/t.segments,pz=-t.size/2+z*t.size/t.segments,y=t.heights[i];verts.push(px,y,pz);const col=new THREE.Color(y>14?"#777e79":y>5?"#75916a":y>0?"#83a568":"#b7a477");cols.push(col.r,col.g,col.b);if(x<t.segments&&z<t.segments){const q=i+n;idx.push(i,q,i+1,i+1,q,q+1)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));geo.setAttribute("color",new THREE.Float32BufferAttribute(cols,3));geo.setIndex(idx);geo.computeVertexNormals();root.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide})));
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.9});
 const cube=(p,s,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...s),mat(color));m.position.set(...p);m.castShadow=true;m.receiveShadow=true;root.add(m)};
 const ball=(p,r,color)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat(color));m.position.set(...p);root.add(m)};
 for(const o of world.objects){const [x,y,z]=o.position,[sx,sy,sz]=o.size;if(o.type==="water"){const m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),new THREE.MeshStandardMaterial({color:o.color,transparent:true,opacity:.7}));m.rotation.x=-Math.PI/2;m.position.set(x,-1.2,z);root.add(m)}
 else if(o.type==="tree"){cube([x,y,z],[1.2,sy,1.2],o.color);const m=new THREE.Mesh(new THREE.ConeGeometry(5,10,8),mat(o.canopy||"#39794c"));m.position.set(x,y+sy*.55,z);root.add(m)}
 else if(o.type==="rock"){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(Math.max(sx,sz)*.42),mat(o.color));m.scale.y=sy/sx;m.position.set(x,y,z);root.add(m)}
 else if(o.type==="building"){cube([x,y,z],[sx,sy,sz],o.color);cube([x,y+sy/2+1,z],[sx+2,2,sz+2],o.roof||"#4b5662")}
 else if(["npc","animal","enemy"].includes(o.type)){cube([x,y,z],[sx*.55,sy*.65,sz*.5],o.color);ball([x,y+sy*.48,z],1.5,o.color)}
 else if(["path","road","resource","checkpoint","cave","spawn"].includes(o.type)){cube([x,y,z],[sx,sy,sz],o.color)}}
 camera.position.set(t.size*.7,t.size*.58,t.size*.7);controls.target.set(0,0,0);controls.update()}
 function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera)}loop();return draw;
}
function showPlan(plan,world){
 $("#analysis").innerHTML='<div class="chip">Жанр: '+plan.genre+'</div><div class="chip">Биом: '+plan.biome+'</div><div class="chip">Масштаб: '+plan.scale+' × '+plan.scale+'</div><div class="chip">Распознано деталей: '+plan.tags.length+'</div><p class="muted">'+plan.summary+'</p>';
 $("#summary").textContent=world.summary+" Объектов на карте: "+world.objects.length+".";
}
function makeChangeBox(){
 let box=$("#robx-edit");if(box)return;
 box=document.createElement("section");box.id="robx-edit";box.className="card";box.innerHTML='<div class="step">04 / ИЗМЕНЕНИЯ</div><h3>Попроси изменить созданную игру</h3><textarea id="change-prompt" style="min-height:80px" placeholder="Например: добавь большой замок на вершине горы и больше деревень"></textarea><button id="apply-change">Применить изменения</button>';
 $("#summary").parentElement.appendChild(box);
 $("#apply-change").onclick=()=>{const edit=$("#change-prompt").value.trim();if(!edit)return;$("#prompt").value=$("#prompt").value+". Изменение: "+edit;run()};
}
function run(){
 const prompt=$("#prompt").value.trim();if(!prompt){say("Напиши описание игры.");return}
 button.disabled=true;$("#export").disabled=true;$("#scripts").disabled=true;
 const stages=["Анализирую жанр, действия игрока и стиль…","Составляю концепцию и структуру мира…","Строю ландшафт и размещаю объекты…"];
 let i=0;say(stages[0]);const tick=()=>{if(i<stages.length){say(stages[i]);i++;setTimeout(tick,260);return}
 try{const plan=AI.analyzePrompt(prompt);current=AI.buildWorld(prompt);if(draw3d){draw3d(current)}else{fallback(current)}showPlan(plan,current);$("#export").disabled=false;$("#scripts").disabled=false;makeChangeBox();say("Готово: концепция разобрана, карта создана. Можешь запросить изменения.");}
 catch(e){say("Ошибка генерации: "+(e?.message||e));console.error(e)}finally{button.disabled=false}};
 setTimeout(tick,200);
}
button.addEventListener("click",run);
$("#survival").onclick=()=>{$("#prompt").value="Огромный реалистичный остров для выживания: высокие горы, леса, реки, пляжи, несколько деревень, пещеры, животные и хищники, заброшенная военная база, ресурсы, голод, жажда, крафт и смена дня и ночи."};
$("#rpg").onclick=()=>{$("#prompt").value="Большой фэнтези RPG мир: средневековое королевство, большой замок, несколько деревень, древний лес, горы, пещеры, торговцы, NPC, цепочки квестов, магия, подземелье и дракон-босс."};
$("#export").onclick=()=>{if(!current)return;const xml=AI.exportPlace(current);const u=URL.createObjectURL(new Blob([xml],{type:"application/xml"}));const a=document.createElement("a");a.href=u;a.download="Robx-Experience.rbxlx";a.click();setTimeout(()=>URL.revokeObjectURL(u),3000)};
$("#scripts").onclick=()=>{const box=$("#scriptbox");box.hidden=!box.hidden;$("#scripttext").textContent=Object.entries(current?.scripts||{}).map(([name,code])=>"-- "+name+"\n"+code).join("\n\n")};
(async()=>{try{AI=await import("./robx-ai.js");say("Robx AI загружен. Напиши описание игры.");try{draw3d=await setup3D();say("Robx AI и 3D-редактор готовы.")}catch(e){console.warn("3D fallback",e);say("AI готов. 3D-графика недоступна в этом браузере — включён резервный предпросмотр.");} }catch(e){say("Не удалось загрузить AI-модуль: "+(e?.message||e)+". Обнови страницу и проверь подключение.");console.error(e);button.disabled=true}})();
