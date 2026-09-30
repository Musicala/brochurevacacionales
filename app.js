const THEMES=[
{title:"Exploración Creativa",focus:"Adaptación al grupo, descubrimiento de materiales y juegos de ritmo, color y movimiento.",arts:"Trazos, mezclas simples, recorte seguro, color y mini-galería.",body:"Movilidad, diagonales, emociones, ritmo, escucha escénica y micro-escenas.",music:"Gimnasia vocal, patrones rítmicos y melodías de 3 notas.",closing:"Mini muestra interna: exposición + escena corta + canción sencilla."},
{title:"Cuerpo y Movimiento",focus:"Mayor exploración expresiva: color, textura, secuencias corporales y danza.",arts:"Acuarelas, collage, modelado, contrastes y personajes.",body:"Secuencias adaptadas, disociaciones, musicalidad, niveles e improvisación.",music:"Patrones Orff, melodías de 4 notas y reconocimiento de notas.",closing:"Coreografía corta + escena + pieza musical."},
{title:"Música y Sonido",focus:"Integración de color, forma y sonido.",arts:"Técnicas mixtas, modelado y obras visuales que acompañan música.",body:"Ritmo corporal, coordinación, personaje y escenas musicalizadas.",music:"Melodías de 5 notas, piano/xilófono, ukelele y lectura rítmica.",closing:"Ensamble + escena musicalizada + intervención visual."},
{title:"Arte Integrado",focus:"Proyecto que mezcla música, danza, teatro y artes plásticas.",arts:"Ilustración, escenografía, construcción visual y composición.",body:"Montaje corporal, continuidad escénica y cohesión grupal.",music:"Integración vocal, percusión, teclado, ukelele y ensamble.",closing:"Performance o proyecto final integrado."}
];

function makeWeeks(n,labelPrefix="Semana"){
 return Array.from({length:n},(_,i)=>({...THEMES[i%THEMES.length],label:`${labelPrefix} ${i+1}`}));
}

const SEASONS=[
{
 id:"receso-oct-2026",
 name:"Semana de Receso · Octubre 2026",
 dates:"5 al 9 de octubre de 2026",
 schedule:"9:00 a. m. – 1:00 p. m.",
 plan:"20 horas",
 weeks:[{...THEMES[3],label:"5 al 9 de octubre",title:"Semana de Receso · Arte Integrado"}],
 prices:[{hours:"20 horas",title:"Semana completa",value:"$392.000",text:"Cinco jornadas de 4 horas.",featured:true}],
 intro:"Una semana completa en la que las cuatro áreas se integran en un mismo ciclo."
},
{
 id:"jun-jul-2026",
 name:"Junio · Julio 2026",
 dates:"Junio y julio de 2026",
 schedule:"9:00 a. m. – 1:00 p. m.",
 plan:"1 a 9 semanas",
 weeks:makeWeeks(9),
 prices:[
  {hours:"16 horas",title:"Semana especial",value:"$314.000",text:"Para semanas con festivo o calendario reducido."},
  {hours:"20 horas",title:"1 semana completa",value:"$392.000",text:"Cinco jornadas de 4 horas.",featured:true},
  {hours:"40 horas",title:"2 semanas",value:"Consultar",text:"Valor según temporada."},
  {hours:"60 horas",title:"3 semanas",value:"Consultar",text:"Valor según temporada."},
  {hours:"80 horas",title:"4 semanas",value:"Consultar",text:"Valor según temporada."}
 ],
 intro:"Temporada extendida. Las semanas se organizan como ciclos independientes y la ruta temática rota para que cada semana tenga cierre propio."
}
];

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const select=$("#seasonSelect");
let current=null;

function renderWeek(i){
 const w=current.weeks[i];
 $("#weekPanel").innerHTML=`<div class="week-card">
  <div class="week-head"><span>${esc(w.label)}</span><h3>${esc(w.title)}</h3><p>${esc(w.focus)}</p></div>
  <div class="week-content"><div class="week-focus">
   <article><h4>🎨 Artes</h4><p>${esc(w.arts)}</p></article>
   <article><h4>🎭 Danza + Teatro</h4><p>${esc(w.body)}</p></article>
   <article><h4>🎵 Música</h4><p>${esc(w.music)}</p></article>
   <article><h4>✨ Cierre</h4><p>${esc(w.closing)}</p></article>
  </div></div></div>`;
 document.querySelectorAll(".week-tab").forEach((b,j)=>b.classList.toggle("active",j===i));
}

function renderSeason(s){
 current=s;
 $("#seasonDates").textContent=s.dates;
 $("#seasonCount").textContent=`${s.weeks.length} ${s.weeks.length===1?"semana":"semanas"}`;
 $("#seasonSchedule").textContent=s.schedule;
 $("#seasonPlan").textContent=s.plan;
 $("#weeksLead").textContent=s.intro;
 $("#weeksHeading").textContent=s.weeks.length===1?"Una semana, un ciclo completo":`${s.weeks.length} semanas disponibles`;
 $("#priceLabel").textContent=s.name.toUpperCase();
 $("#priceIntro").textContent=`Planes disponibles para ${s.name}.`;
 $("#heroMeta").innerHTML=`<span>📅 ${esc(s.dates)}</span><span>🕘 ${esc(s.schedule)}</span><span>🧒 4 a 15 años</span><span>📍 Bogotá</span>`;

 const tabs=$("#weekTabs");tabs.innerHTML="";
 s.weeks.forEach((w,i)=>{
  const b=document.createElement("button");b.className="week-tab";b.textContent=s.weeks.length===1?"Semana de Receso":`Semana ${i+1}`;b.onclick=()=>renderWeek(i);tabs.appendChild(b);
 });
 renderWeek(0);

 const pg=$("#pricesGrid");pg.innerHTML="";
 s.prices.forEach(p=>{
  const a=document.createElement("article");a.className="price-card"+(p.featured?" featured":"");
  a.innerHTML=`${p.featured?'<div class="ribbon">RECOMENDADO ✨</div>':""}<span class="hours">${esc(p.hours)}</span><h3>${esc(p.title)}</h3><strong>${esc(p.value)}</strong><p>${esc(p.text)}</p><a class="btn ${p.featured?"primary":"secondary"}" href="https://musibot.imusicala.com/wa" target="_blank" rel="noopener">${p.value==="Consultar"?"Consultar":"Reservar"}</a>`;
  pg.appendChild(a);
 });
 localStorage.setItem("vacacionalSeason",s.id);
}

SEASONS.forEach(s=>{const o=document.createElement("option");o.value=s.id;o.textContent=s.name;select.appendChild(o)});
const saved=SEASONS.find(s=>s.id===localStorage.getItem("vacacionalSeason"))||SEASONS[0];
select.value=saved.id;renderSeason(saved);
select.onchange=()=>renderSeason(SEASONS.find(s=>s.id===select.value)||SEASONS[0]);
