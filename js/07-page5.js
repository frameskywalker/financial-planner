// ─── PAGE 5: GOALS ──────────────────────────────────────────────────────
const SHORT_P=["รถ","บ้าน","แต่งงาน","ท่องเที่ยว","ของใช้","การศึกษา","อื่นๆ"];
const MID_P=["ออมเงิน","ธุรกิจ","บุตร","ขยายกิจการ","เกษียณก่อนกำหนด","อื่นๆ"];
function Page5({D,set,step}) {
  const updG=(type,i,k,v)=>{const arr=[...D[type==="short"?"shortGoals":"midGoals"]];arr[i]={...arr[i],[k]:v};set(p=>type==="short"?{...p,shortGoals:arr}:{...p,midGoals:arr});};
  const delG=(type,i)=>{const arr=[...D[type==="short"?"shortGoals":"midGoals"]];arr.splice(i,1);set(p=>type==="short"?{...p,shortGoals:arr}:{...p,midGoals:arr});};
  const addG=(type,name)=>set(p=>type==="short"?{...p,shortGoals:[...p.shortGoals,{n:name,a:0,y:""}]}:{...p,midGoals:[...p.midGoals,{n:name,a:0,y:""}]});
  const st=D.shortGoals.reduce((s,g)=>s+(g.a||0),0);
  const mt=D.midGoals.reduce((s,g)=>s+(g.a||0),0);
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>เป้าหมายการเงิน <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Goals</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>💡 เป้าหมายชัด สำเร็จสูงขึ้น 42%</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:".875rem",alignItems:"start"}}>
      <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 130px 90px 26px",gap:5,paddingBottom:6,borderBottom:"0.5px solid rgba(0,0,0,0.08)",marginBottom:".75rem"}}>
          {["เป้าหมาย","จำนวนเงิน (฿)","ภายในปี",""].map((h,i)=><span key={i} style={{fontSize:10,color:"#8A9A8A",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{h}</span>)}
        </div>
        <GoalRows goals={D.shortGoals} label="ระยะสั้น (1–3 ปี)" color="#2D7A5C" presets={SHORT_P}
          onAdd={n=>addG("short",n)} onDel={i=>delG("short",i)} onUpd={(i,k,v)=>updG("short",i,k,v)}/>
        <GoalRows goals={D.midGoals} label="ระยะกลาง (3–10 ปี)" color="#B87A14" presets={MID_P}
          onAdd={n=>addG("mid",n)} onDel={i=>delG("mid",i)} onUpd={(i,k,v)=>updG("mid",i,k,v)}/>
      </div>
      <div style={{background:"#1F2937",borderRadius:16,padding:"1rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
        <div style={s.spEye}>🎯 สรุปเป้าหมาย</div>
        <SpBlock label="ระยะสั้น" sub={fmtM(st)+" ฿"}>{D.shortGoals.length}<span style={{fontSize:11,color:"rgba(255,255,255,.45)",marginLeft:3}}>รายการ</span></SpBlock>
        <SpDiv/>
        <SpBlock label="ระยะกลาง" sub={fmtM(mt)+" ฿"}>{D.midGoals.length}<span style={{fontSize:11,color:"rgba(255,255,255,.45)",marginLeft:3}}>รายการ</span></SpBlock>
        <SpDiv/>
        <SpBlock label="รวมทั้งหมด">{fmtM(st+mt)}<span style={{fontSize:11,color:"rgba(255,255,255,.45)",marginLeft:3}}>฿</span></SpBlock>
      </div>
    </div>
  </div>;
}
function Panel5() { return null; }

