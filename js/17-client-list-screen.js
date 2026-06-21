// ─── CLIENT LIST SCREEN ───────────────────────────────────────────────────
function ClientListScreen({user,onOpen,onNew,onLogout}) {
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [delConfirm,setDelConfirm]=useState(null);

  useEffect(()=>{
    const unsub=db.collection("advisors").doc(user.uid).collection("clients")
      .orderBy("updatedAt","desc")
      .onSnapshot(snap=>{
        setClients(snap.docs.map(d=>({id:d.id,...d.data()})));
        setLoading(false);
      },()=>setLoading(false));
    return ()=>unsub();
  },[user.uid]);

  const deleteClient=async(id)=>{
    await db.collection("advisors").doc(user.uid).collection("clients").doc(id).delete();
    setDelConfirm(null);
  };

  const filtered=clients.filter(c=>(c.name||"").toLowerCase().includes(search.toLowerCase())||(c.phone||"").includes(search));

  const calcAgeStr=dob=>{const a=calcAge(dob);return a?`${a} ปี`:"-";};
  const fmtDate=ts=>{if(!ts)return "-";const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleDateString("th-TH",{day:"2-digit",month:"short",year:"2-digit"});};

  return (
    <div style={{height:"100dvh",minHeight:"-webkit-fill-available",background:"#EDE8E0",display:"flex",flexDirection:"column",fontFamily:"'Kanit',sans-serif",overflow:"hidden"}}>
      {/* Topbar */}
      <div style={{height:54,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.25rem",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:26,height:26,background:C.gold,borderRadius:6,flexShrink:0}}/>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"white",lineHeight:1.1}}>Financial Planning</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>Advisor Dashboard</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={user.photoURL||""} alt="" style={{width:30,height:30,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)"}} onError={e=>e.target.style.display="none"}/>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,fontWeight:600,color:"white",lineHeight:1.1}}>{user.displayName||"Advisor"}</div>
            <button onClick={onLogout} style={{fontSize:10,color:"rgba(255,255,255,.45)",background:"none",border:"none",cursor:"pointer",fontFamily:"'Kanit',sans-serif",padding:0}}>ออกจากระบบ</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"1.25rem"}}>
        {/* Header row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",flexWrap:"wrap",gap:".75rem"}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:C.navy}}>รายชื่อลูกค้า</div>
            <div style={{fontSize:12,color:C.text3}}>{clients.length} คน</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 ค้นหาชื่อ / เบอร์โทร"
              style={{fontFamily:"'Kanit',sans-serif",fontSize:13,padding:"8px 12px",borderRadius:10,border:`1px solid ${C.border2}`,background:"white",outline:"none",width:200}}/>
            <button onClick={onNew} style={{padding:"9px 18px",borderRadius:10,background:C.navy,color:"white",border:"none",fontFamily:"'Kanit',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16,lineHeight:1}}>＋</span> ลูกค้าใหม่
            </button>
          </div>
        </div>

        {/* Cards */}
        {loading&&<div style={{textAlign:"center",padding:"3rem",color:C.text3,fontSize:14}}>กำลังโหลด...</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"3rem"}}>
          <div style={{fontSize:40,marginBottom:"1rem"}}>👤</div>
          <div style={{fontSize:15,fontWeight:600,color:C.navy,marginBottom:4}}>{clients.length===0?"ยังไม่มีลูกค้า":"ไม่พบลูกค้า"}</div>
          <div style={{fontSize:13,color:C.text3,marginBottom:"1.25rem"}}>{clients.length===0?"กดปุ่ม 'ลูกค้าใหม่' เพื่อเริ่มต้น":"ลองค้นหาด้วยคำอื่น"}</div>
          {clients.length===0&&<button onClick={onNew} style={{padding:"10px 24px",borderRadius:10,background:C.navy,color:"white",border:"none",fontFamily:"'Kanit',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}}>＋ เพิ่มลูกค้าคนแรก</button>}
        </div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem"}}>
          {filtered.map(c=>{
            const age=calcAgeStr(c.dob);
            const income=c.totIn?`${fmt(c.totIn)} ฿/เดือน`:"";
            const goal=c.retAssets?.length>0?"มีแผนเกษียณ":"";
            return (
              <div key={c.id} style={{background:"#FAF8F5",borderRadius:14,border:`0.5px solid rgba(0,0,0,0.08)`,padding:"1rem 1.125rem",cursor:"pointer",transition:"box-shadow .15s",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}
                onClick={()=>onOpen(c)} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.10)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)"}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:".625rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:C.navyLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                      {(c.name||"?")[0]}
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:C.navy,lineHeight:1.1}}>{c.name||"ไม่มีชื่อ"}</div>
                      <div style={{fontSize:11,color:C.text3,marginTop:1}}>{c.occ||""}</div>
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setDelConfirm(c.id);}} style={{width:26,height:26,borderRadius:6,background:"rgba(163,48,48,0.08)",border:"none",cursor:"pointer",fontSize:12,color:C.red,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px",marginBottom:".625rem"}}>
                  {[["📅","วันเกิด",c.dob?new Date(c.dob).toLocaleDateString("th-TH",{day:"2-digit",month:"short",year:"2-digit"}):"-"],
                    ["🎂","อายุ",age],
                    ["📞","เบอร์โทร",c.phone||"-"],
                    ["💰","รายได้/เดือน",income||"-"]].map(([ico,lbl,val],i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:11}}>{ico}</span>
                      <div>
                        <div style={{fontSize:9,color:C.text3,lineHeight:1}}>{lbl}</div>
                        <div style={{fontSize:12,fontWeight:500,color:C.text,lineHeight:1.3}}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {(c.retGap>0||goal)&&<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {c.retGap>0&&<span style={{fontSize:10,background:C.goldLight,color:C.amber,borderRadius:20,padding:"2px 8px",fontWeight:500}}>Gap เกษียณ {fmtM(c.retGap)} ฿</span>}
                  {goal&&<span style={{fontSize:10,background:C.tealLight,color:C.teal,borderRadius:20,padding:"2px 8px",fontWeight:500}}>{goal}</span>}
                </div>}
                <div style={{marginTop:".5rem",paddingTop:".5rem",borderTop:`0.5px solid ${C.border}`,fontSize:10,color:C.text3,display:"flex",justifyContent:"space-between"}}>
                  <span>แก้ไขล่าสุด {fmtDate(c.updatedAt)}</span>
                  <span style={{color:C.navy,fontWeight:600}}>เปิด →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete confirm modal */}
      {delConfirm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setDelConfirm(null)}>
        <div style={{background:"white",borderRadius:16,padding:"1.5rem",width:300,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:32,marginBottom:".75rem"}}>🗑</div>
          <div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:4}}>ลบข้อมูลลูกค้า?</div>
          <div style={{fontSize:12,color:C.text3,marginBottom:"1.25rem"}}>การกระทำนี้ไม่สามารถย้อนกลับได้</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setDelConfirm(null)} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${C.border2}`,background:"white",fontFamily:"'Kanit',sans-serif",fontSize:13,cursor:"pointer"}}>ยกเลิก</button>
            <button onClick={()=>deleteClient(delConfirm)} style={{flex:1,padding:"9px",borderRadius:10,border:"none",background:C.red,color:"white",fontFamily:"'Kanit',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>ลบ</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

