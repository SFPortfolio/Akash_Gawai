import * as T from './vendor/three.module.js';

const cities = [
  ['Pune',73.8567,18.5204], ['Mumbai',72.8777,19.0760],
  ['Nagpur',79.0882,21.1458], ['Chhatrapati Sambhajinagar (Aurangabad)',75.3433,19.8762],
  ['Hyderabad',78.4867,17.3850], ['Bengaluru',77.5946,12.9716]
];
const clamp = T.MathUtils.clamp;
const ease = t => t*t*(3-2*t);
const position = (lon,lat,r=1) => new T.Vector3(r*Math.cos(lat*Math.PI/180)*Math.sin(lon*Math.PI/180),r*Math.sin(lat*Math.PI/180),r*Math.cos(lat*Math.PI/180)*Math.cos(lon*Math.PI/180));

export async function createJourney(section, initialSelection = 4) {
  const host = section.querySelector('#flight-globe');
  const status = section.querySelector('#journey-status');
  const replay = section.querySelector('#journey-replay');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new T.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
  let destroyed=false, frame=0, visible=false, last=0, time=0, intro=null, cameraMove=null, selection=initialSelection, burst=0, dragging=null;
  let lon=motion.matches?77:-30, lat=motion.matches?19:15, distance=motion.matches?2.05:4.8;
  const scene=new T.Scene(), camera=new T.PerspectiveCamera(34,1,.01,30);
  const content=new T.Group(); scene.add(content);
  const abort = new AbortController();
  const geometries=[], materials=[], textures=[];
  const geometry=g=>(geometries.push(g),g), material=m=>(materials.push(m),m);
  const mesh=(g,m)=>new T.Mesh(geometry(g),material(m));
  function destroy() {
    if(destroyed)return; destroyed=true; cancelAnimationFrame(frame); abort.abort();
    intersection.disconnect(); resize.disconnect(); motion.removeEventListener('change',reduced);
    geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose());
    renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    replay.disabled=true;
  }
  // Natural Earth public-domain country polygons, rasterized locally; no texture CDN.
  let data;
  try {
    const response=await fetch(new URL('./assets/countries.geojson',import.meta.url),{signal:abort.signal});
    if(!response.ok)throw new Error('Geographic data unavailable'); data=await response.json();
  } catch(error) { renderer.dispose(); renderer.forceContextLoss(); throw error; }
  const map=document.createElement('canvas'); map.width=2048;map.height=1024;
  const ctx=map.getContext('2d'); ctx.fillStyle='#102e46';ctx.fillRect(0,0,2048,1024);
  ctx.strokeStyle='#1c4358';ctx.lineWidth=1;
  for(let x=0;x<2048;x+=2048/24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1024);ctx.stroke();}
  for(let y=0;y<1024;y+=1024/12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(2048,y);ctx.stroke();}
  for(const feature of data.features){
    const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
    for(const polygon of polygons){
      ctx.beginPath();
      for(const ring of polygon){ ring.forEach(([x,y],i)=>{ const px=(x+180)/360*2048,py=(90-y)/180*1024; i?ctx.lineTo(px,py):ctx.moveTo(px,py); });ctx.closePath(); }
      ctx.fillStyle=feature.properties.ADM0_A3==='IND'?'#478c9e':'#295b70';ctx.fill('evenodd');ctx.strokeStyle='#76acb9';ctx.lineWidth=1;ctx.stroke();
    }
  }
  const texture=new T.CanvasTexture(map);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);
  // Sphere UV longitude is offset by 90 degrees relative to our geographic vectors.
  const earth=mesh(new T.SphereGeometry(1,96,64),new T.MeshPhongMaterial({map:texture,shininess:16,specular:0x28536a}));
  earth.rotation.y=-Math.PI/2; scene.add(earth);
  scene.add(new T.AmbientLight(0xcceeff,2));
  const light=new T.DirectionalLight(0xb7e9ff,2.1);light.position.set(3,4,5);scene.add(light);
  const atmosphere=mesh(new T.SphereGeometry(1.018,64,48),new T.ShaderMaterial({transparent:true,side:T.BackSide,depthWrite:false,uniforms:{},vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;void main(){float a=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(.24,.65,1.,a*.32);}'}));scene.add(atmosphere);
  const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;
  const gc=glowCanvas.getContext('2d'),gradient=gc.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'#fff');gradient.addColorStop(.15,'#d1f996');gradient.addColorStop(.4,'#7ccfff99');gradient.addColorStop(1,'#7ccfff00');gc.fillStyle=gradient;gc.fillRect(0,0,64,64);
  const glow=new T.CanvasTexture(glowCanvas);textures.push(glow);
  const markers=cities.map((city,i)=>{
    const dot=mesh(new T.SphereGeometry(.006,12,8),new T.MeshBasicMaterial({color:i===4?0xd1f996:0xb5e9ff}));dot.position.copy(position(city[1],city[2],1.008));content.add(dot);
    const halo=new T.Sprite(material(new T.SpriteMaterial({map:glow,transparent:true,depthWrite:false})));halo.position.copy(dot.position);halo.scale.setScalar(.045);content.add(halo);return {dot,halo};
  });
  const origin=position(cities[4][1],cities[4][2]);
  const routes=cities.map((city,i)=>{
    if(i===4)return null;
    const end=position(city[1],city[2]);
    const points=Array.from({length:101},(_,j)=>{const t=j/100;return origin.clone().lerp(end,t).normalize().multiplyScalar(1.01+Math.sin(Math.PI*t)*.055);});
    const line=new T.Line(geometry(new T.BufferGeometry().setFromPoints(points)),material(new T.LineBasicMaterial({color:0x75ceff,transparent:true,opacity:.65})));content.add(line);
    const particle=new T.Sprite(material(new T.SpriteMaterial({map:glow,transparent:true,depthWrite:false})));particle.scale.setScalar(.025);content.add(particle);return {line,particle,points};
  });
  host.append(renderer.domElement); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();status.textContent='Globe unavailable. All destinations remain available in the city list.';destroy();},{signal:abort.signal});
  function size(){if(destroyed)return;const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();wake();}
  const resize=new ResizeObserver(size);resize.observe(host);
  function start(){intro=motion.matches?null:{start:time};cameraMove=null;burst=time;lon=motion.matches?77:-30;lat=motion.matches?19:15;distance=motion.matches?2.05:4.8;wake();}
  function select(index){selection=index;intro=null;burst=time;const city=cities[index];cameraMove=motion.matches?null:{start:time,lon,lat,distance,toLon:(77+city[1])/2,toLat:(19+city[2])/2};if(motion.matches){lon=(77+city[1])/2;lat=(19+city[2])/2;distance=2.05;}wake();}
  function reduced(){intro=null;cameraMove=null;lon=77;lat=19;distance=2.05;wake();}
  motion.addEventListener('change',reduced);
  replay.disabled=false;replay.addEventListener('click',start,{signal:abort.signal});
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{intro=null;cameraMove=null;dragging={x:e.clientX,y:e.clientY,lon,lat};canvas.setPointerCapture(e.pointerId);wake();},{signal:abort.signal});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;lon=dragging.lon-(e.clientX-dragging.x)*.18;lat=clamp(dragging.lat+(e.clientY-dragging.y)*.15,-75,75);wake();},{signal:abort.signal});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{dragging=null;},{signal:abort.signal});
  function wake(){if(!destroyed&&visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(render);}}
  function render(now){frame=0;if(destroyed||!visible||document.hidden)return;if(last)time+=Math.min((now-last)/1000,.05);last=now;
    let reveal=1;
    if(intro){const t=time-intro.start;lon=-30+107*ease(clamp(t/3.3,0,1));lat=15+4*ease(clamp(t/3.3,0,1));distance=4.8-2.75*ease(clamp((t-2.4)/2.5,0,1));reveal=clamp((t-4.1)/1.6,0,1);if(t>=6.3){intro=null;burst=time-4;}}
    if(cameraMove){const t=ease(clamp((time-cameraMove.start)/1.15,0,1));lon=T.MathUtils.lerp(cameraMove.lon,cameraMove.toLon,t);lat=T.MathUtils.lerp(cameraMove.lat,cameraMove.toLat,t);distance=T.MathUtils.lerp(cameraMove.distance,2.05,t);if(t===1)cameraMove=null;}
    camera.position.copy(position(lon,lat,distance));camera.lookAt(0,0,0);
    markers.forEach(({dot,halo},i)=>{dot.visible=halo.visible=reveal>0;dot.scale.setScalar(i===selection?1.6:1);halo.scale.setScalar(i===selection?.06:.037);});
    routes.forEach((route,i)=>{if(!route)return;const active=selection!==4&&selection===i;route.line.visible=selection===4||active;route.line.material.opacity=active?1:.5;route.line.geometry.setDrawRange(0,Math.floor(101*reveal));const travelling=!motion.matches&&(!!intro||time-burst<3);route.particle.visible=travelling&&route.line.visible&&reveal>.05;route.particle.position.copy(route.points[Math.floor(((time*0.5+i*.17)%1)*100*reveal)]);});
    renderer.render(scene,camera);status.textContent='';
    if(intro||cameraMove||(!motion.matches&&time-burst<3)||dragging)frame=requestAnimationFrame(render);
  }
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:.05});intersection.observe(section);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();},{signal:abort.signal});
  start();size();
  return {select,destroy};
}
