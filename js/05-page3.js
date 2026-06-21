// ─── PAGE 3: LIQUIDITY ──────────────────────────────────────────────────
function Page3({D,set,step}) {
  const {cfExpense}=useCalcs(D);
  const liqGoal=D.expense*D.mult, liqGap=Math.max(0,liqGoal-D.saved), liqPct=liqGoal>0?Math.min(100,Math.round(D.saved/liqGoal*100)):0;
  const inSync=cfExpense>0&&Number(D.expense)===cfExpense;
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>สำรองสภาพคล่อง <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Liquidity</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>💡 แนะนำ 6 เท่าขึ้นไป</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:".875rem",alignItems:"start"}}>
      <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={s.cardTitle}><span style={s.ctAcc}/>ตั้งค่าเป้าหมาย</div>
        <div style={{marginBottom:".875rem"}}>
          <label style={s.label}>รายจ่ายจำเป็นต่อเดือน</label>
          <Input value={D.expense} onChange={v=>set(p=>({...p,expense:v}))} suffix="฿"/>
          {cfExpense>0&&(inSync
            ? <div style={{...s.hint,color:"#0E6E55",display:"flex",alignItems:"center",gap:4,marginTop:5}}>✓ ซิงค์กับกระแสเงินสดแล้ว ({fmt(cfExpense)} ฿/เดือน)</div>
            : <button onClick={()=>set(p=>({...p,expense:cfExpense}))} style={{marginTop:6,fontSize:11,fontFamily:"'Kanit',sans-serif",fontWeight:500,color:"#3B82F6",background:"#EBF2FB",border:"0.5px solid rgba(59,130,246,.35)",borderRadius:8,padding:"5px 10px",cursor:"pointer"}}>↻ ใช้รายจ่ายจากกระแสเงินสด ({fmt(cfExpense)} ฿)</button>)}
          <div style={s.hint}>เฉพาะรายจ่ายที่จำเป็น ไม่รวมท่องเที่ยว ช้อปปิ้ง</div>
        </div>
        <div style={{marginBottom:".875rem"}}>
          <label style={s.label}>เป้าหมายจำนวนเท่า</label>
          <div style={{display:"flex",gap:8}}>
            <MultBtn active={D.mult===3} onClick={()=>set(p=>({...p,mult:3}))} num="3x" sub="ขั้นต่ำ"/>
            <MultBtn active={D.mult===6} onClick={()=>set(p=>({...p,mult:6}))} num="6x" sub="แนะนำ"/>
            <MultBtn active={D.mult===12} onClick={()=>set(p=>({...p,mult:12}))} num="12x" sub="ปลอดภัย"/>
          </div>
        </div>
        <div>
          <label style={s.label}>เตรียมไว้แล้ว</label>
          <Input value={D.saved} onChange={v=>set(p=>({...p,saved:v}))} suffix="฿"/>
          <div style={s.hint}>เงินฝากออมทรัพย์ + กองทุนรวมตลาดเงิน + เงินสด</div>
        </div>
      </div>
      <div style={{background:"#1F2937",borderRadius:16,padding:"1rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
        <div style={s.spEye}>📊 สรุปอัตโนมัติ</div>
        <SpBlock label="เป้าหมายรวม" sub={`${D.mult}x × ${fmt(D.expense)} / เดือน`}>
          {fmt(liqGoal)} <span style={{fontSize:12,color:"rgba(255,255,255,.45)"}}>฿</span>
        </SpBlock>
        <SpDiv/>
        <div style={{marginBottom:".625rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:5}}>
            <span>ความคืบหน้า</span><span>{liqPct}%</span>
          </div>
          <ProgBar pct={liqPct}/>
        </div>
        <SpDiv/>
        <SpBlock label="ขาดอีก">
          <span style={{color:liqGap>0?"#F09090":"#5EC9A5"}}>{fmt(liqGap)}</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,.45)",marginLeft:4}}>฿</span>
        </SpBlock>
        {liqGap>0&&<div style={{background:"rgba(255,255,255,.06)",borderRadius:7,padding:"7px 9px",fontSize:11,color:"rgba(255,255,255,.4)",marginTop:8,lineHeight:1.4}}>⚠ ควรเพิ่มเงินออมให้ครบเป้าหมาย</div>}
      </div>
    </div>
  </div>;
}
function Panel3() { return null; }

