// ─── AUTH SCREEN ─────────────────────────────────────────────────────────
function AuthScreen({onLogin}) {
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const login=async()=>{
    setLoading(true);setErr("");
    try{await auth.signInWithPopup(googleProvider);}
    catch(e){setErr("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");setLoading(false);}
  };
  return (
    <div style={{height:"100dvh",minHeight:"-webkit-fill-available",background:"#EDE8E0",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Kanit',sans-serif"}}>
      <div style={{background:"#FAF8F5",borderRadius:20,padding:"2.5rem 2rem",boxShadow:"0 8px 40px rgba(0,0,0,0.10)",width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{width:52,height:52,background:C.navy,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem"}}>
          <div style={{width:28,height:28,background:C.gold,borderRadius:7}}/>
        </div>
        <div style={{fontSize:22,fontWeight:700,color:C.navy,marginBottom:4}}>Financial Planning</div>
        <div style={{fontSize:13,color:C.text3,marginBottom:"2rem"}}>พีระมิดการเงิน — Advisor Platform</div>
        <button onClick={login} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:12,border:`1px solid ${C.border2}`,background:"white",fontFamily:"'Kanit',sans-serif",fontSize:15,fontWeight:500,color:C.navy,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",opacity:loading?0.7:1}}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.5-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.1 33.6C29.3 34.8 26.8 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.6 5.1C9.8 39.6 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.3 5.2c3.7-3.4 6-8.4 6-14.5 0-1.3-.1-2.7-.4-4z"/></svg>
          {loading?"กำลังเข้าสู่ระบบ...":"เข้าสู่ระบบด้วย Google"}
        </button>
        {err&&<div style={{marginTop:12,fontSize:12,color:C.red}}>{err}</div>}
        <div style={{marginTop:"1.5rem",fontSize:11,color:C.text3}}>ข้อมูลลูกค้าถูกเก็บแยกตามบัญชี Advisor</div>
      </div>
    </div>
  );
}

