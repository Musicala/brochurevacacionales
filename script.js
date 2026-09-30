const SEASONS=[
{
 id:"receso-oct-2026",
 name:"Semana de Receso · 5–9 octubre 2026",
 label:"SEMANA DE RECESO · OCTUBRE 2026",
 dates:"5 al 9 de octubre de 2026",
 schedule:"9:00 a. m. – 1:00 p. m.",
 planLabel:"20 horas",
 intro:"Una semana integrada de música, movimiento, teatro, artes visuales y juego.",
 weeks:[
  {title:"Semana de Receso · Arte Integrado",date:"5 al 9 de octubre",focus:"Exploración creativa e integración de todas las áreas.",arts:"Dibujo, pintura, técnicas mixtas, personajes, color y textura.",body:"Movimiento, ritmo, improvisación, personajes y pequeñas escenas.",music:"Canto, percusión y Orff, xilófono/piano, ukelele y ensamble.",closing:"Proyecto integrado que puede mezclar galería, canción, coreografía o escena."}
 ],
 prices:[{hours:"20 horas",title:"Semana completa",value:"$392.000",text:"Cinco jornadas de 4 horas.",featured:true}]
},
{
 id:"temporada-larga-4-semanas",
 name:"Temporada larga · 4 semanas",
 label:"TEMPORADA LARGA · 2026",
 dates:"Fechas según calendario de la temporada",
 schedule:"9:00 a. m. – 1:00 p. m.",
 planLabel:"16 a 80 horas",
 intro:"Cada semana funciona como un ciclo completo. Se puede entrar en cualquier semana sin quedar rezagado.",
 weeks:[
  {title:"Semana 1 · Exploración Creativa",date:"Semana 1",focus:"Adaptación al grupo, materiales y juegos de ritmo, color y movimiento.",arts:"Trazos básicos, mezclas simples, recorte seguro y mini-galería.",body:"Movilidad, diagonales simples, emociones y micro-escenas.",music:"Gimnasia vocal, patrones rítmicos y melodías de 3 notas.",closing:"Exposición + escena corta + canción de 3 notas."},
  {title:"Semana 2 · Cuerpo y Movimiento",date:"Semana 2",focus:"Exploración expresiva a través de color, textura y movimiento.",arts:"Acuarelas, collage, modelado, contrastes y personajes.",body:"Secuencias adaptadas, disociaciones, musicalidad e improvisación.",music:"Patrones Orff, melodías de 4 notas y reconocimiento de notas.",closing:"Coreografía corta + escena + pieza musical."},
  {title:"Semana 3 · Música y Sonido",date:"Semana 3",focus:"Integración de color, forma y sonido.",arts:"Técnicas mixtas, modelado y obras visuales que acompañan música.",body:"Ritmo corporal, coordinación, personaje y escenas musicalizadas.",music:"Melodías de 5 notas, piano/xilófono, ukelele y lectura rítmica.",closing:"Ensamble + escena musicalizada + intervención visual."},
  {title:"Semana 4 · Arte Integrado",date:"Semana 4",focus:"Proyecto final que mezcla música, danza, teatro y artes plásticas.",arts:"Ilustración, escenografía y construcción visual.",body:"Montaje corporal, continuidad escénica y cohesión grupal.",music:"Integración vocal, percusión, teclado, ukelele y ensamble.",closing:"Performance final integrado."}
 ],
 prices:[
  {hours:"16 horas",title:"Semana especial",value:"$314.000",text:"Para semanas con festivo o programación reducida."},
  {hours:"20 horas",title:"1 semana completa",value:"$392.000",text:"Cinco jornadas de 4 horas.",featured:true},
  {hours:"40 horas",title:"2 semanas",value:"Consultar",text:"Valor según temporada."},
  {hours:"60 horas",title:"3 semanas",value:"Consultar",text:"Valor según temporada."},
  {hours:"80 horas",title:"4 semanas",value:"Consultar",text:"Valor según temporada."}
 ]
}
];

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const select=$("#seasonSelect");

function renderSeason(s){
 $("#seasonDates").textContent=s.dates;
 $("#seasonWeeksCount").textContent=`${s.weeks.length} ${s.weeks.length===1?"semana":"semanas"}`;
 $("#seasonSchedule").textContent=s.schedule;
 $("#seasonPlan").textContent=s.planLabel;
 $("#weeksIntro").textContent=s.intro;
 $("#weeksTitle").textContent=s.weeks.length===1?"Una semana, un ciclo completo":"Cada semana tiene identidad propia";

 const tabs=$("#weekTabs"), panels=$("#weekPanels");
 tabs.innerHTML=""; panels.innerHTML="";
 s.weeks.forEach((w,i)=>{
   const b=document.createElement("button");
   b.className="week-tab"+(i===0?" active":"");
   b.dataset.week=i;
   b.textContent=s.weeks.length===1?"Semana de Receso":`Semana ${i+1}`;
   tabs.appendChild(b);

   const p=document.createElement("div");
   p.className="week-panel"+(i===0?" active":"");
   p.dataset.panel=i;
   p.innerHTML=`<span class="week-date">${esc(w.date)}</span><h3>${esc(w.title)}</h3><p><b>Enfoque:</b> ${esc(w.focus)}</p>
   <div class="focus-grid">
    <article><h4>Artes</h4><p>${esc(w.arts)}</p></article>
    <article><h4>Danza + Teatro</h4><p>${esc(w.body)}</p></article>
    <article><h4>Música</h4><p>${esc(w.music)}</p></article>
    <article><h4>Cierre</h4><p>${esc(w.closing)}</p></article>
   </div>`;
   panels.appendChild(p);
 });
 tabs.querySelectorAll(".week-tab").forEach(b=>b.onclick=()=>{
   tabs.querySelectorAll(".week-tab").forEach(x=>x.classList.remove("active"));
   panels.querySelectorAll(".week-panel").forEach(x=>x.classList.remove("active"));
   b.classList.add("active");
   panels.querySelector(`[data-panel="${b.dataset.week}"]`)?.classList.add("active");
 });

 $("#priceSeasonLabel").textContent=s.label;
 $("#priceSeasonCopy").textContent=`Planes disponibles para ${s.name}.`;
 const grid=$("#priceGrid"); grid.innerHTML="";
 s.prices.forEach(x=>{
   const a=document.createElement("article");
   if(x.featured)a.classList.add("featured");
   a.innerHTML=`${x.featured?'<div class="ribbon">RECOMENDADO ✨</div>':""}
   <span class="hours">${esc(x.hours)}</span><h3>${esc(x.title)}</h3><strong>${esc(x.value)}</strong>
   <p>${esc(x.text)}</p><a class="btn ${x.featured?"primary":"secondary"}" href="https://musibot.imusicala.com/wa" target="_blank" rel="noopener">${x.value==="Consultar"?"Consultar":"Reservar"}</a>`;
   grid.appendChild(a);
 });
 localStorage.setItem("vacacionalSeason",s.id);
}

SEASONS.forEach(s=>{
 const o=document.createElement("option");o.value=s.id;o.textContent=s.name;select.appendChild(o);
});
const chosen=SEASONS.find(s=>s.id===localStorage.getItem("vacacionalSeason"))||SEASONS[0];
select.value=chosen.id;renderSeason(chosen);
select.onchange=()=>renderSeason(SEASONS.find(s=>s.id===select.value)||SEASONS[0]);
