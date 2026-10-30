import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const base=new URL('../akash-gawai-portfolio/',import.meta.url);
let callbacks=new Map(),id=0,now=0, reduced=false,frames=0,disposed=0;
const observers=[],listeners=new Map();
const eventTarget=()=>({addEventListener(type,fn){this.events??={};this.events[type]=fn;},removeEventListener(){},remove(){},setPointerCapture(){}});
const ctx={fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},closePath(){},fill(){},createRadialGradient(){return {addColorStop(){}};}};
const document={hidden:false,...eventTarget(),createElement(){return {width:0,height:0,getContext:()=>ctx};}};
const media={matches:false,...eventTarget()};
const context=vm.createContext({console,URL,AbortController,Math,Float32Array,Uint16Array,Uint32Array,Uint8Array,document,devicePixelRatio:1,matchMedia:()=>media,fetch:async()=>({ok:true,json:async()=>JSON.parse(await readFile(new URL('assets/countries.geojson',base),'utf8'))}),requestAnimationFrame(fn){callbacks.set(++id,fn);return id;},cancelAnimationFrame(i){callbacks.delete(i);},IntersectionObserver:class{constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}},ResizeObserver:class{observe(){}disconnect(){}}});
const three=new vm.SourceTextModule(await readFile(new URL('vendor/three.module.js',base),'utf8'),{context});await three.link(()=>{});await three.evaluate();
class Renderer{constructor(){this.domElement=eventTarget();}setPixelRatio(){}setSize(){}render(scene,camera){frames++;this.scene=scene;this.camera=camera;Renderer.last=this;}dispose(){disposed++;}forceContextLoss(){}}
const exports=Object.keys(three.namespace);
const library=new vm.SyntheticModule(exports,function(){for(const name of exports)this.setExport(name,name==='WebGLRenderer'?Renderer:three.namespace[name]);},{context});
const globe=new vm.SourceTextModule(await readFile(new URL('flight-globe.js',base),'utf8'),{context,initializeImportMeta(meta){meta.url=new URL('flight-globe.js',base).href;}});await globe.link(()=>library);await globe.evaluate();
function section(){const status={textContent:''}, replay={disabled:true,...eventTarget()},host={append(){},getBoundingClientRect:()=>({width:540,height:510})};return {status,replay,querySelector:s=>s==='#flight-globe'?host:s==='#journey-status'?status:replay};}
function step(seconds){const count=Math.ceil(seconds*60);for(let i=0;i<count;i++){now+=1000/60;const pending=[...callbacks.values()];callbacks.clear();pending.forEach(fn=>fn(now));}}
let s=section(),journey=await globe.namespace.createJourney(s);
assert.equal(callbacks.size,0,'No rendering before entering viewport');observers.at(-1).fn([{isIntersecting:true}]);step(7);
assert.equal(callbacks.size,0,'Introduction settles by seven seconds');assert.ok(Math.abs(Renderer.last.camera.position.length()-2.05)<.001,'India camera distance');
journey.select(0);step(1.5);const content=Renderer.last.scene.children[0];const lines=content.children.filter(x=>x.isLine);assert.equal(lines.filter(x=>x.visible).length,1,'Selection highlights one route');
journey.select(4);step(3.5);assert.equal(lines.length,5,'No self route exists');
s.replay.events.click();step(.5);Renderer.last.domElement.events.pointerdown({clientX:0,clientY:0,pointerId:1});Renderer.last.domElement.events.pointermove({clientX:40,clientY:20});Renderer.last.domElement.events.pointerup();step(4);assert.equal(callbacks.size,0,'Dragging cancels camera animation');
s.replay.events.click();step(.2);observers.at(-1).fn([{isIntersecting:false}]);let count=frames;step(2);assert.equal(frames,count,'Offscreen rendering paused');observers.at(-1).fn([{isIntersecting:true}]);step(.2);document.hidden=true;document.events.visibilitychange();count=frames;step(2);assert.equal(frames,count,'Hidden tab rendering paused');document.hidden=false;document.events.visibilitychange();step(7);journey.destroy();assert.ok(disposed);assert.equal(callbacks.size,0,'Cleanup cancels RAF');
media.matches=true;s=section();journey=await globe.namespace.createJourney(s);observers.at(-1).fn([{isIntersecting:true}]);step(.1);assert.equal(callbacks.size,0,'Reduced motion renders once');assert.ok(Math.abs(Renderer.last.camera.position.length()-2.05)<.001);journey.select(2);step(.1);assert.equal(callbacks.size,0,'Reduced motion selection has no animation');journey.destroy();
console.log('PASS: intro timing, selection, no self route, replay/drag cancellation, offscreen pause, hidden-tab pause, reduced motion, cleanup. Renderer is mocked; visual/GPU/mobile verification requires a browser.');
