// ─── PAGE 4: PROTECTION ─────────────────────────────────────────────────
const LIFE_F=[{k:"sum",lbl:"ทุนประกัน / Sum insured",b:1000000},{k:"room",lbl:"ค่าห้อง / Room",b:5000},{k:"treat",lbl:"ค่ารักษา / Treatment",b:300000},{k:"critical",lbl:"โรคร้ายแรง / Critical illness",b:500000}];
const NL_F=[{k:"acc",lbl:"อุบัติเหตุ / Accident",b:200000},{k:"comp",lbl:"ค่าชดเชย / Compensation",b:1000}];
// Any policy can hold any feature, so the addable catalog is the combined list.
const ALL_F=[...LIFE_F,...NL_F];
const F_BY_K=Object.fromEntries(ALL_F.map(f=>[f.k,f]));
// Normalize a policy's feature map; legacy policies stored a flat `sum`, migrate it to feats.sum.
function polFeats(pol){if(pol&&pol.feats)return pol.feats;const f={};if(pol&&Number(pol.sum)>0)f.sum=Number(pol.sum);return f;}
// Effective coverage per feature key = manual base (lifeIns/nonLife) + sum of that feature across ALL policies.
function effCover(D){const polSum=k=>[...(D.lifePol||[]),...(D.nonlifePol||[])].reduce((s,pol)=>s+(Number(polFeats(pol)[k])||0),0);const out={};LIFE_F.forEach(f=>out[f.k]=(Number(D.lifeIns[f.k])||0)+polSum(f.k));NL_F.forEach(f=>out[f.k]=(Number(D.nonLife[f.k])||0)+polSum(f.k));return out;}
function Page4({D,set,step}) {
  const {suggCover,eduTotal,suggCoverTotal,annualIncome}=useCalcs(D);
  const updLi=(k,v)=>set(p=>({...p,lifeIns:{...p.lifeIns,[k]:v}}));
  const updNl=(k,v)=>set(p=>({...p,nonLife:{...p.nonLife,[k]:v}}));
  const arrKey=t=>t==="life"?"lifePol":"nonlifePol";
  const addPol=(t)=>set(p=>({...p,[arrKey(t)]:[...p[arrKey(t)],{ins:"",prem:0,feats:{}}]}));
  const delPol=(t,i)=>{const arr=[...D[arrKey(t)]];arr.splice(i,1);set(p=>({...p,[arrKey(t)]:arr}));};
  const updPol=(t,i,k,v)=>{const arr=[...D[arrKey(t)]];arr[i]={...arr[i],[k]:v};set(p=>({...p,[arrKey(t)]:arr}));};
  const updPolFeat=(t,i,k,v)=>{const arr=[...D[arrKey(t)]];arr[i]={...arr[i],feats:{...polFeats(arr[i]),[k]:v}};set(p=>({...p,[arrKey(t)]:arr}));};
  const addPolFeat=(t,i,k)=>{const arr=[...D[arrKey(t)]];arr[i]={...arr[i],feats:{...polFeats(arr[i]),[k]:0}};set(p=>({...p,[arrKey(t)]:arr}));};
  const delPolFeat=(t,i,k)=>{const arr=[...D[arrKey(t)]];const f={...polFeats(arr[i])};delete f[k];arr[i]={...arr[i],feats:f};set(p=>({...p,[arrKey(t)]:arr}));};
  // Roll up each feature key across BOTH policy arrays, then add the manual base for that key.
  const polSum=(k)=>[...D.lifePol,...D.nonlifePol].reduce((s,pol)=>s+(Number(polFeats(pol)[k])||0),0);
  const eff=(k)=>(Number((LIFE_F.some(f=>f.k===k)?D.lifeIns:D.nonLife)[k])||0)+polSum(k);
  const curCover=eff("sum");
  const coverGap=Math.max(0,suggCoverTotal-curCover);
  const fillSuggested=()=>updLi("sum",Math.max(0,Math.round(suggCoverTotal-polSum("sum"))));
  const allF=[...LIFE_F,...NL_F].map(f=>({lbl:f.lbl.split(" / ")[0],v:eff(f.k),b:f.b}));
  const tot=allF.filter(f=>f.v>0).length;
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
            <div style={{display:"flex",alignItems:"baseline",gap:8}}>
              <span onClick={fillSuggested} title="คลิกเพื่อใช้เป็นทุนประกัน" style={{fontSize:24,fontWeight:700,cursor:"pointer",borderBottom:"1px dashed rgba(255,255,255,.4)"}}>{fmtM(suggCoverTotal)}</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>฿</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,.45)",marginLeft:2}}>👆 คลิกเพื่อใช้ค่านี้</span>
            </div>
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
              {polSum(f.k)>0&&<div style={{fontSize:9.5,color:C.text3,textAlign:"right",marginTop:3}}>+ กรมธรรม์ {fmtM(polSum(f.k))} = รวม {fmtM(eff(f.k))} ฿</div>}
            </div>)}
          </div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>ประกันภัยทั่วไป</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem .875rem"}}>
            {NL_F.map(f=><div key={f.k}>
              <label style={{...s.label,margin:"0 0 4px",display:"block",minHeight:34,lineHeight:1.25}}>{f.lbl}</label>
              <Input value={D.nonLife[f.k]||0} onChange={v=>updNl(f.k,v)} suffix="฿" style={{textAlign:"right"}}/>
              {polSum(f.k)>0&&<div style={{fontSize:9.5,color:C.text3,textAlign:"right",marginTop:3}}>+ กรมธรรม์ {fmtM(polSum(f.k))} = รวม {fmtM(eff(f.k))} ฿</div>}
            </div>)}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
          {[["life","กรมธรรม์ประกันชีวิต"],["nl","กรมธรรม์ประกันภัย"]].map(([t,title])=>{
            const arr=D[t==="life"?"lifePol":"nonlifePol"];
            return <div key={t} style={{background:"white",borderRadius:16,padding:"1.125rem 1.25rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={s.cardTitle}><span style={s.ctAcc}/>{title}</div>
              {arr.length===0&&<div style={{fontSize:12,color:C.text3,textAlign:"center",padding:".5rem"}}>ยังไม่มีกรมธรรม์</div>}
              {arr.map((pol,i)=>{
                const feats=polFeats(pol);
                const avail=ALL_F.filter(f=>!(f.k in feats));
                return <div key={i} style={{border:`1px solid ${C.border}`,borderRadius:12,padding:".75rem .875rem",marginBottom:".625rem",background:"#FBFCFD"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 120px 30px",gap:8,alignItems:"center"}}>
                    <input value={pol.ins||""} placeholder="บริษัท / ชื่อกรมธรรม์" onChange={e=>updPol(t,i,"ins",e.target.value)} style={{...s.input,fontSize:13}}/>
                    <Input value={pol.prem||0} onChange={v=>updPol(t,i,"prem",v)} placeholder="เบี้ย/ปี" suffix="฿" style={{fontSize:13}}/>
                    <DelBtn onClick={()=>delPol(t,i)}/>
                  </div>
                  {Object.keys(feats).map(k=><div key={k} style={{display:"grid",gridTemplateColumns:"1fr 140px 30px",gap:8,alignItems:"center",marginTop:6}}>
                    <span style={{fontSize:12,color:C.text2}}>{(F_BY_K[k]?F_BY_K[k].lbl:k).split(" / ")[0]}</span>
                    <Input value={feats[k]||0} onChange={v=>updPolFeat(t,i,k,v)} suffix="฿" style={{textAlign:"right",fontSize:13}}/>
                    <DelBtn onClick={()=>delPolFeat(t,i,k)}/>
                  </div>)}
                  {avail.length>0&&<select value="" onChange={e=>{if(e.target.value)addPolFeat(t,i,e.target.value);}} style={{...s.input,fontSize:12,marginTop:8,cursor:"pointer",color:"#3B82F6",fontWeight:600}}>
                    <option value="">+ เพิ่มความคุ้มครอง</option>
                    {avail.map(f=><option key={f.k} value={f.k} style={{color:"#1A1A1A",fontWeight:400}}>{f.lbl.split(" / ")[0]}</option>)}
                  </select>}
                </div>;
              })}
              <AddBtn onClick={()=>addPol(t)}>+ เพิ่มกรมธรรม์</AddBtn>
            </div>;
          })}
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

