// ─── PAGE 8: EDUCATION ──────────────────────────────────────────────────
const EDU_LEVELS=[{lbl:"อนุบาล",y:3,sa:0},{lbl:"ประถมศึกษา",y:6,sa:3},{lbl:"มัธยมศึกษา",y:6,sa:9},{lbl:"ปริญญาตรี",y:4,sa:15},{lbl:"ปริญญาโท",y:2,sa:19},{lbl:"ปริญญาเอก",y:3,sa:21}];
function Page8({D,set,onJump,step}) {
  const hasChildren=D.children.length>0;
  if(!hasChildren) return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>ทุนการศึกษาบุตร <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Education</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>💡 ค่าเรียนเพิ่ม ~6%/ปี เริ่มเร็วยิ่งดี</span>
      </div>
    </div>
    <div style={{background:"white",borderRadius:16,padding:"2.5rem 1.5rem",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:36,marginBottom:".75rem"}}>👶</div>
      <div style={{fontSize:16,fontWeight:600,color:"#1A1A1A",marginBottom:6}}>ยังไม่มีข้อมูลบุตร</div>
      <div style={{fontSize:13,color:"#8A9A8A",marginBottom:"1.25rem",lineHeight:1.6}}>กรุณาเพิ่มข้อมูลบุตรในหน้า "ข้อมูลลูกค้า" ก่อน<br/>จากนั้นกลับมาที่หน้านี้เพื่อวางแผนทุนการศึกษา</div>
      <button onClick={()=>onJump&&onJump(1)} style={{padding:"9px 20px",borderRadius:10,fontSize:14,fontFamily:"'Kanit',sans-serif",fontWeight:600,cursor:"pointer",border:"none",background:"#1F2937",color:"white"}}>← ไปหน้าข้อมูลลูกค้า</button>
    </div>
  </div>;
  const children=D.children;
  const ti=Math.min(D.eduTab||0,children.length-1);
  const ch=children[ti],ca=parseInt(ch.a)||0;
  while(D.eduData.length<children.length) D.eduData.push(EDU_LEVELS.map(()=>({cost:0})));
  const ed=D.eduData[ti]||EDU_LEVELS.map(()=>({cost:0}));
  let tot=0; EDU_LEVELS.forEach((l,li)=>{const y=Math.max(0,l.sa-ca),cost=ed[li]?.cost||0;tot+=cost*l.y*Math.pow(1.06,y);});
  const updEdu=(li,v)=>{const nd=[...D.eduData];while(nd.length<=ti)nd.push(EDU_LEVELS.map(()=>({cost:0})));const row=[...nd[ti]];row[li]={...row[li],cost:v};nd[ti]=row;set(p=>({...p,eduData:nd}));};
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>ทุนการศึกษาบุตร <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Education</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>💡 ค่าเรียนเพิ่ม ~6%/ปี เริ่มเร็วยิ่งดี</span>
      </div>
    </div>
    {children.length>1&&<div style={{display:"flex",borderBottom:"0.5px solid rgba(0,0,0,0.08)",marginBottom:".25rem"}}>
      {children.map((ch2,i)=><TabBtn key={i} active={i===ti} onClick={()=>set(p=>({...p,eduTab:i}))}>{ch2.n||"บุตรคนที่ "+(i+1)} ({ch2.a||"?"} ปี)</TabBtn>)}
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:".875rem",alignItems:"start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:".875rem"}}>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>แผนค่าเล่าเรียน — {ch.n||"บุตร"} (อายุ {ch.a||"?"} ปี)</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["ระดับ","ระยะเวลา","เวลาเก็บ (ปี)","ค่าใช้จ่าย/ปี (฿)","รวมในอนาคต (฿)"].map(h=><th key={h} style={{fontSize:10,color:"#8A9A8A",fontWeight:600,padding:"4px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.08)",textAlign:"left",textTransform:"uppercase",letterSpacing:".05em"}}>{h}</th>)}</tr></thead>
            <tbody>
              {EDU_LEVELS.map((l,li)=>{const y=Math.max(0,l.sa-ca),cost=ed[li]?.cost||0,fv=cost*l.y*Math.pow(1.06,y);return(<tr key={li}>
                <td style={{padding:"5px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",fontSize:12,fontWeight:600,color:"#1A1A1A"}}>{l.lbl}</td>
                <td style={{padding:"5px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",fontSize:12,color:"#4A4A4A"}}>{l.y} ปี</td>
                <td style={{padding:"5px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",fontSize:12,color:"#4A4A4A"}}>{y} ปี</td>
                <td style={{padding:"5px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}><Input value={cost} onChange={v=>updEdu(li,v)} suffix="฿"/></td>
                <td style={{padding:"5px 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",fontSize:12,fontWeight:600,color:"#1A1A1A"}}>{fmt(fv)}</td>
              </tr>);})}
              <tr><td colSpan={4} style={{padding:"6px 6px",fontWeight:700,color:"#1A1A1A",background:"#F3F4F6",fontSize:13}}>รวมค่าเล่าเรียนทั้งหมด</td><td style={{padding:"6px 6px",fontWeight:700,color:"#1A1A1A",background:"#F3F4F6",fontSize:13}}>{fmt(tot)}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".625rem"}}>
          <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={s.cardTitle}><span style={s.ctAcc}/>สิ่งที่เตรียมไว้แล้ว</div>
            <textarea placeholder={"เช่น เงินฝากออมทรัพย์ 50,000 ฿\nกองทุน SSF 20,000 ฿"} value={D.eduPrepared||""} onChange={e=>set(p=>({...p,eduPrepared:e.target.value}))} style={{width:"100%",minHeight:90,resize:"vertical",border:"0.5px solid rgba(0,0,0,0.12)",borderRadius:8,padding:"8px 11px",fontSize:13,fontFamily:"'Kanit',sans-serif",color:"#1A1A1A",background:"#F3F4F6",outline:"none"}}/>
          </div>
          <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={s.cardTitle}><span style={s.ctAcc}/>แผนทุนการศึกษา</div>
            <div style={{fontSize:12,color:"#6A7A6A",marginBottom:".5rem",lineHeight:1.6}}>สำหรับผู้ปกครอง ควรมีทุนประกันที่ครอบคลุมทุนการศึกษาที่ขาดไป เท่ากับ</div>
            <div style={{fontSize:22,fontWeight:700,color:"#1A1A1A",marginBottom:".5rem"}}>{fmt(tot)} ฿</div>
            <div style={{fontSize:12,color:"#6A7A6A",lineHeight:1.6}}>สำหรับบุตร ควรเน้นเงินออมที่มีความแน่นอน มีผลตอบแทนสูงกว่าอัตราดอกเบี้ยเงินฝาก และออมเป็นประจำ</div>
          </div>
        </div>
      </div>
      <div style={{background:"#1F2937",borderRadius:16,padding:"1rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
        <div style={s.spEye}>🎓 ทุนการศึกษา</div>
        <SpBlock label="ค่าเล่าเรียนรวม">{fmtM(tot)} <span style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>฿</span></SpBlock>
        <SpDiv/>
        <SpBlock label="อัตราเงินเฟ้อการศึกษา">6<span style={{fontSize:11,color:"rgba(255,255,255,.45)",marginLeft:3}}>%/ปี</span></SpBlock>
        <SpDiv/>
        <div style={{background:"rgba(255,255,255,.06)",borderRadius:8,padding:"8px 10px",fontSize:11,color:"rgba(255,255,255,.4)",lineHeight:1.6}}>เงินออมและประกันชีวิตผู้ปกครองเป็นเครื่องมือหลักในการสะสมทุนการศึกษา</div>
      </div>
    </div>
  </div>;
}
function Panel8() { return null; }

