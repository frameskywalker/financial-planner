// ─── PAGE 7: RETIREMENT ─────────────────────────────────────────────────
const RET_PRESETS=["PVD (กองทุนสำรองเลี้ยงชีพ)","RMF","LTF","SSF","กบข.","สหกรณ์","หุ้น/กองทุนรวม","บ้าน/อสังหาริมทรัพย์","เงินฝากประจำ","ประกันชีวิตบำนาญ","เงินบำเหน็จ/บำนาญ","ธุรกิจส่วนตัว","ทองคำ","อื่นๆ"];
function Page7({D,set,step}) {
  const {ca,ytr,yir,fm,needed,prepFV,retGap,mSave,m4,m8,rb}=useCalcs(D);
  const ra=D.retAge||60,le=D.lifeExp||85;
  const range=70,pC=Math.max(0,Math.min(100,(ca-20)/range*100));
  const pR=Math.max(0,Math.min(100,(ra-20)/range*100));
  const pE=Math.max(0,Math.min(100,(le-20)/range*100));
  const updAsset=(i,k,v)=>{const a=[...D.retAssets];a[i]={...a[i],[k]:v};set(p=>({...p,retAssets:a}));};
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>วางแผนเกษียณ <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Retirement</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>💡 เริ่มเร็ว ดอกเบี้ยทบต้นทำงานแทน</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:".875rem",alignItems:"start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:".875rem"}}>
        <div style={{background:"white",borderRadius:16,padding:".875rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#6B7280",letterSpacing:".07em",textTransform:"uppercase",marginBottom:".5rem"}}>เส้นชีวิต</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#8A9A8A",marginBottom:3}}>{[20,30,40,50,60,70,80,90].map(a=><span key={a}>{a}</span>)}</div>
          <div style={{position:"relative",height:18,display:"flex",alignItems:"center",marginBottom:5}}>
            <div style={{position:"absolute",left:0,right:0,height:3,background:"rgba(0,0,0,0.1)",borderRadius:2}}/>
            <div style={{position:"absolute",left:0,width:pC+"%",height:3,background:C.teal,borderRadius:2,transition:"all .4s"}}/>
            <div style={{position:"absolute",left:pC+"%",width:(pR-pC)+"%",height:3,background:C.gold2,borderRadius:2,transition:"all .4s"}}/>
            {[[pC,C.teal],[pR,C.gold2],[pE,"#9BA8B8"]].map(([pct,col],i)=><div key={i} style={{position:"absolute",left:pct+"%",width:10,height:10,borderRadius:"50%",top:"50%",transform:"translate(-50%,-50%)",background:col,border:"2px solid white"}}/>)}
          </div>
          <div style={{display:"flex",gap:".75rem",flexWrap:"wrap"}}>
            {[[C.teal,"ปัจจุบัน "+ca+" ปี"],[C.gold2,"เกษียณ "+ra+" ปี"],["#9BA8B8","อายุขัย "+le+" ปี"]].map(([col,lbl],i)=>
              <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#8A9A8A"}}>
                <div style={{width:8,height:3,background:col,borderRadius:2}}/>{lbl}
              </div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".375rem",marginTop:".5rem"}}>
            {[["เก็บอีก "+ytr+" ปี","ถึงวันเกษียณ"],["ช่วงเกษียณ "+yir+" ปี","ระยะเวลาใช้เงิน"],["รวม "+(le-ca)+" ปี","อายุรวม"]].map(([v,l],i)=>
              <div key={i} style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:"#1A1A1A"}}>{v}</div><div style={{fontSize:9,color:"#8A9A8A"}}>{l}</div></div>)}
          </div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>สมมติฐาน</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".625rem",marginBottom:".625rem"}}>
            <div><label style={s.label}>อายุปัจจุบัน</label><div style={{padding:"8px 11px",background:"#F0EDE6",borderRadius:8,fontSize:14,fontWeight:600,color:"#1A1A1A"}}>{ca} ปี</div></div>
            <div><label style={s.label}>เกษียณเมื่ออายุ (ปี)</label><Input value={D.retAge} onChange={v=>set(p=>({...p,retAge:v}))}/></div>
            <div><label style={s.label}>อายุขัยที่คาด (ปี)</label><Input value={D.lifeExp} onChange={v=>set(p=>({...p,lifeExp:v}))}/></div>
          </div>
          <div style={{marginBottom:".625rem"}}><label style={s.label}>รายจ่าย/เดือน หลังเกษียณ (เงินวันนี้)</label><Input value={D.monthlyNeed} onChange={v=>set(p=>({...p,monthlyNeed:v}))} suffix="฿"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".625rem"}}>
            <div><label style={s.label}>เงินเฟ้อ (%/ปี)</label><Input value={D.infl} onChange={v=>set(p=>({...p,infl:v}))}/></div>
            <div><label style={s.label}>ผลตอบแทนก่อนเกษียณ</label><Input value={D.retBefore} onChange={v=>set(p=>({...p,retBefore:v}))} suffix="%"/></div>
            <div><label style={s.label}>ผลตอบแทนหลังเกษียณ</label><Input value={D.retAfter} onChange={v=>set(p=>({...p,retAfter:v}))} suffix="%"/></div>
          </div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>เตรียมไว้แล้ว</div>
          <RetAssetTable D={D} set={set} ytr={ytr}/>
        </div>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>แผนออมเพื่อปิด Gap</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".5rem"}}>
            {[[4,m4,false],[D.retBefore||6,mSave,true],[8,m8,false]].map(([rate,amt,feat],i)=>
              <div key={i} style={{background:feat?"#1F2937":"#F3F4F6",border:`0.5px solid ${feat?"#1F2937":"rgba(0,0,0,0.08)"}`,borderRadius:10,padding:".625rem",textAlign:"center"}}>
                <div style={{fontSize:10,color:feat?"rgba(255,255,255,.5)":"#8A9A8A",marginBottom:3,fontWeight:500}}>ผลตอบแทน {rate}%/ปี</div>
                <div style={{fontSize:16,fontWeight:700,color:feat?"white":"#1A1A1A"}}>{fmt(amt)}</div>
                <div style={{fontSize:10,color:feat?"rgba(255,255,255,.45)":"#8A9A8A"}}>฿ / เดือน</div>
              </div>)}
          </div>
        </div>
      </div>
      <div style={{background:"#1F2937",borderRadius:16,padding:"1rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
        <div style={s.spEye}>🏖 คำนวณอัตโนมัติ</div>
        <SpBlock label="รายจ่าย/เดือน ณ วันเกษียณ" sub={"หลังเงินเฟ้อ "+ytr+" ปี"}>{fmt(fm)} <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>฿</span></SpBlock>
        <SpDiv/>
        <SpBlock label="กองทุนที่ต้องเตรียม" sub={"สำหรับ "+yir+" ปีหลังเกษียณ"}>{fmtM(needed)} <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>฿</span></SpBlock>
        <SpDiv/>
        <SpBlock label="เตรียมไว้แล้ว (FV)">{fmtM(prepFV)} <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>฿</span></SpBlock>
        <SpDiv/>
        <SpBlock label="ขาดอีก" sub={"ออมเดือนละ "+fmt(mSave)+" ฿ ที่ "+(D.retBefore||6)+"%"}>
          <span style={{color:retGap>0?"#F09090":"#5EC9A5"}}>{fmtM(retGap)}</span> <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>฿</span>
        </SpBlock>
      </div>
    </div>
  </div>;
}
function Panel7() { return null; }

