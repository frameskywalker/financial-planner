function SidebarPyramid({ step }) {
  const active = PYRAMID_HIGHLIGHTS[step] || [];
  const fc = id => active.includes(id) ? LAYER_COLORS[id] : NEUTRAL;
  return (
    <svg viewBox="0 0 220 195" width="100%" style={{display:"block"}}>
      <polygon points="110,10 66,78 154,78" fill={fc("invest")} style={{transition:"fill .4s"}}/>
      <polygon points="66,82 97,82 88,126 44,126" fill={fc("short")} style={{transition:"fill .4s"}}/>
      <polygon points="101,82 119,82 119,126 101,126" fill={fc("mid")} style={{transition:"fill .4s"}}/>
      <polygon points="123,82 154,82 176,126 132,126" fill={fc("long")} style={{transition:"fill .4s"}}/>
      <line x1="66" y1="82" x2="154" y2="82" stroke="white" strokeWidth=".5" opacity=".4"/>
      <line x1="99" y1="82" x2="90" y2="126" stroke="white" strokeWidth=".8" opacity=".5"/>
      <line x1="121" y1="82" x2="130" y2="126" stroke="white" strokeWidth=".8" opacity=".5"/>
      <polygon points="44,130 108,130 108,182 14,182" fill={fc("liq")} style={{transition:"fill .4s"}}/>
      <polygon points="112,130 176,130 206,182 112,182" fill={fc("risk")} style={{transition:"fill .4s"}}/>
      <line x1="44" y1="130" x2="176" y2="130" stroke="white" strokeWidth=".5" opacity=".3"/>
      <line x1="110" y1="130" x2="110" y2="182" stroke="white" strokeWidth=".8" opacity=".35"/>
      {[["110","48","Investment"],["110","62","ลงทุน"],["66","108","Short"],["110","108","Mid"],["154","108","Long"],["60","151","Basic Liquidity"],["60","163","สำรองสภาพคล่อง"],["158","151","Risk Transfer"],["158","163","โอนย้ายความเสี่ยง"]].map(([x,y,t],i)=>
        <text key={i} x={x} y={y} textAnchor="middle" fontFamily="Sarabun,sans-serif" fontSize={i<2?9.5:i===2||i===3||i===4?8.5:i===5||i===7?8:7} fontWeight={i===0||i===2||i===3||i===4||i===5||i===7?700:400} fill={i===1||i===6||i===8?"rgba(255,255,255,0.7)":"white"}>{t}</text>
      )}
      <text fontFamily="Sarabun,sans-serif" fontSize="7.5" fill="#9BA8B8" transform="translate(16,150) rotate(-72)">Tax Planning · วางแผนภาษี</text>
    </svg>
  );
}

// ─── CALC HELPERS ────────────────────────────────────────────────────────
function useCalcs(D) {
  const mEq=r=>(r.freq==="yearly"?(r.amt||0)/12:(r.amt||0));
  const totIn = D.income.reduce((s,r)=>s+mEq(r),0);
  const totFix = D.fixed.reduce((s,r)=>s+mEq(r),0);
  const totVar = D.variable.reduce((s,r)=>s+mEq(r),0);
  const totOut = totFix+totVar;
  const net = totIn-(totOut+D.savings);
  const savRate = totIn>0?Math.round(D.savings/totIn*100):0;
  const liqGoal = D.expense*D.mult;
  const liqGap = Math.max(0,liqGoal-D.saved);
  const liqPct = liqGoal>0?Math.min(100,Math.round(D.saved/liqGoal*100)):0;
  const protLife = Object.values(D.lifeIns).filter(v=>v>0).length;
  const protNl = Object.values(D.nonLife).filter(v=>v>0).length;
  const protTot = protLife+protNl;
  const ca = calcAge(D.dob)||35;
  const ytr = Math.max(0,(D.retAge||60)-ca);
  const yir = Math.max(0,(D.lifeExp||85)-(D.retAge||60));
  const inf=(D.infl||3)/100,ra2=(D.retAfter||3)/100,rb=(D.retBefore||6)/100;
  const fm=(D.monthlyNeed||0)*Math.pow(1+inf,ytr);
  let needed=0; if(ra2>0&&yir>0) needed=fm*12*(1-Math.pow(1+ra2,-yir))/ra2;
  let prepFV=0; D.retAssets.forEach(a=>{const pv=a.cv||0,r=(a.rr||0)/100;prepFV+=pv*Math.pow(1+r,ytr);});
  const retGap=Math.max(0,needed-prepFV);
  const mSave=(rb>0&&ytr>0)?retGap*(rb/12)/(Math.pow(1+rb/12,ytr*12)-1):(ytr>0?retGap/(ytr*12):0);
  const m4=retGap>0?retGap*(0.04/12)/(Math.pow(1+0.04/12,ytr*12)-1):0;
  const m8=retGap>0?retGap*(0.08/12)/(Math.pow(1+0.08/12,ytr*12)-1):0;
  // ── cross-page derived figures ──
  let eduTotal=0;
  (D.children||[]).forEach((ch,ci)=>{const cAge=parseInt(ch.a)||0;const ed=(D.eduData&&D.eduData[ci])||[];EDU_LEVELS.forEach((l,li)=>{const y=Math.max(0,l.sa-cAge),cost=ed[li]?.cost||0;eduTotal+=cost*l.y*Math.pow(1.06,y);});});
  const annualIncome=totIn*12;
  const suggCover=annualIncome*10;            // income-replacement: 10× annual income
  const suggCoverTotal=suggCover+eduTotal;    // + children's education funding
  const cfExpense=Math.round(totOut);          // monthly expense from Cash Flow
  return {totIn,totFix,totVar,totOut,net,savRate,liqGoal,liqGap,liqPct,protLife,protNl,protTot,ca,ytr,yir,fm,needed,prepFV,retGap,mSave,m4,m8,rb,eduTotal,annualIncome,suggCover,suggCoverTotal,cfExpense};
}

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────
// THB formatted input — shows xx,xxx live as user types, stores raw number
function Input({value,onChange,type="number",placeholder="0",style={},suffix}) {
  const [focused,setFocused]=useState(false);
  const [display,setDisplay]=useState(value>0?value.toLocaleString("th-TH"):"");

  useEffect(()=>{if(!focused)setDisplay(value>0?Math.round(value).toLocaleString("th-TH"):"");},[value,focused]);

  const isTHB = type==="number";

  const handleChange=(e)=>{
    if(!isTHB){onChange(e.target.value);return;}
    const raw=e.target.value.replace(/,/g,"");
    if(raw===""||raw==="-"){setDisplay(raw);onChange(0);return;}
    const num=parseFloat(raw);
    if(isNaN(num)){return;}
    setDisplay(num.toLocaleString("th-TH"));
    onChange(Math.round(num));
  };

  const handleFocus=()=>{
    setFocused(true);
    if(isTHB&&value>0)setDisplay(value.toString());
  };

  const handleBlur=()=>{
    setFocused(false);
    if(isTHB)setDisplay(value>0?Math.round(value).toLocaleString("th-TH"):"");
  };

  return (
    <div style={{position:"relative"}}>
      <input
        type="text"
        inputMode={isTHB?"numeric":"text"}
        value={isTHB?display:(value||"")}
        placeholder={isTHB?"0":placeholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{...s.input,paddingRight:suffix?28:12,border:focused?"1px solid #3B82F6":"1px solid #E5E7EB",boxShadow:focused?"0 0 0 3px rgba(59,130,246,.12)":"none",textAlign:isTHB?"right":"left",...style}}/>
      {suffix&&<span style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#8A9A8A",pointerEvents:"none"}}>{suffix}</span>}
    </div>
  );
}
function ToggleBtn({active,onClick,children}) {
  return <button onClick={onClick} style={{flex:1,padding:"8px",borderRadius:10,border:`1px solid ${active?"#3B82F6":"#E5E7EB"}`,fontSize:13,fontFamily:"'Kanit',sans-serif",cursor:"pointer",color:active?"white":"#4A4A4A",background:active?"#3B82F6":"white",fontWeight:active?600:400,textAlign:"center",transition:"all .15s"}}>{children}</button>;
}
function MultBtn({active,onClick,num,sub}) {
  return <button onClick={onClick} style={{flex:1,padding:"11px 4px",borderRadius:12,border:`1px solid ${active?"#3B82F6":"#E5E7EB"}`,fontFamily:"'Kanit',sans-serif",cursor:"pointer",background:active?"#3B82F6":"white",textAlign:"center",transition:"all .15s"}}>
    <span style={{display:"block",fontSize:20,fontWeight:700,color:active?"white":"#1A1A1A"}}>{num}</span>
    <span style={{display:"block",fontSize:11,color:active?"rgba(255,255,255,.6)":"#8A9A8A",marginTop:1}}>{sub}</span>
  </button>;
}
function AddBtn({onClick,children}) {
  return <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:7,border:`1px dashed #93C5FD`,borderRadius:10,background:"#EFF6FF",fontSize:13,color:"#3B82F6",fontWeight:600,cursor:"pointer",fontFamily:"'Kanit',sans-serif",marginTop:8}}>
    {children}
  </button>;
}
function DelBtn({onClick}) {
  return <button onClick={onClick} style={{border:"none",background:"#FDECEA",color:"#A33030",borderRadius:6,cursor:"pointer",fontSize:12,padding:"4px 8px"}}>✕</button>;
}
function TabBtn({active,onClick,children}) {
  return <button onClick={onClick} style={{padding:"8px 14px",fontSize:13,fontFamily:"'Kanit',sans-serif",cursor:"pointer",background:"none",border:"none",color:active?"#3B82F6":"#8A9A8A",fontWeight:active?600:400,borderBottom:`2px solid ${active?"#3B82F6":"transparent"}`,marginBottom:-1,transition:"all .15s"}}>
    {children}
  </button>;
}
function SpBlock({label,children,sub}) {
  return <div style={{marginBottom:".625rem"}}>
    <div style={s.spLbl}>{label}</div>
    <div style={s.spVal}>{children}</div>
    {sub&&<div style={s.spSub}>{sub}</div>}
  </div>;
}
function SpDiv() { return <div style={s.spDiv}/>; }
function GaugeBar({pct,color}) {
  return <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden",flex:1}}>
    <div style={{height:"100%",borderRadius:3,width:`${pct}%`,background:color,transition:"width .4s"}}/>
  </div>;
}
function ProgBar({pct,color=C.gold2}) {
  return <div style={{height:4,background:"rgba(255,255,255,.1)",borderRadius:2,overflow:"hidden"}}>
    <div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:color,transition:"width .4s"}}/>
  </div>;
}

function LevelCard({lv}) {
  return <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:12,padding:"10px 12px 10px 14px",marginBottom:8,position:"relative",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
    <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:lv.c}}/>
    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
      <span style={{fontSize:9,fontWeight:700,color:"white",background:lv.c,borderRadius:5,padding:"2px 7px",letterSpacing:".04em"}}>{lv.num}</span>
      <span style={{fontSize:13,fontWeight:700,color:C.navy}}>{lv.label}</span>
    </div>
    <div style={{fontSize:10,color:C.text3,marginBottom:6,marginLeft:1}}>{lv.en}</div>
    {lv.items.map((it,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:3}}>
      <div style={{width:4,height:4,borderRadius:"50%",background:lv.c,flexShrink:0,marginTop:6}}/>
      <span style={{fontSize:11,color:C.text2,lineHeight:1.45}}>{it}</span>
    </div>)}
  </div>;
}
// Full-size version of SidebarPyramid — all layers always active
function FullPyramid() {
  const col={invest:LEVEL_C.invest,short:LEVEL_C.goals,mid:LEVEL_C.goals,long:LEVEL_C.goals,liq:LEVEL_C.liq,risk:LEVEL_C.risk};
  return <svg viewBox="0 0 220 195" width="100%" style={{display:"block"}}>
    <polygon points="110,10 66,78 154,78" fill={col.invest}/>
    <polygon points="66,82 97,82 88,126 44,126" fill={col.short}/>
    <polygon points="101,82 119,82 119,126 101,126" fill={col.mid}/>
    <polygon points="123,82 154,82 176,126 132,126" fill={col.long}/>
    <line x1="66" y1="82" x2="154" y2="82" stroke="white" strokeWidth=".5" opacity=".4"/>
    <line x1="99" y1="82" x2="90" y2="126" stroke="white" strokeWidth=".8" opacity=".5"/>
    <line x1="121" y1="82" x2="130" y2="126" stroke="white" strokeWidth=".8" opacity=".5"/>
    <polygon points="44,130 108,130 108,182 14,182" fill={col.liq}/>
    <polygon points="112,130 176,130 206,182 112,182" fill={col.risk}/>
    <line x1="44" y1="130" x2="176" y2="130" stroke="white" strokeWidth=".5" opacity=".3"/>
    <line x1="110" y1="130" x2="110" y2="182" stroke="white" strokeWidth=".8" opacity=".35"/>
    {[["110","48","Investment"],["110","62","ลงทุน"],["66","108","Short"],["110","108","Mid"],["154","108","Long"],["60","151","Basic Liquidity"],["60","163","สำรองสภาพคล่อง"],["158","151","Risk Transfer"],["158","163","โอนย้ายความเสี่ยง"]].map(([x,y,t],i)=>
      <text key={i} x={x} y={y} textAnchor="middle" fontFamily="'Kanit',sans-serif"
        fontSize={i<2?9.5:i<=4?8.5:i===5||i===7?8:7}
        fontWeight={[0,2,3,4,5,7].includes(i)?700:400}
        fill={[1,6,8].includes(i)?"rgba(255,255,255,0.7)":"white"}>{t}</text>)}
    <text fontFamily="'Kanit',sans-serif" fontSize="7.5" fill="#9BA8B8" transform="translate(16,150) rotate(-72)">Tax Planning · วางแผนภาษี</text>
  </svg>;
}
function DatePicker({value,onChange,label}) {
  return <div>
    <label style={s.label}>{label}</label>
    <input type="date" value={value||""} onChange={e=>onChange(e.target.value)}
      style={{...s.input,cursor:"pointer",colorScheme:"light"}}/>
  </div>;
}
function gStatus(v,b){const r=v/b;if(r>=0.8)return{lbl:"สมบูรณ์",col:C.teal,pct:100};if(r>=0.3)return{lbl:"ควรเพิ่ม",col:"#D4941A",pct:Math.round(r*100)};return{lbl:"ยังไม่มี",col:C.red,pct:Math.round(r*100)};}
function GaugeBlock({label,value,onChange,bench}) {
  const st=gStatus(value,bench);
  return <div style={{marginBottom:12}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 150px",gap:".625rem",alignItems:"center",marginBottom:4}}>
      <label style={{...s.label,margin:0}}>{label}</label>
      <Input value={value} onChange={onChange} suffix="฿" style={{textAlign:"right"}}/>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <GaugeBar pct={st.pct} color={st.col}/>
      <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,fontWeight:600,background:st.col==="var(--teal)"||st.col===C.teal?C.tealLight:st.col==="#D4941A"?C.amberLight:C.redLight,color:st.col,whiteSpace:"nowrap"}}>{st.lbl}</span>
    </div>
  </div>;
}
function GoalRows({goals,onAdd,onDel,onUpd,presets,label,color}) {
  const [showDrop,setShowDrop]=useState(false);
  const [q,setQ]=useState("");
  const filtered=presets.filter(p=>p.includes(q));
  return <div style={{borderBottom:"0.5px solid rgba(0,0,0,0.07)",paddingBottom:".75rem",marginBottom:".75rem"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <span style={{width:3,height:13,borderRadius:2,background:color,display:"inline-block"}}/>
        <span style={{fontSize:13,fontWeight:700,color:"#1A1A1A"}}>{label}</span>
        <span style={{fontSize:11,color:"#8A9A8A"}}>{goals.length} รายการ · {fmt(goals.reduce((s,g)=>s+(g.a||0),0))} ฿</span>
      </div>
      <div style={{position:"relative"}}>
        <button onClick={()=>{setShowDrop(v=>!v);setQ("");}} style={{fontSize:12,color:"#3B82F6",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600,display:"flex",alignItems:"center",gap:3}}>+ เพิ่ม ▾</button>
        {showDrop&&<div style={{position:"absolute",right:0,top:"100%",zIndex:99,background:"white",border:"0.5px solid rgba(0,0,0,0.12)",borderRadius:10,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",width:200,padding:8}}>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหา..." style={{width:"100%",border:"0.5px solid rgba(0,0,0,0.12)",borderRadius:7,padding:"5px 9px",fontSize:13,fontFamily:"inherit",marginBottom:5,outline:"none"}}/>
          {filtered.map(p=><div key={p} onClick={()=>{onAdd(p);setShowDrop(false);setQ("");}} style={{padding:"5px 9px",fontSize:13,cursor:"pointer",borderRadius:6,color:"#1A1A1A"}} onMouseEnter={e=>e.target.style.background="#F0EDE6"} onMouseLeave={e=>e.target.style.background="none"}>{p}</div>)}
          {q&&!filtered.includes(q)&&<div onClick={()=>{onAdd(q);setShowDrop(false);setQ("");}} style={{padding:"5px 9px",fontSize:13,cursor:"pointer",borderRadius:6,color:"#3B82F6",fontWeight:600}}>+ "{q}"</div>}
        </div>}
      </div>
    </div>
    {goals.length===0&&<div style={{fontSize:12,color:"#9BA8A0",padding:"6px 0"}}>ยังไม่มีเป้าหมาย — กด + เพิ่ม</div>}
    {goals.map((g,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 130px 90px 26px",gap:5,alignItems:"center",marginBottom:4}}>
      <input value={g.n} placeholder="ชื่อเป้าหมาย" onChange={e=>onUpd(i,"n",e.target.value)} style={{...s.input,fontSize:13}}/>
      <Input value={g.a} onChange={v=>onUpd(i,"a",v)} suffix="฿"/>
      <input value={g.y||""} type="text" placeholder={String(new Date().getFullYear()+1)} onChange={e=>onUpd(i,"y",e.target.value)} style={{...s.input,fontSize:13}}/>
      <DelBtn onClick={()=>onDel(i)}/>
    </div>)}
  </div>;
}
const CF_PRESETS={
  income:["เงินเดือน","โบนัส","รายได้ค้าขาย","Freelance","ค่าเช่า","เงินปันผล","รายได้ออนไลน์","อื่นๆ"],
  fixed:["ผ่อนบ้าน/จำนอง","ผ่อนรถ","ค่าเช่าที่อยู่","ประกันชีวิต","ประกันสุขภาพ","ค่าโทรศัพท์","ค่าอินเทอร์เน็ต","ผ่อนสินค้า","อื่นๆ"],
  variable:["ค่าอาหาร","ค่าเดินทาง","ช้อปปิ้ง","ท่องเที่ยว","ค่าบันเทิง","ค่าสาธารณูปโภค","ค่ารักษาพยาบาล","ของขวัญ","อื่นๆ"],
};

// Category icon mapping
const CF_ICONS={
  "เงินเดือน":"💼","โบนัส":"🎁","รายได้ค้าขาย":"🛒","Freelance":"💻","ค่าเช่า":"🏠","เงินปันผล":"📈","รายได้ออนไลน์":"🌐",
  "ผ่อนบ้าน/จำนอง":"🏠","ผ่อนรถ":"🚗","ค่าเช่าที่อยู่":"🏢","ประกันชีวิต":"🛡","ประกันสุขภาพ":"❤️","ค่าโทรศัพท์":"📱","ค่าอินเทอร์เน็ต":"📡","ผ่อนสินค้า":"🛍",
  "ค่าอาหาร":"🍜","ค่าเดินทาง":"🚌","ช้อปปิ้ง":"🛍","ท่องเที่ยว":"✈️","ค่าบันเทิง":"🎬","ค่าสาธารณูปโภค":"💡","ค่ารักษาพยาบาล":"🏥","ของขวัญ":"🎀",
};
const cfIcon=(lbl)=>CF_ICONS[lbl]||"💰";

function CFAddBtn({category,onAdd,btnStyle={}}) {
  const [open,setOpen]=useState(false);
  const [q,setQ]=useState("");
  const [pos,setPos]=useState({top:0,right:0});
  const btnRef=React.useRef(null);
  const presets=CF_PRESETS[category]||[];
  const filtered=presets.filter(p=>p.includes(q));
  const handleOpen=()=>{
    if(!open&&btnRef.current){
      const r=btnRef.current.getBoundingClientRect();
      setPos({top:r.bottom+6,right:window.innerWidth-r.right});
    }
    setOpen(v=>!v);setQ("");
  };
  useEffect(()=>{
    if(!open)return;
    const close=e=>{if(!e.target.closest('[data-cfpopup]'))setOpen(false);};
    document.addEventListener('mousedown',close);
    return()=>document.removeEventListener('mousedown',close);
  },[open]);
  return <div style={{position:"relative"}} data-cfpopup="1">
    <button ref={btnRef} onClick={handleOpen} style={{fontSize:12,color:"white",background:"#3B82F6",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600,padding:"6px 14px",borderRadius:20,display:"flex",alignItems:"center",gap:4,...btnStyle}}>+ เพิ่ม</button>
    {open&&<div data-cfpopup="1" style={{position:"fixed",right:pos.right,top:pos.top,zIndex:9999,background:"white",border:"0.5px solid rgba(0,0,0,0.10)",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,0.16)",width:220,padding:10}}>
      <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหา..." style={{width:"100%",border:"0.5px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"6px 10px",fontSize:13,fontFamily:"inherit",marginBottom:6,outline:"none",background:"#F8F8FA"}}/>
      <div style={{maxHeight:220,overflowY:"auto"}}>
        {filtered.map(p=><div key={p} onClick={()=>{onAdd(p);setOpen(false);setQ("");}} style={{padding:"6px 10px",fontSize:13,cursor:"pointer",borderRadius:7,color:"#1A1A1A",display:"flex",alignItems:"center",gap:7}} onMouseEnter={e=>e.currentTarget.style.background="#F3F4F6"} onMouseLeave={e=>e.currentTarget.style.background="none"}><span>{cfIcon(p)}</span>{p}</div>)}
        {q&&!filtered.includes(q)&&<div onClick={()=>{onAdd(q);setOpen(false);setQ("");}} style={{padding:"6px 10px",fontSize:13,cursor:"pointer",borderRadius:7,color:"#3B82F6",fontWeight:600}}>+ "{q}"</div>}
      </div>
    </div>}
  </div>;
}

const CFI_NEW={fontFamily:"inherit",fontSize:13,color:"#1A1A1A",background:"transparent",border:"none",outline:"none",width:"100%",boxSizing:"border-box",padding:"0"};

function FreqToggle({freq,onChange}) {
  const isY=freq==="yearly";
  return <button onClick={()=>onChange(isY?"monthly":"yearly")} style={{fontSize:10,fontWeight:600,fontFamily:"inherit",cursor:"pointer",border:`1px solid ${isY?"#3B82F6":"#E5E7EB"}`,borderRadius:6,padding:"3px 7px",background:isY?"#EFF6FF":"transparent",color:isY?"#3B82F6":"#9CA3AF",whiteSpace:"nowrap",transition:"all .15s"}}>
    {isY?"รายปี":"รายเดือน"}
  </button>;
}

// Donut for stats panel
function CFDonut({income,expenses,savings}) {
  const net=Math.max(0,income-(expenses+savings));
  const total=income||1;
  const R=52,cx=65,cy=65,circ=2*Math.PI*R;
  const expP=expenses/total,savP=savings/total,remP=net/total;
  const d1=expP*circ,d2=savP*circ,d3=remP*circ;
  return <svg viewBox="0 0 130 130" width={130} height={130} style={{display:"block",margin:"0 auto"}}>
    <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3F4F6" strokeWidth={20}/>
    {income>0&&<>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1F2937" strokeWidth={20} strokeDasharray={`${d1} ${circ-d1}`} strokeDashoffset={0} transform={`rotate(-90 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#93C5FD" strokeWidth={20} strokeDasharray={`${d2} ${circ-d2}`} strokeDashoffset={-d1} transform={`rotate(-90 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#D1D5DB" strokeWidth={20} strokeDasharray={`${d3} ${circ-d3}`} strokeDashoffset={-(d1+d2)} transform={`rotate(-90 ${cx} ${cy})`}/>
    </>}
    <text x={cx} y={cy-7} textAnchor="middle" fontSize={9} fill="#9CA3AF" fontFamily="Kanit,sans-serif">Total</text>
    <text x={cx} y={cy+10} textAnchor="middle" fontSize={13} fill="#111827" fontFamily="Kanit,sans-serif" fontWeight="700">{fmtM(income)}</text>
  </svg>;
}

// Transaction row used in both income & expense lists
function TxRow({icon,label,amount,freq,onChangeLabel,onChangeAmt,onChangeFreq,onDel,isIncome}) {
  return <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",borderBottom:"1px solid #F3F4F6",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
    <div style={{width:36,height:36,borderRadius:12,background:isIncome?"#EFF6FF":"#F9FAFB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>
    <div style={{flex:1,minWidth:0}}>
      <input value={label} onChange={e=>onChangeLabel(e.target.value)} style={{...CFI_NEW,fontSize:13,fontWeight:500,color:"#111827",display:"block"}} placeholder="ชื่อรายการ"/>
      <div style={{fontSize:11,color:"#9CA3AF",marginTop:1}}>{isIncome?"รายรับ":"รายจ่าย"}</div>
    </div>
    <FreqToggle freq={freq||"monthly"} onChange={onChangeFreq}/>
    <div style={{width:110,textAlign:"right"}}>
      <Input value={amount} onChange={onChangeAmt} suffix="฿" style={{textAlign:"right",background:"#F9FAFB",borderRadius:8,padding:"5px 28px 5px 8px",fontSize:13}}/>
    </div>
    <button onClick={onDel} style={{width:24,height:24,border:"none",background:"#FEE2E2",color:"#EF4444",borderRadius:7,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
  </div>;
}

// ─── THAI PROGRESSIVE TAX ───────────────────────────────────────────────
function calcThaiTax(annualIncome) {
  // No deductions — raw income vs brackets
  const brackets = [
    { min:0,       max:150000,  rate:0   },
    { min:150000,  max:300000,  rate:0.05 },
    { min:300000,  max:500000,  rate:0.10 },
    { min:500000,  max:750000,  rate:0.15 },
    { min:750000,  max:1000000, rate:0.20 },
    { min:1000000, max:2000000, rate:0.25 },
    { min:2000000, max:5000000, rate:0.30 },
    { min:5000000, max:Infinity,rate:0.35 },
  ];

  let tax = 0;
  let topRate = 0;
  for (const b of brackets) {
    if (annualIncome <= b.min) break;
    const portion = Math.min(annualIncome, b.max) - b.min;
    tax += portion * b.rate;
    if (b.rate > 0 && annualIncome > b.min) topRate = b.rate;
  }
  return { tax, topRate, taxable: annualIncome };
}

function TaxCard({ annualIncome }) {
  const { tax, topRate, taxable } = calcThaiTax(annualIncome || 0);
  const taxPerMonth = tax / 12;
  const effectiveRate = annualIncome > 0 ? (tax / annualIncome) * 100 : 0;

  const bracketLabel = topRate === 0 ? "ไม่ถึงเกณฑ์เสียภาษี" :
    topRate === 0.05 ? "5%" : topRate === 0.10 ? "10%" :
    topRate === 0.15 ? "15%" : topRate === 0.20 ? "20%" :
    topRate === 0.25 ? "25%" : topRate === 0.30 ? "30%" : "35%";

  const bracketColor = topRate === 0 ? "#10B981" :
    topRate <= 0.10 ? "#3B82F6" :
    topRate <= 0.20 ? "#F59E0B" :
    topRate <= 0.25 ? "#F97316" : "#EF4444";

  return (
    <div style={{background:"white",borderRadius:16,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,borderRadius:10,background:"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🧾</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>ภาษีเงินได้บุคคลธรรมดา</div>
            <div style={{fontSize:11,color:"#9CA3AF"}}>คำนวณจากรายรับต่อปี · อัตราขั้นบันได</div>
          </div>
        </div>
        {/* Bracket badge */}
        <div style={{display:"flex",alignItems:"center",gap:6,background:bracketColor+"18",border:`1px solid ${bracketColor}40`,borderRadius:20,padding:"5px 14px"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:bracketColor,flexShrink:0}}/>
          <span style={{fontSize:12,fontWeight:700,color:bracketColor}}>เกณฑ์ภาษี {bracketLabel}</span>
        </div>
      </div>

      {/* 3 KPI boxes */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"#F9FAFB",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:"#6B7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:5}}>รายได้ต่อปี</div>
          <div style={{fontSize:20,fontWeight:700,color:"#111827"}}>{fmt(taxable)}</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>฿ / ปี</div>
        </div>
        <div style={{background: tax>0?"#FFF7ED":"#F0FDF4",borderRadius:12,padding:"12px 14px",border:`1px solid ${tax>0?"#FED7AA":"#BBF7D0"}`}}>
          <div style={{fontSize:10,color:"#6B7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:5}}>ภาษีที่ต้องจ่าย/ปี</div>
          <div style={{fontSize:20,fontWeight:700,color:tax>0?"#EA580C":"#16A34A"}}>{fmt(tax)}</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>฿ / ปี</div>
        </div>
        <div style={{background:"#F9FAFB",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:"#6B7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:5}}>เฉลี่ยต่อเดือน</div>
          <div style={{fontSize:20,fontWeight:700,color:"#111827"}}>{fmt(taxPerMonth)}</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>฿ / เดือน</div>
        </div>
      </div>

      {/* Bracket breakdown mini visual */}
      <div style={{background:"#F9FAFB",borderRadius:10,padding:"10px 14px"}}>
        <div style={{fontSize:10,color:"#6B7280",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>อัตราภาษีขั้นบันได (เงินได้สุทธิ)</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {[
            {range:"0–150K",rate:"ยกเว้น",active:taxable>0,color:"#10B981"},
            {range:"150–300K",rate:"5%",active:taxable>150000,color:"#3B82F6"},
            {range:"300–500K",rate:"10%",active:taxable>300000,color:"#60A5FA"},
            {range:"500–750K",rate:"15%",active:taxable>500000,color:"#F59E0B"},
            {range:"750K–1M",rate:"20%",active:taxable>750000,color:"#F97316"},
            {range:"1–2M",rate:"25%",active:taxable>1000000,color:"#EF4444"},
            {range:"2–5M",rate:"30%",active:taxable>2000000,color:"#DC2626"},
            {range:">5M",rate:"35%",active:taxable>5000000,color:"#991B1B"},
          ].map(({range,rate,active,color})=>(
            <div key={range} style={{
              borderRadius:8,padding:"4px 8px",fontSize:10,fontWeight:600,
              background:active?color+"20":"#EEEFF0",
              color:active?color:"#C1C8D0",
              border:`1px solid ${active?color+"40":"transparent"}`,
              display:"flex",flexDirection:"column",alignItems:"center",gap:1
            }}>
              <span style={{fontWeight:700,fontSize:11}}>{rate}</span>
              <span style={{fontWeight:400,fontSize:9,opacity:.8}}>{range}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:8,fontSize:11,color:"#9CA3AF"}}>
          * คำนวณจากรายรับรวมต่อปี ยังไม่รวมค่าลดหย่อน · อัตราภาษีที่แท้จริง {effectiveRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

function RetAssetTable({D,set,ytr}) {
  const [open,setOpen]=useState(false);
  const [q,setQ]=useState("");
  const filtered=RET_PRESETS.filter(p=>p.includes(q));
  const upd=(i,k,v)=>{const a=[...D.retAssets];a[i]={...a[i],[k]:v};set(p=>({...p,retAssets:a}));};
  const del=(i)=>{const a=[...D.retAssets];a.splice(i,1);set(p=>({...p,retAssets:a}));};
  const add=(lbl)=>set(p=>({...p,retAssets:[...p.retAssets,{lbl,cv:0,rr:0}]}));
  const total=D.retAssets.reduce((s,a)=>{const pv=a.cv||0,r=(a.rr||0)/100;return s+pv*Math.pow(1+r,ytr);},0);
  return <div>
    {D.retAssets.length===0
      ? <div style={{fontSize:13,color:"#8A9A8A",textAlign:"center",padding:"1rem 0"}}>ยังไม่มีรายการ — กด + เพิ่มสินทรัพย์</div>
      : <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8}}>
          <thead><tr>{["รายการ","มูลค่าปัจจุบัน","ผลตอบแทน %","มูลค่า ณ เกษียณ",""].map((h,i)=><th key={i} style={{fontSize:10,color:"#8A9A8A",fontWeight:600,padding:"4px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.08)",textAlign:"left",textTransform:"uppercase",letterSpacing:".04em"}}>{h}</th>)}</tr></thead>
          <tbody>
            {D.retAssets.map((a,i)=>{const fv=(a.cv||0)*Math.pow(1+(a.rr||0)/100,ytr);return <tr key={i}>
              <td style={{padding:"4px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",fontSize:12,color:"#4A4A4A",whiteSpace:"nowrap",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis"}}>{a.lbl}</td>
              <td style={{padding:"4px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}><Input value={a.cv} onChange={v=>upd(i,"cv",v)} suffix="฿"/></td>
              <td style={{padding:"4px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",width:90}}><Input value={a.rr} onChange={v=>upd(i,"rr",v)} suffix="%"/></td>
              <td style={{padding:"4px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",fontSize:12,fontWeight:600,color:"#1A1A1A",whiteSpace:"nowrap"}}>{fmt(fv)} ฿</td>
              <td style={{padding:"4px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}><DelBtn onClick={()=>del(i)}/></td>
            </tr>;})}
            <tr><td colSpan={3} style={{padding:"5px 6px",fontWeight:700,color:"#1A1A1A",background:"#F0EDE6",fontSize:12}}>รวม FV</td><td colSpan={2} style={{padding:"5px 6px",fontWeight:700,color:"#1A1A1A",background:"#F0EDE6",fontSize:12}}>{fmt(total)} ฿</td></tr>
          </tbody>
        </table>}
    <div style={{position:"relative",display:"inline-block"}}>
      <button onClick={()=>{setOpen(v=>!v);setQ("");}} style={{fontSize:13,color:"#3B82F6",background:"#EFF6FF",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600,padding:"6px 12px",borderRadius:8,display:"flex",alignItems:"center",gap:4}}>+ เพิ่มสินทรัพย์ ▾</button>
      {open&&<div style={{position:"absolute",left:0,top:"100%",zIndex:99,background:"white",border:"0.5px solid rgba(0,0,0,0.12)",borderRadius:10,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",width:240,padding:8,marginTop:4}}>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหาหรือพิมพ์ชื่อ..." style={{width:"100%",border:"0.5px solid rgba(0,0,0,0.12)",borderRadius:7,padding:"5px 9px",fontSize:13,fontFamily:"inherit",marginBottom:5,outline:"none"}}/>
        <div style={{maxHeight:180,overflowY:"auto"}}>
          {filtered.map(p=><div key={p} onClick={()=>{add(p);setOpen(false);setQ("");}} style={{padding:"5px 9px",fontSize:13,cursor:"pointer",borderRadius:6,color:"#1A1A1A"}} onMouseEnter={e=>e.target.style.background="#F0EDE6"} onMouseLeave={e=>e.target.style.background="none"}>{p}</div>)}
          {q&&!RET_PRESETS.includes(q)&&<div onClick={()=>{add(q);setOpen(false);setQ("");}} style={{padding:"5px 9px",fontSize:13,cursor:"pointer",borderRadius:6,color:"#3B82F6",fontWeight:600}}>+ "{q}"</div>}
        </div>
      </div>}
    </div>
  </div>;
}
function DonutChart({income,expenses,savings}) {
  const net=Math.max(0,income-(expenses+savings));
  const total=income||1;
  const expP=expenses/total,savP=savings/total,remP=net/total;
  const R=46,cx=60,cy=60,circ=2*Math.PI*R;
  const d1=expP*circ,d2=savP*circ,d3=remP*circ;
  return <svg viewBox="0 0 120 120" width={110} height={110} style={{display:"block",margin:"0 auto"}}>
    <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.navyLight} strokeWidth={18}/>
    {income>0&&<>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#C04040" strokeWidth={18} strokeDasharray={`${d1} ${circ-d1}`} strokeDashoffset={0} transform={`rotate(-90 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.teal} strokeWidth={18} strokeDasharray={`${d2} ${circ-d2}`} strokeDashoffset={-d1} transform={`rotate(-90 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#7AAED8" strokeWidth={18} strokeDasharray={`${d3} ${circ-d3}`} strokeDashoffset={-(d1+d2)} transform={`rotate(-90 ${cx} ${cy})`}/>
    </>}
    <text x={cx} y={cy-5} textAnchor="middle" fontSize={9} fill={C.navy} fontFamily="Sarabun,sans-serif">เหลือ</text>
    <text x={cx} y={cy+10} textAnchor="middle" fontSize={12} fill={C.navy} fontFamily="Sarabun,sans-serif" fontWeight="700">{fmtM(net)}</text>
  </svg>;
}
function SummaryPyramid({liqOk,protOk,goalsOk}) {
  const fc=(cond,col)=>cond?col:NEUTRAL;
  return <svg viewBox="0 0 280 155" width="100%" style={{display:"block",margin:"0 auto .5rem"}}>
    <polygon points="140,12 180,68 100,68" fill={fc(liqOk&&protOk,C.coral)}/>
    <polygon points="100,72 125,72 119,100 88,100" fill={fc(goalsOk,C.olive)}/>
    <polygon points="128,72 152,72 152,100 122,100" fill={fc(goalsOk,C.olive)}/>
    <polygon points="155,72 180,72 192,100 156,100" fill={fc(goalsOk,C.olive)}/>
    <line x1="100" y1="72" x2="180" y2="72" stroke="white" strokeWidth=".5" opacity=".3"/>
    <line x1="126" y1="72" x2="121" y2="100" stroke="white" strokeWidth=".7" opacity=".4"/>
    <line x1="154" y1="72" x2="154" y2="100" stroke="white" strokeWidth=".7" opacity=".4"/>
    <polygon points="88,104 152,104 152,138 70,138" fill={fc(liqOk,C.baseDark)}/>
    <polygon points="156,104 192,104 212,138 156,138" fill={fc(protOk,C.baseDarker)}/>
    <line x1="88" y1="104" x2="192" y2="104" stroke="white" strokeWidth=".5" opacity=".25"/>
    <line x1="154" y1="104" x2="154" y2="138" stroke="white" strokeWidth=".7" opacity=".3"/>
    <text x="140" y="46" textAnchor="middle" fontFamily="Sarabun,sans-serif" fontSize="8.5" fontWeight="700" fill="white">Investment</text>
    {[["103","90","Short"],["138","90","Mid"],["174","90","Long"]].map(([x,y,t])=><text key={t} x={x} y={y} textAnchor="middle" fontFamily="Sarabun,sans-serif" fontSize="7" fill="white">{t}</text>)}
    <text x="115" y="118" textAnchor="middle" fontFamily="Sarabun,sans-serif" fontSize="7" fontWeight="700" fill="white">Basic Liquidity</text>
    <text x="183" y="118" textAnchor="middle" fontFamily="Sarabun,sans-serif" fontSize="7" fontWeight="700" fill="white">Risk Transfer</text>
  </svg>;
}
function TaxInput({label,value,onChange,max,note,icon}) {
  const upd=v=>onChange(Math.min(max||Infinity,Math.max(0,v)));
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid #F0EDE8"}}>
      <div style={{width:28,height:28,background:"#F4F8FD",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{icon||"💰"}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,color:C.navy,fontWeight:500,lineHeight:1.3}}>{label}</div>
        {note&&<div style={{fontSize:10,color:C.text3,marginTop:1}}>{note}</div>}
      </div>
      <div style={{width:130,flexShrink:0}}>
        <Input value={value} onChange={upd} suffix="฿"/>
      </div>
      {max&&<div style={{fontSize:10,color:"#9CA3AF",width:90,textAlign:"right",flexShrink:0}}>สูงสุด {fmtM(max)}</div>}
    </div>
  );
}

function TaxSection({title,color,children}) {
  return (
    <div style={{background:"white",borderRadius:16,padding:".875rem 1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:".625rem",paddingBottom:".5rem",borderBottom:`2px solid ${color||C.navy}`}}>
        <div style={{width:4,height:16,borderRadius:2,background:color||C.navy,flexShrink:0}}/>
        <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{title}</div>
      </div>
      {children}
    </div>
  );
}

