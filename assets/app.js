const canvas=document.querySelector('#game');
const ctx=canvas.getContext('2d');
const scoreEl=document.querySelector('#score');
const bestEl=document.querySelector('#best');
const heightEl=document.querySelector('#height');
const comboEl=document.querySelector('#combo');
const statusTitle=document.querySelector('#status-title');
const statusCopy=document.querySelector('#status-copy');
const overlay=document.querySelector('#overlay');
const kicker=document.querySelector('#overlay-kicker');
const title=document.querySelector('#overlay-title');
const copy=document.querySelector('#overlay-copy');
const startBtn=document.querySelector('#start');
const restartBtn=document.querySelector('#restart');
const pauseBtn=document.querySelector('#pause');
const dropBtn=document.querySelector('#drop');

const W=canvas.width,H=canvas.height,BH=34,BASE_W=260,BASE_Y=H-90;
let score=0,best=Number(window.TOWER_STATS.highScore||0),height=1,combo=0;
let running=false,paused=false,ended=false,last=0,raf=0,cameraY=0,direction=1,current=null;
let blocks=[],falling=[],particles=[];

function color(i){return `hsl(${(205+i*17)%360} 72% 62%)`}
function speed(){return Math.min(520,190+height*13)}

function reset(){
 cancelAnimationFrame(raf);
 score=0;height=1;combo=0;running=false;paused=false;ended=false;last=0;cameraY=0;
 falling=[];particles=[];
 blocks=[{x:W/2-BASE_W/2,y:BASE_Y,width:BASE_W,height:BH,color:color(0)}];
 spawn();ui();draw();
 show('READY','Stack the tower.','Click, tap or press Space to drop the moving block.','Start game');
}
function spawn(){
 const prev=blocks.at(-1),left=height%2===1;
 direction=left?1:-1;
 current={x:left?-prev.width-40:W+40,y:prev.y-BH,width:prev.width,height:BH,color:color(height)};
}
function ui(){
 scoreEl.textContent=score;bestEl.textContent=best;heightEl.textContent=height;comboEl.textContent=`${combo}×`;
 if(paused){statusTitle.textContent='Paused';statusCopy.textContent='Press P or Continue to resume.'}
 else if(running){statusTitle.textContent=combo>=2?`Perfect ×${combo}`:`Block ${height+1}`;statusCopy.textContent=`Speed ${speed().toFixed(0)} px/s`}
 else{statusTitle.textContent='Ready';statusCopy.textContent='Perfect placements build combo and restore a little width.'}
}
function show(k,t,c,b){kicker.textContent=k;title.textContent=t;copy.textContent=c;startBtn.textContent=b;overlay.hidden=false}
function hide(){overlay.hidden=true}
function start(){if(ended)reset();if(!running){running=true;paused=false;hide();last=performance.now();raf=requestAnimationFrame(loop)}}
function addScore(n){score+=n;if(score>best)best=score;ui()}
function burst(x,y){
 for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*120;particles.push({x,y:y-cameraY,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.3+Math.random()*.45,max:.75})}
}
function drop(){
 if(!running||paused||ended||!current)return;
 const prev=blocks.at(-1);
 const left=Math.max(current.x,prev.x),right=Math.min(current.x+current.width,prev.x+prev.width);
 let overlap=right-left;
 const offset=current.x-prev.x;
 const perfect=Math.abs(offset)<=Math.min(7,Math.max(3,current.width*.03));

 if(overlap<=0){
   falling.push({...current,vx:direction*90,vy:30,rotation:0,spin:direction*1.7});
   current=null;gameOver();return;
 }

 if(perfect){
   combo++;
   const restored=Math.min(BASE_W,prev.width+Math.min(10,2+combo*.8));
   current.x=prev.x-(restored-prev.width)/2;current.width=restored;
   addScore(100+combo*30);burst(current.x+current.width/2,current.y);
 } else {
   combo=0;
   const overhang=current.width-overlap;
   if(overhang>.5){
     falling.push({
       x:current.x<prev.x?current.x:right,y:current.y,width:overhang,height:BH,color:current.color,
       vx:direction*70,vy:20,rotation:0,spin:direction*(1.2+Math.random()*.8)
     });
   }
   current.x=left;current.width=overlap;addScore(25+Math.round(overlap/8));
 }

 blocks.push({...current});height++;current=null;
 const top=blocks.at(-1).y-cameraY;if(top<H*.38)cameraY-=H*.38-top;
 spawn();ui();
}
function update(dt){
 if(current){
   current.x+=direction*speed()*dt;
   if(direction>0&&current.x>W+current.width+30)current.x=-current.width-30;
   if(direction<0&&current.x+current.width<-30)current.x=W+30;
 }
 for(const p of falling){p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rotation+=p.spin*dt}
 falling=falling.filter(p=>p.y-cameraY<H+250);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=250*dt;p.life-=dt}
 particles=particles.filter(p=>p.life>0);
}
function drawBg(){
 ctx.fillStyle='#0b0f16';ctx.fillRect(0,0,W,H);
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(74,100,140,.10)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(255,255,255,.025)';ctx.lineWidth=1;
 for(let y=-((cameraY*.18)%52);y<H;y+=52){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
}
function drawBlock(b){
 const y=b.y-cameraY;if(y<-80||y>H+80)return;
 ctx.fillStyle=b.color;ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=10;ctx.shadowOffsetY=6;
 ctx.beginPath();ctx.roundRect(b.x,y,b.width,b.height,7);ctx.fill();
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(b.x+8,y+5,Math.max(0,b.width-16),3);
}
function drawPiece(p){
 const y=p.y-cameraY;ctx.save();ctx.translate(p.x+p.width/2,y+p.height/2);ctx.rotate(p.rotation);
 ctx.globalAlpha=.88;ctx.fillStyle=p.color;ctx.beginPath();ctx.roundRect(-p.width/2,-p.height/2,p.width,p.height,6);ctx.fill();ctx.restore();ctx.globalAlpha=1;
}
function draw(){
 ctx.clearRect(0,0,W,H);drawBg();
 ctx.fillStyle='rgba(255,255,255,.45)';ctx.font='700 12px system-ui';ctx.textAlign='left';ctx.fillText(`HEIGHT ${height}`,14,20);ctx.textAlign='right';ctx.fillText(`COMBO ${combo}x`,W-14,20);
 for(const b of blocks)drawBlock(b);if(current)drawBlock(current);for(const p of falling)drawPiece(p);
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle='#78e6ae';ctx.fillRect(p.x,p.y,3,3)}ctx.globalAlpha=1;
}
function loop(t){if(!running||paused||ended){draw();return}const dt=Math.min((t-last)/1000,.032);last=t;update(dt);draw();if(running&&!paused&&!ended)raf=requestAnimationFrame(loop)}
async function save(){
 try{
   const r=await fetch('score.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score,height})});
   const d=await r.json();if(r.ok){best=Number(d.highScore||best);ui()}
 }catch{}
}
function gameOver(){
 if(ended)return;running=false;paused=false;ended=true;void save();
 show('GAME OVER',`${score} points`,`Tower height: ${height}. Best score: ${Math.max(score,best)}.`,'Play again');
}
function togglePause(){
 if(ended||(!running&&!paused))return;
 paused=!paused;
 if(paused){running=false;cancelAnimationFrame(raf);ui();show('PAUSED','Tower frozen.','Continue when ready.','Continue')}
 else{hide();running=true;last=performance.now();ui();raf=requestAnimationFrame(loop)}
}
function action(){if(paused){togglePause();return}if(!running){start();return}drop()}
document.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();action()}if(e.key.toLowerCase()==='p'){e.preventDefault();togglePause()}});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();action()});
dropBtn.addEventListener('pointerdown',e=>{e.preventDefault();action()});
startBtn.addEventListener('click',()=>paused?togglePause():start());
pauseBtn.addEventListener('click',()=>{if(paused)togglePause();else if(running)togglePause()});
restartBtn.addEventListener('click',reset);
reset();
