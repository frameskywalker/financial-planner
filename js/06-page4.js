// ─── PAGE 4: PROTECTION ─────────────────────────────────────────────────
const LIFE_F=[{k:"sum",lbl:"ทุนประกัน / Sum insured",b:1000000},{k:"room",lbl:"ค่าห้อง / Room",b:5000},{k:"treat",lbl:"ค่ารักษา / Treatment",b:300000},{k:"critical",lbl:"โรคร้ายแรง / Critical illness",b:500000}];
const NL_F=[{k:"acc",lbl:"อุบัติเหตุ / Accident",b:200000},{k:"comp",lbl:"ค่าชดเชย / Compensation",b:1000}];
function Page4({D,set,step}) {
  const {suggCover,eduTotal,suggCoverTotal,annualIncome}=useCalcs(D);
  const curCover=Number(D.lifeIns.sum)||0;
  const coverGap=Math.max(0,suggCoverTotal-curCover);
  const updLi=(k,v)=>set(p=>({...p,lifeIns:{...p.lifeIns,[k]:v}}));
  const updNl=(k,v)=>set(p=>({...p,nonLife:{...p.nonLife,[k]:v}}));
  const addPol=(t)=>set(p=>({...p,[t==="life"?"lifePol":"nonlifePol"]:[...p[t==="life"?"lifePol":"nonlifePol"],{ins:"",prem:0,sum:0}]}));
  const delPol=(t,i)=>{const arr=[...D[t==="life"?"lifePol":"nonlifePol"]];arr.splice(i,1);set(p=>({...p,[t==="life"?"lifePol":"nonlifePol"]:arr}));};
  const updPol=(t,i,k,v)=>{const arr=[...D[t==="life"?"lifePol":"nonlifePol"]];arr[i]={...arr[i],[k]:v};set(p=>({...p,[t==="life"?"lifePol":"nonlifePol"]:arr}));};
  const tot=Object.values(D.lifeIns).filter(v=>v>0).length+Object.values(D.nonLife).filter(v=>v>0).length;
  const allF=[...LIFE_F.map(f=>({lbl:f.lbl.split(" / ")[0],v:D.lifeIns[f.k]||0,b:f.b})),...NL_F.map(f=>({lbl:f.lbl.split(" / ")[0],v:D.nonLife[f.k]||0,b:f.b}))];
  const covScore=Math.round(allF.reduce((s,f)=>s+Math.min(100,(f.v||0)/f.b*100),0)/allF.length);
  const covCol=covScore>=80?"#5EC9A5":covScore>=40?"#F0C070":"#F09090";
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>การคุ้มครอง <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Protection</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>💡 ทุนประกันควร 10× รายได้ต่อปี</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:".875rem",alignItems:"start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:".875rem"}}>
        <div style={{background:"linear-gradient(135deg,#0D2B4E,#1E5499)",borderRadius:16,padding:".875rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",color:"rgba(255,255,255,.55)",marginBottom:6}}>💡 ทุนประกันชีวิตที่แนะนำ</div>
          {(annualIncome>0||eduTotal>0)?<>
            <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontSize:24,fontWeight:700}}>{fmtM(suggCoverTotal)}</span><span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>฿</span></div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:4,lineHeight:1.6}}>= ทดแทนรายได้ 10× ({fmtM(suggCover)} ฿){eduTotal>0?` + ทุนการศึกษาบุตร (${fmtM(eduTotal)} ฿)`:""}</div>
            <div style={{fontSize:11,marginTop:7,fontWeight:500,color:curCover>=suggCoverTotal?"#5EC9A5":"#F0C070"}}>{curCover>=suggCoverTotal?"✓ ทุนประกันปัจจุบันเพียงพอ":`ทุนปัจจุบัน ${fmtM(curCover)} ฿ · ควรเพิ่มอีก ${fmtM(coverGap)} ฿`}</div>
          </>:<div style={{fontSize:11,color:"rgba(255,255,255,.5)",lineHeight:1.6}}>กรอกรายได้ (กระแสเงินสด) และทุนการศึกษาบุตร เพื่อคำนวณทุนประกันที่แนะนำ</div>}
        </div>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>ประกันชีวิตและสุขภาพ</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem .875rem"}}>
            {LIFE_F.map(f=><div key={f.k}>
              <label style={{...s.label,margin:"0 0 4px",display:"block",minHeight:34,lineHeight:1.25}}>{f.lbl}</label>
              <Input value={D.lifeIns[f.k]||0} onChange={v=>updLi(f.k,v)} suffix="฿" style={{textAlign:"right"}}/>
            </div>)}
          </div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>ประกันภัยทั่วไป</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem .875rem"}}>
            {NL_F.map(f=><div key={f.k}>
              <label style={{...s.label,margin:"0 0 4px",display:"block",minHeight:34,lineHeight:1.25}}>{f.lbl}</label>
              <Input value={D.nonLife[f.k]||0} onChange={v=>updNl(f.k,v)} suffix="฿" style={{textAlign:"right"}}/>
            </div>)}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".625rem"}}>
          {[["life","กรมธรรม์ประกันชีวิต"],["nl","กรมธรรม์ประกันภัย"]].map(([t,title])=>
            <div key={t} style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={s.cardTitle}><span style={s.ctAcc}/>{title}</div>
              {D[t==="life"?"lifePol":"nonlifePol"].length===0&&<div style={{fontSize:11,color:C.text3,textAlign:"center",padding:".375rem"}}>ยังไม่มีกรมธรรม์</div>}
              {D[t==="life"?"lifePol":"nonlifePol"].map((pol,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 70px 70px 22px",gap:4,alignItems:"center",paddingBottom:4,borderBottom:`0.5px solid ${C.border}`,marginBottom:4}}>
                <input value={pol.ins||""} placeholder="บริษัท" onChange={e=>updPol(t,i,"ins",e.target.value)} style={{...s.input,fontSize:11,padding:"3px 6px"}}/>
                <input value={pol.prem||""} placeholder="เบี้ย" type="number" onChange={e=>updPol(t,i,"prem",e.target.value)} style={{...s.input,fontSize:11,padding:"3px 6px"}}/>
                <input value={pol.sum||""} placeholder="ทุน" type="number" onChange={e=>updPol(t,i,"sum",e.target.value)} style={{...s.input,fontSize:11,padding:"3px 6px"}}/>
                <DelBtn onClick={()=>delPol(t,i)}/>
              </div>)}
              <AddBtn onClick={()=>addPol(t)}>+ เพิ่มกรมธรรม์</AddBtn>
            </div>)}
        </div>
      </div>
      <div style={{background:"#1F2937",borderRadius:16,padding:"1rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
        <div style={s.spEye}>🛡 สรุปความคุ้มครอง</div>
        <SpBlock label="รายการที่มีความคุ้มครอง">{tot}<span style={{fontSize:11,color:"rgba(255,255,255,.45)",marginLeft:3}}>/ 6</span></SpBlock>
        <SpDiv/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
          <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>คะแนนความคุ้มครองโดยรวม</span>
          <span style={{fontSize:20,fontWeight:700,color:covCol}}>{covScore}%</span>
        </div>
        <ProgBar pct={covScore} color={covCol}/>
        <div style={{background:"rgba(255,255,255,.06)",borderRadius:7,padding:"8px 10px",fontSize:11,color:"rgba(255,255,255,.45)",marginTop:10,lineHeight:1.5}}>
          {covScore>=80?"✓ ความคุ้มครองอยู่ในระดับดี":covScore>=40?"ความคุ้มครองพอใช้ ควรเพิ่มในบางรายการ":"ความคุ้มครองยังต่ำ แนะนำเพิ่มทุนประกัน"}
        </div>
      </div>
    </div>
  </div>;
}
function Panel4() { return null; }

