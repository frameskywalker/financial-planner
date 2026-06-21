// ─── MAIN APP ────────────────────────────────────────────────────────────
const PAGES = [
  {content:Page1,panel:Panel1},{content:Page2,panel:Panel2},
  {content:Page6,panel:Panel6},{content:Page3,panel:Panel3},
  {content:Page4,panel:Panel4},{content:Page5,panel:Panel5},
  {content:Page7,panel:Panel7},{content:Page8,panel:Panel8},
  {content:Page10,panel:Panel10},{content:Page9,panel:Panel9},
];

// Step icons for collapsed sidebar
function App() {
  // ── Auth & screen state ──
  const [authLoading,setAuthLoading]=useState(true);
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("auth"); // auth | clients | planner
  const [currentClient,setCurrentClient]=useState(null); // {id,...clientData}

  // ── Planner state ──
  const [cur,setCur]=useState(0);
  const [D,setD]=useState(initState);
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [sidebarExpanded,setSidebarExpanded]=useState(false);

  // ── Save state ──
  const [saving,setSaving]=useState(false);
  const [savedAt,setSavedAt]=useState(null);
  const [shareUrl,setShareUrl]=useState("");
  const [showShareToast,setShowShareToast]=useState(false);

  // ── Auth listener (with advisor whitelist check) ──
  const deniedRef=useRef(false);
  useEffect(()=>{
    if(DEV_MODE){
      setUser({displayName:"Dev User",email:"dev@local"});
      setAuthLoading(false);
      setScreen("clients");
      return;
    }
    const unsub=auth.onAuthStateChanged(async u=>{
      if(!u){
        setUser(null);
        setAuthLoading(false);
        if(deniedRef.current){deniedRef.current=false;return;} // keep "denied" screen, don't bounce to "auth"
        setScreen("auth");
        return;
      }
      const email=(u.email||"").trim().toLowerCase();
      try{
        const wl=await db.collection("approvedAdvisors").doc(email).get();
        if(!wl.exists){
          deniedRef.current=true;
          setScreen("denied");
          await auth.signOut();
          return;
        }
        setUser(u);
        setAuthLoading(false);
        setScreen("clients");
      }catch(e){
        // Whitelist check failed (rules/network) — fail closed, not open.
        deniedRef.current=true;
        setScreen("denied");
        await auth.signOut();
      }
    });
    return ()=>unsub();
  },[]);

  const logout=()=>{auth.signOut();setScreen("auth");setCurrentClient(null);};

  // ── Open existing client ──
  const openClient=(clientData)=>{
    setCurrentClient(clientData);
    // Merge saved data into initState (fill missing keys gracefully)
    setD({...initState(),...clientData});
    setCur(0);
    setScreen("planner");
    setSavedAt(clientData.updatedAt?clientData.updatedAt.toDate?clientData.updatedAt.toDate():new Date(clientData.updatedAt):null);
    setShareUrl(`${window.location.origin}${window.location.pathname}?share=${user.uid}_${clientData.id}`);
  };

  // ── New client ──
  const newClient=()=>{
    setCurrentClient(null);
    setD(initState());
    setCur(0);
    setScreen("planner");
    setSavedAt(null);
    setShareUrl("");
  };

  // ── Save to Firestore ──
  const saveClient=async()=>{
    if(!user) return;
    setSaving(true);
    try {
      const snapshot={
        ...D,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        advisorUid:user.uid,
        totIn:D.income?.reduce((s,r)=>s+(r.freq==="yearly"?(r.amt||0)/12:(r.amt||0)),0)||0,
        retGap:Math.max(0,(()=>{
          const ca2=calcAge(D.dob)||35;
          const ytr2=Math.max(0,(D.retAge||60)-ca2);
          const yir2=Math.max(0,(D.lifeExp||85)-(D.retAge||60));
          const inf=(D.infl||3)/100,ra2=(D.retAfter||3)/100;
          const fm2=(D.monthlyNeed||0)*Math.pow(1+inf,ytr2);
          let needed2=0;if(ra2>0&&yir2>0) needed2=fm2*12*(1-Math.pow(1+ra2,-yir2))/ra2;
          let prepFV2=0;(D.retAssets||[]).forEach(a=>{prepFV2+=(a.cv||0)*Math.pow(1+(a.rr||0)/100,ytr2);});
          return needed2-prepFV2;
        })()),
      };
      let docRef;
      if(currentClient?.id){
        docRef=db.collection("advisors").doc(user.uid).collection("clients").doc(currentClient.id);
        await docRef.set(snapshot,{merge:true});
      } else {
        docRef=await db.collection("advisors").doc(user.uid).collection("clients").add(snapshot);
        setCurrentClient({id:docRef.id,...snapshot});
        setShareUrl(`${window.location.origin}${window.location.pathname}?share=${user.uid}_${docRef.id}`);
      }
      setSavedAt(new Date());
    } catch(e){console.error(e);}
    setSaving(false);
  };

  // ── Copy share URL ──
  const copyShare=()=>{
    if(!shareUrl){alert("กรุณา Save ก่อนแชร์");return;}
    if(!D.email){alert("กรุณากรอกอีเมลลูกค้าในหน้า 'ข้อมูลลูกค้า' ก่อนแชร์ — ลูกค้าต้อง Login Google ด้วยอีเมลนี้เพื่อดูแผน");return;}
    navigator.clipboard.writeText(shareUrl).then(()=>{setShowShareToast(true);setTimeout(()=>setShowShareToast(false),2500);});
  };

  const goNext=()=>{if(cur===9){openPDF(D);return;}setCur(c=>Math.min(9,c+1));};
  const goBack=()=>setCur(c=>Math.max(0,c-1));
  const jumpTo=useCallback((i)=>{setCur(i);setDrawerOpen(false);},[]);
  const PageContent=PAGES[cur].content;
  const PagePanel=PAGES[cur].panel;
  const isCF=cur===2;

  // ── Render screens ──
  if(SHARE_MODE) return <ShareViewScreen/>;
  if(authLoading) return <div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#EDE8E0",fontFamily:"'Kanit',sans-serif",color:C.text3,fontSize:14}}>กำลังโหลด...</div>;
  if(screen==="auth") return <AuthScreen onLogin={()=>{}}/>;
  if(screen==="denied") return <DeniedScreen onBack={()=>setScreen("auth")}/>;
  if(screen==="clients") return <ClientListScreen user={user} onOpen={openClient} onNew={newClient} onLogout={logout}/>;

  // ── Planner screen ──
  const fmtSaved=savedAt?savedAt.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"}):"";

  return (
    <div style={{...s.app,background:isCF?"#E8EAF0":"#EDE8E0"}}>
      <style>{`
        .fp-sidebar-full{display:flex!important}
        .fp-hamburger{display:none!important}
        .fp-drawer-overlay{display:none!important}
        @media(max-width:1024px){
          .fp-sidebar-full{display:none!important}
          .fp-hamburger{display:flex!important}
          .fp-drawer-overlay{position:fixed;inset:0;z-index:100;display:flex!important}
        }
        .fp-step-item:hover{background:rgba(255,255,255,0.07)!important}
        .fp-sidebar-scroll::-webkit-scrollbar{width:3px}
        .fp-sidebar-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}
        .fp-save-btn:hover{background:rgba(59,130,246,0.15)!important}
        .fp-share-btn:hover{background:rgba(14,110,85,0.12)!important}
      `}</style>

      {/* Share toast */}
      {showShareToast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:C.teal,color:"white",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:500,zIndex:9999,boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>✅ คัดลอก Share Link แล้ว!</div>}

      {/* Topbar */}
      <div style={{height:50,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1rem",flexShrink:0,gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setScreen("clients")} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:7,padding:"5px 10px",color:"rgba(255,255,255,.7)",fontFamily:"'Kanit',sans-serif",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>‹ ลูกค้า</button>
          <div style={{width:1,height:20,background:"rgba(255,255,255,.12)"}}/>
          <div style={{width:22,height:22,background:C.gold,borderRadius:5,flexShrink:0}}/>
          <span style={{fontSize:13,fontWeight:700,color:"white"}}>{D.name||"ลูกค้าใหม่"}</span>
          {savedAt&&<span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>บันทึกเวลา {fmtSaved}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <img src={user?.photoURL||""} alt="" style={{width:26,height:26,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.2)"}} onError={e=>e.target.style.display="none"}/>
          <span style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{user?.displayName?.split(" ")[0]||""}</span>
        </div>
      </div>


      {/* ── BODY ── */}
      <div style={s.body}>

        {/* FULL SIDEBAR — desktop */}
        <div className="fp-sidebar-full" style={{...s.sidebar,width:sidebarExpanded?248:64}}>

          {/* Toggle expand button */}
          <button onClick={()=>setSidebarExpanded(v=>!v)} style={{height:48,display:"flex",alignItems:"center",justifyContent:sidebarExpanded?"flex-end":"center",padding:sidebarExpanded?"0 12px":"0",border:"none",background:"transparent",cursor:"pointer",borderBottom:"0.5px solid rgba(255,255,255,0.07)",flexShrink:0,transition:"all .25s"}}>
            <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,255,255,.5)",transition:"transform .25s",transform:sidebarExpanded?"rotate(180deg)":"rotate(0deg)"}}>›</div>
          </button>

          {/* Pyramid — only when expanded */}
          {sidebarExpanded&&<div style={s.pyrWrap}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:".1em",color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginBottom:1}}>Financial Planning</div>
            <div style={{fontSize:15,fontWeight:700,color:"white",marginBottom:".5rem"}}>พีระมิดการเงิน</div>
            <SidebarPyramid step={cur}/>
          </div>}

          {/* Step list */}
          <div className="fp-sidebar-scroll" style={{...s.stepsSection,overflowX:"hidden"}}>
            {!sidebarExpanded&&<div style={{fontSize:8,fontWeight:600,color:"rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:".08em",textAlign:"center",padding:"4px 0 6px"}}>STEPS</div>}
            {sidebarExpanded&&<div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".08em",padding:"0 .25rem",marginBottom:4}}>ขั้นตอน</div>}
            {STEPS.map((step,i)=>{
              const isActive=i===cur, isDone=i<cur;
              return <div key={i} className="fp-step-item" onClick={()=>jumpTo(i)}
                style={{...s.stepItem,background:isActive?"rgba(212,148,26,.18)":"transparent",justifyContent:sidebarExpanded?"flex-start":"center",padding:sidebarExpanded?"8px 10px":"8px 0"}}>
                <div style={{...s.stepNum,background:isActive?"#D4941A":isDone?"rgba(94,201,165,.15)":"rgba(255,255,255,.08)",color:isActive?"#1A1A1A":isDone?"#5EC9A5":"rgba(255,255,255,.4)",fontSize:isActive||isDone?11:14,flexShrink:0}}>
                  {isDone?"✓":sidebarExpanded?(i+1):STEP_ICONS[i]}
                </div>
                {sidebarExpanded&&<div style={{display:"flex",flexDirection:"column",lineHeight:1.3,overflow:"hidden"}}>
                  <span style={{fontSize:13,fontWeight:isActive?600:400,color:isActive?"white":"rgba(255,255,255,.65)",whiteSpace:"nowrap"}}>{step.n}</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,.3)",whiteSpace:"nowrap"}}>{step.e}</span>
                </div>}
              </div>;
            })}
          </div>
        </div>

        {/* DRAWER OVERLAY — iPad */}
        {drawerOpen&&<div className="fp-drawer-overlay" onClick={()=>setDrawerOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:260,background:"#2B2D31",height:"100%",display:"flex",flexDirection:"column",boxShadow:"4px 0 24px rgba(0,0,0,0.3)",overflow:"hidden"}}>
            <div style={{padding:"1rem",borderBottom:"0.5px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:13,fontWeight:700,color:"white"}}>ขั้นตอน</div>
              <button onClick={()=>setDrawerOpen(false)} style={{border:"none",background:"rgba(255,255,255,.08)",borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14,color:"rgba(255,255,255,.6)"}}>✕</button>
            </div>
            <div style={{padding:".5rem .625rem",overflowY:"auto",flex:1}}>
              <SidebarPyramid step={cur}/>
              <div style={{height:"0.5px",background:"rgba(255,255,255,.07)",margin:".5rem 0"}}/>
              {STEPS.map((step,i)=>{
                const isActive=i===cur,isDone=i<cur;
                return <div key={i} onClick={()=>jumpTo(i)} style={{...s.stepItem,background:isActive?"rgba(212,148,26,.18)":"transparent"}}>
                  <div style={{...s.stepNum,background:isActive?"#D4941A":isDone?"rgba(94,201,165,.15)":"rgba(255,255,255,.08)",color:isActive?"#1A1A1A":isDone?"#5EC9A5":"rgba(255,255,255,.4)"}}>{isDone?"✓":(i+1)}</div>
                  <div style={{display:"flex",flexDirection:"column",lineHeight:1.3}}>
                    <span style={{fontSize:13,fontWeight:isActive?600:400,color:isActive?"white":"rgba(255,255,255,.7)"}}>{step.n}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{step.e}</span>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </div>}

        {/* MAIN CONTENT */}
        <div style={s.mainWrap}>
          <div style={s.scrollArea}>
            <div style={{...s.contentCol}}>
              <PageContent D={D} set={setD} onJump={jumpTo} step={cur}/>
            </div>
            {PagePanel!==Panel1&&PagePanel!==Panel2&&PagePanel!==Panel3&&PagePanel!==Panel4&&PagePanel!==Panel5&&PagePanel!==Panel6&&PagePanel!==Panel7&&PagePanel!==Panel8&&PagePanel!==Panel9&&PagePanel!==Panel10&&<div style={s.panelCol}>
              <PagePanel D={D}/>
            </div>}
          </div>
          <div style={{...s.bottomNav}}>
            <button onClick={goBack} style={{...s.navBtn,padding:"6px 16px",visibility:cur===0?"hidden":"visible"}}>‹ ย้อนกลับ</button>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button className="fp-save-btn" onClick={saveClient} disabled={saving} style={{padding:"7px 14px",borderRadius:10,fontSize:13,fontFamily:"'Kanit',sans-serif",fontWeight:600,cursor:saving?"not-allowed":"pointer",border:`1px solid rgba(59,130,246,0.3)`,background:"rgba(59,130,246,0.08)",color:"#1E5499",display:"flex",alignItems:"center",gap:5,opacity:saving?0.7:1,transition:"background .15s"}}>
                {saving?"⏳":"💾"} {saving?"กำลังบันทึก...":"บันทึก"}
              </button>
              <button className="fp-share-btn" onClick={copyShare} style={{padding:"7px 14px",borderRadius:10,fontSize:13,fontFamily:"'Kanit',sans-serif",fontWeight:600,cursor:"pointer",border:`1px solid rgba(14,110,85,0.25)`,background:"rgba(14,110,85,0.07)",color:C.teal,display:"flex",alignItems:"center",gap:5,transition:"background .15s"}}>
                🔗 แชร์
              </button>
            </div>
            <div style={{flex:1,height:5,background:"rgba(0,0,0,0.07)",borderRadius:3,overflow:"hidden",maxWidth:240}}>
              <div style={{height:"100%",width:`${((cur+1)/10)*100}%`,background:"#3B82F6",borderRadius:3,transition:"width .3s ease"}}/>
            </div>
            <button onClick={goNext} style={{...s.navBtnPrimary,padding:"7px 20px"}}>{cur===9?"🖨 Export PDF":"ถัดไป ›"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
