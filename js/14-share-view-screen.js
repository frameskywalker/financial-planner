// ─── SHARE VIEW SCREEN (mobile read-only) ────────────────────────────────
function ShareViewScreen() {
  const [D,setD]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [cfOpen,setCfOpen]=useState(false);

  // ── Viewer identity (must match client_info.email) ──
  const [viewer,setViewer]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [loggingIn,setLoggingIn]=useState(false);
  const [denied,setDenied]=useState(false);

  // ── Listen for the viewer's Google login (re-uses the app's auth instance) ──
  useEffect(()=>{
    if(DEV_MODE){setViewer({email:"dev@local"});setAuthChecked(true);return;}
    const unsub=auth.onAuthStateChanged(u=>{setViewer(u);setAuthChecked(true);});
    return ()=>unsub();
  },[]);

  const loginAsClient=async()=>{
    setLoggingIn(true);
    try{await auth.signInWithPopup(googleProvider);}
    catch(e){setLoggingIn(false);}
  };

  // ── Fetch the client doc only once we know who the viewer is ──
  useEffect(()=>{
    if(!authChecked) return;
    if(!viewer){setLoading(false);return;} // waiting for sign-in
    if(!SHARE_UID||!SHARE_CID){setError("Link ไม่ถูกต้อง");setLoading(false);return;}
    setLoading(true);
    db.collection("advisors").doc(SHARE_UID).collection("clients").doc(SHARE_CID).get()
      .then(doc=>{
        if(!doc.exists){setError("ไม่พบข้อมูล หรือ Link หมดอายุ");setLoading(false);return;}
        const data={id:doc.id,...doc.data()};
        const clientEmail=(data.email||"").trim().toLowerCase();
        const viewerEmail=(viewer.email||"").trim().toLowerCase();
        if(!DEV_MODE && (!clientEmail||clientEmail!==viewerEmail)){
          setDenied(true);setLoading(false);return;
        }
        setD(data);setLoading(false);
      }).catch(()=>{setError("ไม่สามารถโหลดข้อมูลได้ — อีเมลของคุณอาจไม่ตรงกับที่ Advisor บันทึกไว้");setLoading(false);});
  },[authChecked,viewer]);

  // ── Gate 1: not signed in yet → ask viewer to sign in with their email ──
  if(authChecked && !viewer && !DEV_MODE) return <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F0EDE6",fontFamily:"'Kanit',sans-serif",padding:"2rem"}}>
    <div style={{background:"#FAF8F5",borderRadius:20,padding:"2.5rem 2rem",boxShadow:"0 8px 40px rgba(0,0,0,0.10)",width:"100%",maxWidth:380,textAlign:"center"}}>
      <div style={{width:52,height:52,background:"#0D2B4E",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem"}}>
        <div style={{width:28,height:28,background:"#B87A14",borderRadius:7}}/>
      </div>
      <div style={{fontSize:18,fontWeight:700,color:"#0D2B4E",marginBottom:6}}>แผนการเงินของคุณ</div>
      <div style={{fontSize:13,color:"#6A85A8",marginBottom:"1.5rem",lineHeight:1.6}}>กรุณาเข้าสู่ระบบด้วย Gmail ที่ตรงกับอีเมลที่ Advisor บันทึกไว้ให้คุณ เพื่อดูแผนการเงิน</div>
      <button onClick={loginAsClient} disabled={loggingIn} style={{width:"100%",padding:"13px",borderRadius:12,border:"1px solid rgba(13,43,78,0.16)",background:"white",fontFamily:"'Kanit',sans-serif",fontSize:15,fontWeight:500,color:"#0D2B4E",cursor:loggingIn?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",opacity:loggingIn?0.7:1}}>
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.5-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.1 33.6C29.3 34.8 26.8 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.6 5.1C9.8 39.6 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.3 5.2c3.7-3.4 6-8.4 6-14.5 0-1.3-.1-2.7-.4-4z"/></svg>
        {loggingIn?"กำลังเข้าสู่ระบบ...":"เข้าสู่ระบบด้วย Google"}
      </button>
    </div>
  </div>;

  // ── Gate 2: signed in, but email doesn't match the client's saved email ──
  if(denied) return <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F0EDE6",fontFamily:"'Kanit',sans-serif",flexDirection:"column",gap:8,padding:"2rem"}}>
    <div style={{fontSize:32}}>🔒</div>
    <div style={{fontSize:16,fontWeight:600,color:"#111827",textAlign:"center"}}>อีเมลของคุณไม่ตรงกับลูกค้าในแผนนี้</div>
    <div style={{fontSize:13,color:"#9CA3AF",textAlign:"center"}}>เข้าสู่ระบบด้วย {viewer?.email} — กรุณาใช้อีเมลที่ Advisor บันทึกไว้ให้คุณ</div>
    <button onClick={()=>auth.signOut()} style={{fontSize:13,color:"#3B82F6",background:"none",border:"none",cursor:"pointer",fontFamily:"'Kanit',sans-serif",marginTop:8}}>ออกจากระบบ / เปลี่ยนบัญชี</button>
  </div>;

  if(loading) return <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F0EDE6",fontFamily:"'Kanit',sans-serif",flexDirection:"column",gap:12}}>
    <div style={{width:36,height:36,border:"3px solid #0D2B4E",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <div style={{fontSize:14,color:"#6B7280"}}>กำลังโหลดแผนการเงิน...</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;

  if(error) return <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F0EDE6",fontFamily:"'Kanit',sans-serif",flexDirection:"column",gap:8,padding:"2rem"}}>
    <div style={{fontSize:32}}>😕</div>
    <div style={{fontSize:16,fontWeight:600,color:"#111827"}}>{error}</div>
    <div style={{fontSize:13,color:"#9CA3AF",textAlign:"center"}}>กรุณาขอ Link ใหม่จาก Advisor ของคุณ</div>
  </div>;

  if(!D) return null;

  const mEq=r=>(r.freq==="yearly"?(r.amt||0)/12:(r.amt||0));
  const ti=(D.income||[]).reduce((s,r)=>s+mEq(r),0);
  const toFix=(D.fixed||[]).reduce((s,r)=>s+mEq(r),0);
  const toVar=(D.variable||[]).reduce((s,r)=>s+mEq(r),0);
  const to=toFix+toVar;
  const net=ti-(to+(D.savings||0));
  const annualIncome=ti*12;
  const {tax,topRate}=calcThaiTax(annualIncome);
  const taxPerMonth=tax/12;
  const topRatePct=Math.round(topRate*100);
  const bracketColor=topRate===0?"#10B981":topRate<=0.10?"#3B82F6":topRate<=0.20?"#F59E0B":topRate<=0.25?"#F97316":"#EF4444";
  const age=calcAge(D.dob);
  const retAge=D.retAge||60;
  const ytr=Math.max(0,(retAge-(age||0)));
  const needed=D.retNeeded||0;
  const prepFV=(D.retAssets||[]).reduce((s,a)=>{const pv=a.cv||0,r=(a.rr||0)/100;return s+pv*Math.pow(1+r,ytr);},0);
  const retGap=Math.max(0,needed-prepFV);
  const pctReady=needed>0?Math.min(100,Math.round(prepFV/needed*100)):0;
  const savedAt=D.updatedAt;
  const fmtDate=ts=>{if(!ts)return "";const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleDateString("th-TH",{day:"2-digit",month:"short",year:"2-digit"});};

  // insurance analysis
  const ins=D.insurance||{};
  const hasLife=ins.life>0;
  const hasHealth=ins.health;
  const hasCritical=ins.critical>0;
  const hasIncome=ins.incomeProtect>0;

  const SectionLabel=({n,label})=><div style={{fontSize:9,fontWeight:600,color:"#6B7280",letterSpacing:".07em",textTransform:"uppercase",fontFamily:"'Kanit',sans-serif",padding:"4px 2px 2px"}}>{n} · {label}</div>;
  const Badge=({label,color,bg})=><div style={{fontSize:10,background:bg,color:color,padding:"3px 8px",borderRadius:20,fontFamily:"'Kanit',sans-serif",whiteSpace:"nowrap"}}>{label}</div>;

  return <div style={{minHeight:"100dvh",background:"#F0EDE6",fontFamily:"'Kanit',sans-serif"}}>
    {/* Top bar */}
    <div style={{background:"#0D2B4E",padding:"10px 16px 14px"}}>
      <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:1}}>จัดทำโดย Advisor</div>
      <div style={{fontSize:17,fontWeight:600,color:"white"}}>แผนการเงิน</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.55)"}}>{D.name||"ลูกค้า"}{age?` · อายุ ${age} ปี`:""}</div>
    </div>

    <div style={{padding:"10px 12px 24px",display:"flex",flexDirection:"column",gap:8}}>

      {/* 1. Cash Flow */}
      <SectionLabel n="1" label="กระแสเงินสด"/>
      <div style={{background:"#1F2937",borderRadius:14,padding:"14px 14px 10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:2}}>รายรับ / เดือน</div>
            <div style={{fontSize:22,fontWeight:600,color:"white",lineHeight:1}}>{fmt(ti)} <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>฿</span></div>
          </div>
          <button onClick={()=>setCfOpen(v=>!v)} style={{fontSize:11,color:"#93C5FD",background:"none",border:"none",cursor:"pointer",fontFamily:"'Kanit',sans-serif",display:"flex",alignItems:"center",gap:3}}>
            {cfOpen?"ย่อ ▲":"ดูรายการ ▼"}
          </button>
        </div>
        <div style={{display:"flex",gap:0}}>
          {[["รายจ่าย",fmt(to),"#FCA5A5"],["ออม/ลงทุน",fmt(D.savings||0),"#86EFAC"],["คงเหลือ",(net>=0?"+":"")+fmt(net),net>=0?"white":"#FCA5A5"]].map(([l,v,c],i,a)=>(
            <div key={i} style={{flex:1,borderRight:i<a.length-1?"0.5px solid rgba(255,255,255,.07)":"none",paddingRight:i<a.length-1?10:0,paddingLeft:i>0?10:0}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>{l}</div>
              <div style={{fontSize:13,fontWeight:600,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        {cfOpen&&<div style={{marginTop:10,borderTop:"0.5px solid rgba(255,255,255,.07)",paddingTop:8}}>
          {(D.income||[]).length>0&&<>
            <div style={{fontSize:9,color:"rgba(255,255,255,.35)",marginBottom:4,letterSpacing:".05em"}}>รายรับ</div>
            {(D.income||[]).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:3}}><span>{r.lbl}</span><span>{fmt(mEq(r))} ฿</span></div>)}
          </>}
          {(D.fixed||[]).length>0&&<>
            <div style={{fontSize:9,color:"rgba(255,255,255,.35)",margin:"8px 0 4px",letterSpacing:".05em"}}>รายจ่ายประจำ</div>
            {(D.fixed||[]).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:3}}><span>{r.lbl}</span><span>{fmt(mEq(r))} ฿</span></div>)}
          </>}
          {(D.variable||[]).length>0&&<>
            <div style={{fontSize:9,color:"rgba(255,255,255,.35)",margin:"8px 0 4px",letterSpacing:".05em"}}>รายจ่ายผันแปร</div>
            {(D.variable||[]).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:3}}><span>{r.lbl}</span><span>{fmt(mEq(r))} ฿</span></div>)}
          </>}
        </div>}
      </div>

      {/* 2. Tax */}
      {ti>0&&<><SectionLabel n="2" label="ภาษีเงินได้"/>
      <div style={{background:"white",borderRadius:14,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>ภาษีที่ต้องจ่าย</div>
          <Badge label={topRatePct===0?"ไม่ถึงเกณฑ์":`เกณฑ์ ${topRatePct}%`} color={bracketColor} bg={bracketColor+"18"}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:"#F9FAFB",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:9,color:"#9CA3AF"}}>ต่อปี</div>
            <div style={{fontSize:16,fontWeight:600,color:"#111827"}}>{fmt(tax)} ฿</div>
          </div>
          <div style={{flex:1,background:"#FFF7ED",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:9,color:"#9CA3AF"}}>เฉลี่ย / เดือน</div>
            <div style={{fontSize:16,fontWeight:600,color:"#EA580C"}}>{fmt(taxPerMonth)} ฿</div>
          </div>
        </div>
        <div style={{marginTop:6,fontSize:10,color:"#9CA3AF"}}>* คำนวณจากรายรับรวมต่อปี ยังไม่รวมค่าลดหย่อน</div>
      </div></>}

      {/* 3. Insurance */}
      <SectionLabel n="3" label="ความคุ้มครอง"/>
      <div style={{background:"white",borderRadius:14,padding:"12px 14px"}}>
        {[
          {label:"ประกันชีวิต",sub:hasLife?`ทุนประกัน ${fmt(ins.life)} ฿`:"ยังไม่มี",has:hasLife,icon:"🛡"},
          {label:"ประกันสุขภาพ",sub:hasHealth?"มี OPD + IPD":"ยังไม่มี",has:hasHealth,icon:"❤️"},
          {label:"ประกันโรคร้ายแรง",sub:hasCritical?`${fmt(ins.critical)} ฿`:"แนะนำ 1,000,000 ฿",has:hasCritical,icon:"🏥"},
          {label:"ประกันรายได้",sub:hasIncome?"มีแล้ว":"แนะนำ 80% ของรายได้",has:hasIncome,icon:"💰"},
        ].map(({label,sub,has,icon},i,a)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:i<a.length-1?"0.5px solid #F3F4F6":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:8,background:has?"#F0FDF4":"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{icon}</div>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:"#111827"}}>{label}</div>
                <div style={{fontSize:10,color:has?"#9CA3AF":"#EF4444"}}>{sub}</div>
              </div>
            </div>
            <Badge label={has?"มีแล้ว":"ยังไม่มี"} color={has?"#166534":"#DC2626"} bg={has?"#DCFCE7":"#FEF2F2"}/>
          </div>
        ))}
      </div>

      {/* 4. Goals */}
      {((D.shortGoals||[]).length>0||(D.midGoals||[]).length>0)&&<>
        <SectionLabel n="4" label="เป้าหมายการเงิน"/>
        <div style={{background:"white",borderRadius:14,padding:"12px 14px"}}>
          {[...(D.shortGoals||[]),...(D.midGoals||[])].map((g,i,a)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:i<a.length-1?"0.5px solid #F3F4F6":"none"}}>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:"#111827"}}>{g.n||"เป้าหมาย"}</div>
                {g.y&&<div style={{fontSize:10,color:"#9CA3AF"}}>ภายในปี {g.y}</div>}
              </div>
              <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>{fmt(g.a||0)} ฿</div>
            </div>
          ))}
        </div>
      </>}

      {/* 5. Retirement */}
      <SectionLabel n="5" label="แผนเกษียณ"/>
      <div style={{background:"white",borderRadius:14,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,color:"#9CA3AF"}}>เกษียณเมื่ออายุ</div>
            <div style={{fontSize:20,fontWeight:600,color:"#111827"}}>{retAge} ปี</div>
            {age&&<div style={{fontSize:10,color:"#6B7280"}}>อีก {ytr} ปี</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:"#9CA3AF"}}>เตรียมไว้แล้ว</div>
            <div style={{fontSize:20,fontWeight:600,color:"#111827"}}>{fmtM(prepFV)} ฿</div>
            {needed>0&&<div style={{fontSize:10,color:"#6B7280"}}>เป้าหมาย {fmtM(needed)} ฿</div>}
          </div>
        </div>
        {needed>0&&<>
          <div style={{height:5,background:"#F3F4F6",borderRadius:4,overflow:"hidden",marginBottom:4}}>
            <div style={{height:"100%",width:pctReady+"%",background:"#3B82F6",borderRadius:4}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:9,color:"#9CA3AF"}}>{pctReady}% ของเป้าหมาย</div>
            {retGap>0&&<div style={{fontSize:9,color:"#EF4444"}}>ขาดอีก {fmtM(retGap)} ฿</div>}
          </div>
        </>}
      </div>

      {/* Footer */}
      <div style={{textAlign:"center",paddingTop:4}}>
        <div style={{fontSize:10,color:"#9CA3AF"}}>ข้อมูล ณ {fmtDate(savedAt)} · ดูได้อย่างเดียว</div>
      </div>

    </div>
  </div>;
}

