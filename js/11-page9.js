function Page9({D,set,onJump,step}) {
  const {totIn,totOut,net,savRate,liqGoal,liqGap,liqPct,protTot,retGap,prepFV,needed,mSave,eduTotal,suggCoverTotal}=useCalcs(D);
  const protPct=Math.round(protTot/6*100);
  const retPct=needed>0?Math.min(100,Math.round(prepFV/needed*100)):0;
  const liqOk=liqPct>=80,protOk=protPct>=60,goalsOk=D.shortGoals.length>0||D.midGoals.length>0,cfOk=net>=0,retOk=retGap<100000;
  const score=[liqOk,protOk,goalsOk,cfOk,retOk].filter(Boolean).length;
  const nextSteps=[];
  if(!liqOk)nextSteps.push({t:"เพิ่มเงินสำรองสภาพคล่องให้ครบ "+D.mult+"x",s:"ขาดอีก "+fmtM(liqGap)+" ฿"});
  if(!protOk)nextSteps.push({t:"เพิ่มความคุ้มครองประกันชีวิตและสุขภาพ",s:suggCoverTotal>0?("ทุนประกันที่แนะนำ "+fmtM(suggCoverTotal)+" ฿"):"ทุนประกันควรอยู่ที่ 10× รายได้ต่อปี"});
  if(retGap>0)nextSteps.push({t:"เริ่มออมเพื่อเกษียณ "+fmt(mSave)+" ฿/เดือน",s:"ขาดอีก "+fmtM(retGap)+" ฿"});
  if(D.children.length>0&&eduTotal>0)nextSteps.push({t:"เตรียมทุนการศึกษาบุตร",s:"ค่าเล่าเรียนรวม "+fmtM(eduTotal)+" ฿"});
  if(!goalsOk)nextSteps.push({t:"ตั้งเป้าหมายทางการเงินให้ชัดเจน",s:"เพิ่มเป้าหมายระยะสั้น-กลาง"});
  const gapItems=[
    {n:"สำรองสภาพคล่อง",ok:liqOk,warn:false,detail:`${fmt(D.saved)} / ${fmt(liqGoal)} ฿`,pct:liqPct},
    {n:"การคุ้มครอง",ok:protOk,warn:!protOk&&protTot>0,detail:`${protTot} / 6 รายการ`,pct:protPct},
    {n:"กองทุนเกษียณ",ok:retOk,warn:!retOk&&prepFV>0,detail:`${fmt(prepFV)} / ${fmtM(needed)} ฿`,pct:retPct},
  ];
  const healthItems=[{lbl:"สภาพคล่อง",ok:liqOk,warn:false},{lbl:"การคุ้มครอง",ok:protOk,warn:!protOk&&protTot>0},{lbl:"เป้าหมาย",ok:goalsOk,warn:false},{lbl:"กระแสเงินสด",ok:cfOk,warn:false},{lbl:"เกษียณ",ok:retOk,warn:!retOk&&prepFV>0}];
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>สรุปแผนการเงิน <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Summary</span></div>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:".875rem",alignItems:"start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:".875rem"}}>
        {/* KPI row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:".625rem"}}>
          {[{lbl:"รายรับ/เดือน",val:fmtM(totIn),col:C.teal},{lbl:"รายจ่าย/เดือน",val:fmtM(totOut),col:C.red},{lbl:"Savings rate",val:savRate+"%",col:C.navy3},{lbl:"เกษียณ Gap",val:fmtM(retGap),col:C.amber}].map(({lbl,val,col})=>
            <div key={lbl} style={{background:"white",borderRadius:16,padding:".625rem .875rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:10,color:C.text3,marginBottom:3,fontWeight:500}}>{lbl}</div>
              <div style={{fontSize:16,fontWeight:700,color:col}}>{val}</div>
            </div>)}
        </div>
        {/* Pyramid + Donut + Gap in one row */}
        <div style={{display:"grid",gridTemplateColumns:"1.05fr 1fr 1fr",gap:".625rem"}}>
          <div style={{background:"white",borderRadius:16,padding:".875rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:10,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:".5rem"}}>พีระมิดการเงิน</div>
            <SummaryPyramid liqOk={liqOk} protOk={protOk} goalsOk={goalsOk}/>
            <div style={{display:"flex",flexDirection:"column",gap:3,paddingTop:".5rem",borderTop:`0.5px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:C.text3}}>สำรอง {D.mult} เดือน</span><span style={{fontWeight:600,color:C.navy}}>{fmt(D.saved)}/{fmt(liqGoal)} ฿</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:C.text3}}>Net รายเดือน</span><span style={{fontWeight:600,color:net>=0?C.teal:C.red}}>{fmt(net)} ฿</span></div>
            </div>
          </div>
          <div style={{background:"white",borderRadius:16,padding:".875rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:10,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:".5rem"}}>กระแสเงินสด</div>
            <DonutChart income={totIn} expenses={totOut} savings={D.savings}/>
            <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:".5rem"}}>
              {[{col:"#C04040",lbl:"รายจ่าย",val:fmt(totOut)},{col:C.teal,lbl:"ออม/ลงทุน",val:fmt(D.savings)},{col:"#7AAED8",lbl:"เหลือ",val:fmt(Math.max(0,net))}].map(({col,lbl,val})=>
                <div key={lbl} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,color:C.text3}}><div style={{width:7,height:7,borderRadius:"50%",background:col}}/>{lbl}</div>
                  <span style={{fontWeight:600,color:C.navy,fontSize:11}}>{val} ฿</span>
                </div>)}
            </div>
          </div>
          <div style={{background:"white",borderRadius:16,padding:".875rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:10,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:".5rem"}}>ช่องว่างที่ต้องเติม</div>
            {gapItems.map(({n,ok,warn,detail,pct})=>{const col=ok?C.teal:warn?"#D4941A":C.red;const bgCol=ok?C.tealLight:warn?C.amberLight:C.redLight;const txtCol=ok?C.teal:warn?C.amber:C.red;return(
              <div key={n} style={{paddingBottom:5,borderBottom:`0.5px solid ${C.border}`,marginBottom:5}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}><span style={{fontSize:11,fontWeight:600,color:C.navy}}>{n}</span><span style={{fontSize:9,padding:"2px 6px",borderRadius:10,fontWeight:600,background:bgCol,color:txtCol}}>{ok?"✓":warn?"ควรเพิ่ม":"ขาดอีก"}</span></div>
                <div style={{fontSize:10,color:C.text3,marginBottom:3}}>{detail}</div>
                <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:col,borderRadius:2}}/></div>
              </div>);})}
          </div>
        </div>
        {nextSteps.length>0&&<div style={{background:"white",borderRadius:16,padding:".875rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:10,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:".625rem"}}>ขั้นตอนถัดไปที่แนะนำ</div>
          {nextSteps.slice(0,3).map(({t,s},i)=><div key={i} style={{display:"flex",gap:9,padding:"6px 0",borderBottom:`0.5px solid ${C.border}`,alignItems:"flex-start"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:"#DBEAFE",color:"#3B82F6",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
            <div><div style={{fontSize:12,color:C.navy,lineHeight:1.4,fontWeight:500}}>{t}</div><div style={{fontSize:10,color:C.text3,marginTop:1}}>{s}</div></div>
          </div>)}
        </div>}
        <div style={{background:"white",borderRadius:16,padding:".875rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:11,color:C.text3,marginBottom:6}}>กระโดดไปแก้ไข:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {["ข้อมูลลูกค้า","กระแสเงินสด","สำรองสภาพคล่อง","การคุ้มครอง","เป้าหมายการเงิน","แผนเกษียณ","ทุนการศึกษา"].map((n,i)=><button key={n} onClick={()=>onJump(i+1)} style={{fontSize:11,padding:"4px 11px",borderRadius:14,border:`0.5px solid ${C.border2}`,color:C.text2,background:"white",cursor:"pointer",fontFamily:"inherit"}}>{n}</button>)}
          </div>
        </div>
      </div>

      <div style={{background:"#1F2937",borderRadius:16,padding:"1rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
        <div style={s.spEye}>⭐ สุขภาพการเงิน</div>
        <div style={{fontSize:40,fontWeight:700,color:"white",lineHeight:1}}>{score}<span style={{fontSize:16,color:"rgba(255,255,255,.3)",fontWeight:400}}>/5</span></div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2,marginBottom:".625rem"}}>ด้านที่ครบถ้วน</div>
        <SpDiv/>
        {healthItems.map(({lbl,ok,warn})=>{
          const c=ok?"#5EC9A5":warn?"#F0C070":"#F09090";
          const bg=ok?"rgba(14,110,85,.25)":warn?"rgba(138,80,16,.25)":"rgba(163,48,48,.25)";
          return <div key={lbl} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"rgba(255,255,255,.5)",padding:"3px 0"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0}}/>
            <span style={{flex:1}}>{lbl}</span>
            <span style={{fontSize:9,padding:"2px 6px",borderRadius:10,fontWeight:600,background:bg,color:c}}>{ok?"✓":warn?"ควรเพิ่ม":"ขาด"}</span>
          </div>;
        })}
        <SpDiv/>
        <div style={{fontSize:10,color:"rgba(255,255,255,.3)",lineHeight:1.6}}>กด Export PDF ด้านล่างเพื่อส่งรายงานให้ลูกค้า</div>
      </div>
    </div>
  </div>;
}
function Panel9() { return null; }

