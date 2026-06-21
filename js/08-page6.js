// ─── PAGE 6: CASH FLOW — Banking Dashboard Theme ────────────────────────
function Page6({D,set,step}) {
  const upd=(k,i,f,v)=>{const a=[...D[k]];a[i]={...a[i],[f]:v};set(p=>({...p,[k]:a}));};
  const add=(k,lbl)=>set(p=>({...p,[k]:[...p[k],{lbl,amt:0,freq:"monthly"}]}));
  const del=(k,i)=>{const a=[...D[k]];a.splice(i,1);set(p=>({...p,[k]:a}));};
  const mEq=r=>(r.freq==="yearly"?(r.amt||0)/12:(r.amt||0));
  const ti=D.income.reduce((s,r)=>s+mEq(r),0);
  const toFix=D.fixed.reduce((s,r)=>s+mEq(r),0);
  const toVar=D.variable.reduce((s,r)=>s+mEq(r),0);
  const to=toFix+toVar;
  const net=ti-(to+(D.savings||0));
  const sr=ti>0?Math.round((D.savings||0)/ti*100):0;

  // Wrap everything in a light-gray banking bg
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>

    {/* ── Header row ── */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>กระแสเงินสด <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Cash Flow</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#10B981"}}/>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>ควรออมอย่างน้อย 20%</span>
      </div>
    </div>

    {/* ── KPI 3-box summary ── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".75rem"}}>
      {[
        {label:"รายรับ/เดือน",sub:"Total Income",val:fmtM(ti),icon:"📈",dark:false},
        {label:"รายจ่าย/เดือน",sub:"Total Expenses",val:fmtM(to),icon:"📉",dark:false},
        {label:"เงินคงเหลือ",sub:net>=0?"กระแสเงินสดเป็นบวก ✓":"กระแสเงินสดติดลบ ⚠",val:(net>=0?"+":"")+fmtM(net),icon:"💰",dark:true,neg:net<0},
      ].map(({label,sub,val,icon,dark,neg},i)=>(
        <div key={i} style={{background:dark?(neg?"#FEF2F2":"#1F2937"):"white",borderRadius:16,padding:"1rem 1.25rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,color:dark?(neg?"#EF4444":"rgba(255,255,255,.55)"):"#6B7280",fontWeight:500}}>{label}</span>
            <span style={{fontSize:18}}>{icon}</span>
          </div>
          <div style={{fontSize:28,fontWeight:700,color:dark?(neg?"#EF4444":"white"):"#111827",lineHeight:1,marginBottom:3}}>{val} <span style={{fontSize:14,fontWeight:400,color:dark?(neg?"#FCA5A5":"rgba(255,255,255,.4)"):"#9CA3AF"}}>฿</span></div>
          <div style={{fontSize:11,color:dark?(neg?"#FCA5A5":"rgba(255,255,255,.35)"):"#9CA3AF"}}>{sub}</div>
        </div>
      ))}
    </div>

    {/* ── Main 2-col: LEFT=รายรับ, RIGHT=รายจ่าย ── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".875rem",alignItems:"start"}}>

      {/* LEFT — Income */}
      <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>

        {/* Income card */}
        <div style={{background:"white",borderRadius:16,overflow:"visible",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid #F3F4F6",borderRadius:"16px 16px 0 0",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:32,height:32,borderRadius:10,background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>📈</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>รายรับ</div>
                <div style={{fontSize:11,color:"#9CA3AF"}}>Income · {fmt(ti)} ฿/เดือน</div>
              </div>
            </div>
            <CFAddBtn category="income" onAdd={lbl=>add("income",lbl)}/>
          </div>
          <div style={{borderRadius:"0 0 16px 16px",overflow:"hidden"}}>
            {D.income.length===0
              ?<div style={{padding:"16px",fontSize:13,color:"#9CA3AF",textAlign:"center"}}>ยังไม่มีรายรับ — กด + เพิ่ม</div>
              :D.income.map((r,i)=><TxRow key={i} icon={cfIcon(r.lbl)} label={r.lbl} amount={r.amt} freq={r.freq} isIncome={true}
                  onChangeLabel={v=>upd("income",i,"lbl",v)} onChangeAmt={v=>upd("income",i,"amt",v)} onChangeFreq={v=>upd("income",i,"freq",v)} onDel={()=>del("income",i)}/>)}
          </div>
        </div>

      </div>

      {/* RIGHT — Expenses */}
      <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>

        {/* Expenses card */}
        <div style={{background:"white",borderRadius:16,overflow:"visible",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",padding:"14px 16px",borderBottom:"1px solid #F3F4F6",borderRadius:"16px 16px 0 0",overflow:"hidden",gap:9}}>
            <div style={{width:32,height:32,borderRadius:10,background:"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>📉</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>รายจ่าย</div>
              <div style={{fontSize:11,color:"#9CA3AF"}}>Expenses · {fmt(to)} ฿/เดือน</div>
            </div>
          </div>
          <div style={{borderRadius:"0 0 16px 16px",overflow:"hidden"}}>
            {/* Fixed sub-section */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px",background:"#FAFAFA",borderBottom:"1px solid #F3F4F6"}}>
              <span style={{fontSize:11,fontWeight:600,color:"#6B7280",letterSpacing:".06em",textTransform:"uppercase"}}>Fixed · ประจำ</span>
              <div style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}>
                <span style={{fontSize:11,color:"#9CA3AF"}}>{fmt(toFix)} ฿</span>
                <CFAddBtn category="fixed" onAdd={lbl=>add("fixed",lbl)} btnStyle={{fontSize:11,padding:"4px 10px"}}/>
              </div>
            </div>
            {D.fixed.length===0
              ?<div style={{padding:"10px 16px",fontSize:12,color:"#9CA3AF"}}>ยังไม่มีรายการประจำ</div>
              :D.fixed.map((r,i)=><TxRow key={i} icon={cfIcon(r.lbl)} label={r.lbl} amount={r.amt} freq={r.freq} isIncome={false}
                  onChangeLabel={v=>upd("fixed",i,"lbl",v)} onChangeAmt={v=>upd("fixed",i,"amt",v)} onChangeFreq={v=>upd("fixed",i,"freq",v)} onDel={()=>del("fixed",i)}/>)}
            {/* Variable sub-section */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px",background:"#FAFAFA",borderTop:"1px solid #F3F4F6",borderBottom:"1px solid #F3F4F6"}}>
              <span style={{fontSize:11,fontWeight:600,color:"#6B7280",letterSpacing:".06em",textTransform:"uppercase"}}>Variable · ผันแปร</span>
              <div style={{display:"flex",alignItems:"center",gap:8,position:"relative"}}>
                <span style={{fontSize:11,color:"#9CA3AF"}}>{fmt(toVar)} ฿</span>
                <CFAddBtn category="variable" onAdd={lbl=>add("variable",lbl)} btnStyle={{fontSize:11,padding:"4px 10px"}}/>
              </div>
            </div>
            {D.variable.length===0
              ?<div style={{padding:"10px 16px",fontSize:12,color:"#9CA3AF"}}>ยังไม่มีรายการผันแปร</div>
              :D.variable.map((r,i)=><TxRow key={i} icon={cfIcon(r.lbl)} label={r.lbl} amount={r.amt} freq={r.freq} isIncome={false}
                  onChangeLabel={v=>upd("variable",i,"lbl",v)} onChangeAmt={v=>upd("variable",i,"amt",v)} onChangeFreq={v=>upd("variable",i,"freq",v)} onDel={()=>del("variable",i)}/>)}
          </div>
        </div>

      </div>
    </div>

    {/* ── Savings row — full width ── */}
    <div style={{background:"#1F2937",borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
      <div style={{width:38,height:38,borderRadius:12,background:"rgba(147,197,253,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏦</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:"white"}}>ออม + ลงทุนต่อเดือน</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:1}}>PVD · RMF · LTF · ประกันสะสม ฯลฯ</div>
      </div>
      <div style={{width:160}}>
        <Input value={D.savings} onChange={v=>set(p=>({...p,savings:v}))} suffix="฿" style={{background:"rgba(255,255,255,.1)",color:"white",borderRadius:10,textAlign:"right"}}/>
      </div>
    </div>

    {/* ── Tax card — full width ── */}
    <TaxCard annualIncome={ti*12}/>
  </div>;
}

function Panel6() { return null; }

