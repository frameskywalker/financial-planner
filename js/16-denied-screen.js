// ─── DENIED SCREEN (advisor not on whitelist) ────────────────────────────
function DeniedScreen({onBack}) {
  return (
    <div style={{height:"100dvh",minHeight:"-webkit-fill-available",background:"#EDE8E0",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Kanit',sans-serif",padding:"2rem"}}>
      <div style={{background:"#FAF8F5",borderRadius:20,padding:"2.5rem 2rem",boxShadow:"0 8px 40px rgba(0,0,0,0.10)",width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:".75rem"}}>🚫</div>
        <div style={{fontSize:18,fontWeight:700,color:C.navy,marginBottom:6}}>ไม่ได้รับอนุญาตให้ใช้งาน</div>
        <div style={{fontSize:13,color:C.text3,marginBottom:"1.5rem",lineHeight:1.6}}>บัญชี Google ของคุณไม่อยู่ในรายชื่อ Advisor ที่ได้รับอนุญาต กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าใช้งาน</div>
        <button onClick={onBack} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px solid ${C.border2}`,background:"white",fontFamily:"'Kanit',sans-serif",fontSize:14,fontWeight:500,color:C.navy,cursor:"pointer"}}>กลับไปหน้าเข้าสู่ระบบ</button>
      </div>
    </div>
  );
}

