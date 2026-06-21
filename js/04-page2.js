// ─── PAGE 2: CLIENT INFO ─────────────────────────────────────────────────
function Page2({D,set,step}) {
  const isM=D.status==="married";
  const ca=calcAge(D.dob), sa=calcAge(D.spDob);
  const upd=(k,v)=>set(p=>({...p,[k]:v}));
  const updChild=(i,k,v)=>{const c=[...D.children];c[i]={...c[i],[k]:v};set(p=>({...p,children:c}));};
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>ข้อมูลลูกค้า <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Client Info</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>💡 ข้อมูลนี้จะถูกใช้ตลอดแผน</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:".875rem",alignItems:"start"}}>
      <div style={{display:"flex",flexDirection:"column",gap:".875rem"}}>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>ข้อมูลส่วนตัวลูกค้า</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".625rem",marginBottom:".625rem"}}>
            <div><label style={s.label}>ชื่อ-นามสกุล</label><Input type="text" value={D.name} onChange={v=>upd("name",v)} placeholder="ชื่อ-นามสกุล"/></div>
            <DatePicker label="วันเกิด" value={D.dob} onChange={v=>upd("dob",v)}/>
            <div><label style={s.label}>อาชีพ</label><Input type="text" value={D.occ} onChange={v=>upd("occ",v)} placeholder="เช่น วิศวกร แพทย์"/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".625rem"}}>
            <div><label style={s.label}>เบอร์โทร</label><Input type="text" value={D.phone} onChange={v=>upd("phone",v)} placeholder="08X-XXX-XXXX"/></div>
            <div><label style={s.label}>อีเมล</label><Input type="text" value={D.email} onChange={v=>upd("email",v)} placeholder="email@example.com"/></div>
            <div><label style={s.label}>สถานภาพ</label><div style={{display:"flex",gap:5}}><ToggleBtn active={!isM} onClick={()=>upd("status","single")}>โสด</ToggleBtn><ToggleBtn active={isM} onClick={()=>upd("status","married")}>สมรส</ToggleBtn></div></div>
          </div>
        </div>
        {isM&&<div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>ข้อมูลคู่สมรส</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".625rem"}}>
            <div><label style={s.label}>ชื่อคู่สมรส</label><Input type="text" value={D.spName} onChange={v=>upd("spName",v)} placeholder="ชื่อ-นามสกุล"/></div>
            <DatePicker label="วันเกิดคู่สมรส" value={D.spDob} onChange={v=>upd("spDob",v)}/>
            <div><label style={s.label}>อาชีพ</label><Input type="text" value={D.spOcc} onChange={v=>upd("spOcc",v)} placeholder="อาชีพ"/></div>
          </div>
        </div>}
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>ข้อมูลบุตร <span style={{fontSize:10,color:C.text3,fontWeight:400,marginLeft:4}}>(สูงสุด 3 คน)</span></div>
          {D.children.length===0&&<div style={{fontSize:12,color:C.text3,textAlign:"center",padding:".375rem"}}>ยังไม่มีบุตร</div>}
          {D.children.map((c,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:".5rem",alignItems:"flex-end",marginBottom:".5rem"}}>
            <div><label style={s.label}>ชื่อบุตรคนที่ {i+1}</label><Input type="text" value={c.n} onChange={v=>updChild(i,"n",v)} placeholder="ชื่อ"/></div>
            <div><label style={s.label}>อายุ (ปี)</label><Input value={c.a} onChange={v=>updChild(i,"a",v)}/></div>
            <DelBtn onClick={()=>{const ch=[...D.children];ch.splice(i,1);set(p=>({...p,children:ch}));}}/>
          </div>)}
          {D.children.length<3&&<AddBtn onClick={()=>set(p=>({...p,children:[...p.children,{n:"",a:0}]}))}>+ เพิ่มบุตร</AddBtn>}
        </div>
        <div style={{background:"white",borderRadius:16,padding:"1rem 1.125rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={s.cardTitle}><span style={s.ctAcc}/>ข้อมูลที่ปรึกษา · Advisor Info</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:".625rem"}}>
            <div><label style={s.label}>ชื่อที่ปรึกษา</label><Input type="text" value={D.advisorName} onChange={v=>upd("advisorName",v)} placeholder="ชื่อ-นามสกุล"/></div>
            <div><label style={s.label}>เบอร์โทร</label><Input type="text" value={D.advisorPhone} onChange={v=>upd("advisorPhone",v)} placeholder="08X-XXX-XXXX"/></div>
            <div><label style={s.label}>อีเมล</label><Input type="text" value={D.advisorEmail} onChange={v=>upd("advisorEmail",v)} placeholder="advisor@email.com"/></div>
          </div>
        </div>
      </div>
      <div style={{background:"#1F2937",borderRadius:16,padding:"1rem 1.125rem",color:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.10)"}}>
        <div style={s.spEye}>📋 ยืนยันข้อมูล</div>
        <SpBlock label="ชื่อ"><span style={{fontSize:13,fontWeight:600}}>{D.name||"—"}</span></SpBlock>
        <SpBlock label="อายุ"><span style={{fontSize:13,fontWeight:600}}>{ca!==null?ca+" ปี":"—"}</span></SpBlock>
        <SpBlock label="สถานภาพ"><span style={{fontSize:13,fontWeight:600}}>{isM?"สมรส":"โสด"}</span></SpBlock>
        {isM&&D.spName&&<SpBlock label="คู่สมรส"><span style={{fontSize:13,fontWeight:600}}>{D.spName}{sa!==null?" ("+sa+" ปี)":""}</span></SpBlock>}
        <SpDiv/>
        <SpBlock label="จำนวนบุตร">{D.children.length}<span style={{fontSize:11,color:"rgba(255,255,255,.45)",marginLeft:3}}>คน</span></SpBlock>
        {D.children.length>0&&<div style={{marginTop:6}}>{D.children.map((c,i)=><div key={i} style={{fontSize:11,color:"rgba(255,255,255,.4)",padding:"2px 0"}}>{c.n||"—"}{c.a?" · "+c.a+" ปี":""}</div>)}</div>}
      </div>
    </div>
  </div>;
}
function Panel2() { return null; }

