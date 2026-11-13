let annotations=[], labelMode=false, quarterTurns=0, transformHistory=[];
Object.assign(labels,{'DATOS DEL ESTUDIO':'STUDY DETAILS','Solo durante esta sesión':'Current session only','PACIENTE':'PATIENT','RAZA':'BREED','IDENTIFICACIÓN':'IDENTIFIER','FECHA':'DATE','NOTAS':'NOTES','BRILLO':'BRIGHTNESS','CONTRASTE':'CONTRAST','✎ Añadir rótulo':'✎ Add label','Cancelar rótulo':'Cancel label','Borrar rótulos':'Clear labels','Restablecer imagen':'Reset image','DATOS DEL CENTRO Y VETERINARIO':'CLINIC AND VETERINARIAN','Guardado en este navegador':'Saved in this browser','CENTRO VETERINARIO':'VETERINARY CLINIC','VETERINARIO/A':'VETERINARIAN','NÚMERO DE COLEGIADO/A':'LICENSE NUMBER','CONTACTO DEL CENTRO':'CLINIC CONTACT','Borrar datos guardados':'Clear saved details','⇋ Espejo':'⇋ Mirror'});
const originalDrawWithGuides=draw;
draw=function(){originalDrawWithGuides();if(!image)return;const r=rect();ctx.save();ctx.font='600 14px sans-serif';ctx.textBaseline='middle';for(const note of annotations){const x=r.x+note.x*r.s,y=r.y+note.y*r.s;const w=ctx.measureText(note.text).width;ctx.fillStyle='rgba(10,24,22,.82)';ctx.fillRect(x-5,y-11,w+10,22);ctx.fillStyle='#e6fff4';ctx.fillText(note.text,x,y)}ctx.restore()};
for(const key of ['brightness','contrast'])$('#'+key).addEventListener('input',e=>{if(key==='brightness')viewerBrightness=Number(e.target.value);else viewerContrast=Number(e.target.value);$('#'+key+'Value').textContent=e.target.value+'%';draw()});
function rotateImage(clockwise,record=true){if(!image)return;const w=image.width,h=image.height,output=document.createElement('canvas');output.width=h;output.height=w;const c=output.getContext('2d');if(clockwise){c.translate(h,0);c.rotate(Math.PI/2)}else{c.translate(0,w);c.rotate(-Math.PI/2)}c.drawImage(image,0,0);function update(p){return clockwise?{...p,x:h-p.y,y:p.x}:{...p,x:p.y,y:w-p.x}}points=points.map(update);annotations=annotations.map(update);image=output;quarterTurns=(quarterTurns+(clockwise?1:3))%4;if(record)transformHistory.push(clockwise?'right':'left');draw()}
function mirrorImage(record=true){if(!image)return;const w=image.width,h=image.height,output=document.createElement('canvas');output.width=w;output.height=h;const c=output.getContext('2d');c.translate(w,0);c.scale(-1,1);c.drawImage(image,0,0);const update=p=>({...p,x:w-p.x});points=points.map(update);annotations=annotations.map(update);image=output;if(record)transformHistory.push('mirror');draw()}
$('#rotateLeft').onclick=()=>rotateImage(false);$('#rotateRight').onclick=()=>rotateImage(true);$('#rotate180').onclick=()=>{rotateImage(true);rotateImage(true)};$('#flipHorizontal').onclick=()=>mirrorImage();
$('#labelMode').onclick=()=>{labelMode=!labelMode;$('#labelMode').classList.toggle('active',labelMode);$('#labelMode').textContent=labelMode?(isEn()?'Cancel label':'Cancelar rótulo'):(isEn()?'✎ Add label':'✎ Añadir rótulo');canvas.style.cursor=labelMode?'crosshair':''};
canvas.addEventListener('click',e=>{if(!labelMode)return;e.stopImmediatePropagation();if(!image)return;const bounds=canvas.getBoundingClientRect(),r=rect(),x=(e.clientX-bounds.left-r.x)/r.s,y=(e.clientY-bounds.top-r.y)/r.s;if(x<0||y<0||x>image.width||y>image.height)return;const text=prompt(isEn()?'Label text:':'Texto del rótulo:');if(text&&text.trim())annotations.push({x,y,text:text.trim().slice(0,120)});draw()},true);
$('#clearLabels').onclick=()=>{annotations=[];draw()};
$('#resetImage').onclick=()=>{viewerBrightness=viewerContrast=100;for(const key of ['brightness','contrast']){$('#'+key).value=100;$('#'+key+'Value').textContent='100%'}inv=false;while(transformHistory.length){const action=transformHistory.pop();if(action==='mirror')mirrorImage(false);else rotateImage(action==='left',false)}quarterTurns=0;zoom=1;$('#zoomLabel').textContent='100%';draw()};
const originalLoadImage=load;load=async function(file){if(!file)return;const previous=image;await originalLoadImage(file);if(image!==previous){annotations=[];quarterTurns=0;transformHistory=[];viewerBrightness=viewerContrast=100;inv=false;for(const key of ['brightness','contrast']){$('#'+key).value=100;$('#'+key+'Value').textContent='100%'}if(labelMode)$('#labelMode').click();draw()}};
const previousLanguage=setLanguage;setLanguage=function(lang){previousLanguage(lang);$('#patientName').placeholder=isEn()?'Patient name':'Nombre del paciente';$('#patientBreed').placeholder=isEn()?'Breed':'Raza';$('#patientId').placeholder=isEn()?'Record / ID':'Historia / ID';$('#studyNotes').placeholder=isEn()?'Notes':'Observaciones';$('#rotateLeft').title=isEn()?'Rotate 90° left':'Girar 90° a la izquierda';$('#rotateRight').title=isEn()?'Rotate 90° right':'Girar 90° a la derecha';$('#rotate180').title=isEn()?'Rotate 180°':'Girar 180°';$('#flipHorizontal').title=isEn()?'Flip horizontally':'Reflejar horizontalmente';$('#clinicName').placeholder=isEn()?'Clinic name':'Nombre del centro';$('#vetName').placeholder=isEn()?'Professional name':'Nombre profesional';$('#licenseNumber').placeholder=isEn()?'License number':'Número de colegiado';$('#clinicContact').placeholder=isEn()?'Telephone or email':'Teléfono o correo';$('#theme').textContent=document.body.classList.contains('light')?(isEn()?'Dark mode':'Modo oscuro'):(isEn()?'Light mode':'Modo claro');if(labelMode)$('#labelMode').textContent=isEn()?'Cancel label':'Cancelar rótulo'};setLanguage(isEn()?'en':'es');

const profileKeys=['clinicName','vetName','licenseNumber','clinicContact'];let clinicProfile={};try{clinicProfile=JSON.parse(localStorage.getItem('wairua-clinic-profile')||'{}')}catch{}for(const key of profileKeys){const field=$('#'+key);field.value=clinicProfile[key]||'';field.addEventListener('input',()=>{clinicProfile[key]=field.value;try{localStorage.setItem('wairua-clinic-profile',JSON.stringify(clinicProfile))}catch{}})}$('#clearProfile').onclick=()=>{clinicProfile={};localStorage.removeItem('wairua-clinic-profile');for(const key of profileKeys)$('#'+key).value=''};


// Viewport pan is stored in screen pixels; measurement and annotation points
// remain in image coordinates and use the same rect() transform when rendered.
let panX=0,panY=0,panMode=false,spacePan=false,panGesture=null,suppressPanClick=false;
const unpannedRect=rect;
rect=function(){const r=unpannedRect();return {...r,x:r.x+panX,y:r.y+panY}};
labels['✥ Mover']='✥ Move';
const panButton=document.createElement('button');
panButton.id='panTool';panButton.type='button';panButton.textContent='✥ Mover';
panButton.setAttribute('aria-pressed','false');
$('.headtools').prepend(panButton);
function panTitle(){return isEn()?'Drag image (or hold Space)':'Arrastrar imagen (o mantener pulsada la barra espaciadora)'}
function panCursor(){canvas.style.cursor=(panMode||spacePan)?(panGesture?'grabbing':'grab'):(labelMode?'crosshair':'')}
function setPanMode(active){panMode=active;panButton.classList.toggle('active',active);panButton.setAttribute('aria-pressed',String(active));if(active&&labelMode)$('#labelMode').click();panCursor()}
panButton.title=panTitle();
panButton.addEventListener('click',()=>setPanMode(!panMode));
$('#labelMode').addEventListener('click',()=>{if(labelMode&&panMode)setPanMode(false);panCursor()});
for(const id of ['languageES','languageEN'])$('#'+id).addEventListener('click',()=>{panButton.title=panTitle()});
function isTyping(target){return target instanceof Element && (target.closest('input, textarea, select, button, [contenteditable="true"]'))}
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!isTyping(e.target)){spacePan=true;e.preventDefault();panCursor()}});
window.addEventListener('keyup',e=>{if(e.code==='Space'){spacePan=false;panCursor()}});
window.addEventListener('blur',()=>{spacePan=false;panGesture=null;panCursor()});
stage.addEventListener('pointerdown',e=>{
  suppressPanClick=false;
  if(!image||e.target!==canvas||!(panMode||spacePan||e.button===1)||!(e.button===0||e.button===1))return;
  e.preventDefault();e.stopPropagation();
  panGesture={id:e.pointerId,x:e.clientX,y:e.clientY,startX:panX,startY:panY};
  suppressPanClick=true;canvas.setPointerCapture(e.pointerId);panCursor();
},true);
stage.addEventListener('pointermove',e=>{
  if(!panGesture||e.pointerId!==panGesture.id)return;
  e.preventDefault();e.stopPropagation();
  panX=panGesture.startX+e.clientX-panGesture.x;
  panY=panGesture.startY+e.clientY-panGesture.y;draw();
},true);
function endPan(e){if(!panGesture||e.pointerId!==panGesture.id)return;e.preventDefault();e.stopPropagation();panGesture=null;panCursor()}
stage.addEventListener('pointerup',endPan,true);
stage.addEventListener('pointercancel',e=>{endPan(e);suppressPanClick=false},true);
// Capture before both the measurement click handler and the label handler.
stage.addEventListener('click',e=>{if(suppressPanClick||panMode||spacePan){e.preventDefault();e.stopImmediatePropagation();suppressPanClick=false}},true);
// Preserve the image point under the pointer as the wheel changes the zoom.
stage.addEventListener('wheel',e=>{
  if(!image)return;
  e.preventDefault();e.stopImmediatePropagation();
  const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
  const before=rect(),ix=(x-before.x)/before.s,iy=(y-before.y)/before.s;
  zoom=Math.max(.4,Math.min(5,zoom*(e.deltaY<0?1.12:.89)));
  const after=rect();panX+=x-(after.x+ix*after.s);panY+=y-(after.y+iy*after.s);
  $('#zoomLabel').textContent=Math.round(zoom*100)+'%';draw();
},{capture:true,passive:false});
$('#resetImage').addEventListener('click',()=>{panX=panY=0;draw()});
const panPreviousLoad=load;
load=async function(file){const before=image;await panPreviousLoad(file);if(image!==before){panX=panY=0;setPanMode(false);draw()}};
const panStyle=document.createElement('style');
panStyle.textContent='.headtools #panTool.active{background:#b9ead4;color:#183c2d;border-color:#8cc7ad} .headtools #panTool:focus-visible{outline:2px solid #76cdb0;outline-offset:2px}';
document.head.append(panStyle);if(isEn())translateVisible();


// Compact instructions stay available on hover, focus and touch.
const viewerHelp=document.createElement('details');
viewerHelp.className='viewer-help';
viewerHelp.innerHTML='<summary aria-label="Ayuda del visor">i</summary><div class="viewer-help-panel"></div>';
$('.workspacehead').append(viewerHelp);
const helpPanel=viewerHelp.querySelector('.viewer-help-panel');
const helpSummary=viewerHelp.querySelector('summary');
const viewerTips={
 panTool:['Activar o desactivar el desplazamiento. Arrastra la imagen; también puedes mantener pulsada la barra espaciadora.','Toggle panning. Drag the image, or hold the space bar.'],
 invert:['Invertir los tonos claros y oscuros de la imagen.','Invert the image tones.'],
 undo:['Deshacer el último punto de la medición actual.','Undo the last point in the current measurement.'],
 clear:['Empezar de nuevo la medición actual.','Restart the current measurement.'],
 brightness:['Ajustar el brillo de visualización.','Adjust the display brightness.'],
 contrast:['Ajustar el contraste de visualización.','Adjust the display contrast.'],
 rotateLeft:['Girar la imagen 90 grados a la izquierda.','Rotate the image 90 degrees left.'],
 rotateRight:['Girar la imagen 90 grados a la derecha.','Rotate the image 90 degrees right.'],
 rotate180:['Girar la imagen 180 grados.','Rotate the image 180 degrees.'],
 flipHorizontal:['Reflejar la imagen horizontalmente.','Flip the image horizontally.'],
 labelMode:['Activar la colocación de rótulos: haz clic sobre la imagen y escribe el texto.','Add labels: click the image and enter the text.'],
 clearLabels:['Borrar los rótulos de la imagen actual.','Remove labels from the current image.'],
 resetImage:['Restablecer zoom, posición, orientación y ajustes de imagen.','Reset zoom, position, orientation and image settings.'],
 uploadTop:['Abrir una radiografía desde tu dispositivo.','Open a radiograph from your device.'],
 upload:['Abrir una radiografía desde tu dispositivo.','Open a radiograph from your device.'],
 theme:['Alternar entre modo claro y oscuro.','Switch between light and dark mode.'],
 languageES:['Mostrar la aplicación en español.','Show the application in Spanish.'],
 languageEN:['Mostrar la aplicación en inglés.','Show the application in English.']
};
function refreshViewerHelp(){
 const en=isEn();helpSummary.setAttribute('aria-label',en?'Viewer help and shortcuts':'Ayuda y atajos del visor');
 helpPanel.innerHTML=en?'<strong>Viewer help</strong><p><b>Zoom:</b> use the mouse wheel over the image.</p><p><b>Move:</b> select “Move” and drag, or hold <kbd>Space</kbd> while dragging. The middle mouse button also works.</p><p><b>Measure:</b> choose a tool and mark the points shown in the guide.</p><p><b>Labels:</b> select “Add label”, click the image and enter text.</p><p><b>Reset image:</b> restores zoom, position, orientation and display settings.</p>':'<strong>Ayuda del visor</strong><p><b>Zoom:</b> mueve la rueda del ratón sobre la imagen.</p><p><b>Mover:</b> selecciona «Mover» y arrastra, o mantén pulsada la <kbd>barra espaciadora</kbd> mientras arrastras. También puedes usar el botón central del ratón.</p><p><b>Medir:</b> elige una herramienta y marca los puntos que indica la guía.</p><p><b>Rótulos:</b> selecciona «Añadir rótulo», pulsa sobre la imagen y escribe el texto.</p><p><b>Restablecer imagen:</b> recupera el zoom, la posición, la orientación y los ajustes de visualización.</p>';
 for(const [id,tips] of Object.entries(viewerTips)){const el=document.getElementById(id);if(el)el.title=tips[en?1:0]}
}
for(const id of ['languageES','languageEN'])document.getElementById(id).addEventListener('click',refreshViewerHelp);
viewerHelp.addEventListener('keydown',e=>{if(e.key==='Escape'){viewerHelp.open=false;helpSummary.focus()}});
const viewerHelpStyle=document.createElement('style');
viewerHelpStyle.textContent='.workspacehead{position:relative}.viewer-help{position:relative;align-self:center;flex:none}.viewer-help summary{list-style:none;display:grid;place-items:center;width:24px;height:24px;border:1px solid #80a399;border-radius:50%;font-weight:700;color:#b9d8ca;cursor:pointer;font:700 13px sans-serif}.viewer-help summary::-webkit-details-marker{display:none}.viewer-help summary:focus-visible{outline:2px solid #83d8b8;outline-offset:3px}.viewer-help-panel{visibility:hidden;opacity:0;pointer-events:none;position:absolute;z-index:10;right:0;top:31px;width:min(340px,80vw);padding:16px 18px;background:#192823;color:#deeee7;border:1px solid #466359;border-radius:10px;box-shadow:0 12px 32px #0006;font-size:12px;line-height:1.5;transition:opacity .15s}.viewer-help-panel p{margin:8px 0}.viewer-help-panel p:last-child{margin-bottom:0}.viewer-help:hover .viewer-help-panel,.viewer-help:focus-within .viewer-help-panel,.viewer-help[open] .viewer-help-panel{visibility:visible;opacity:1;pointer-events:auto}.viewer-help kbd{font:inherit;border:1px solid #759b8a;border-radius:4px;padding:1px 4px}body.light .viewer-help summary{color:#365c4e;border-color:#7ba593}body.light .viewer-help-panel{background:#f5fffa;color:#213a2e;border-color:#b8d6c7;box-shadow:0 12px 32px #2343}@media(max-width:650px){.viewer-help{position:absolute;top:0;right:0}}';
document.head.append(viewerHelpStyle);refreshViewerHelp();
