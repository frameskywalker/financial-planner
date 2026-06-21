// ─── PAGE 1: PYRAMID ────────────────────────────────────────────────────
const PYR_LEVELS = [
  {num:"ชั้น 1",label:"สำรองสภาพคล่อง",en:"Cash Flow & Liquidity",c:LEVEL_C.liq,
    items:["เงินสำรองฉุกเฉิน 3–6 เท่าของรายจ่าย","บัญชีออมทรัพย์ / กองทุนตลาดเงิน","จัดการรายรับ-รายจ่าย สูตร 50/30/20"]},
  {num:"ชั้น 2",label:"การคุ้มครอง",en:"Risk Transfer",c:LEVEL_C.risk,
    items:["ประกันชีวิต · ประกันสุขภาพ","ประกันอุบัติเหตุ","ประกันทรัพย์สิน / วินาศภัย"]},
  {num:"ชั้น 3",label:"เป้าหมายการเงิน",en:"Short / Mid / Long Term",c:LEVEL_C.goals,
    items:["ระยะสั้น: รถ · บ้าน · แต่งงาน","ระยะกลาง: ธุรกิจ · การศึกษาบุตร","ระยะยาว: RMF · LTF · บำนาญ"]},
  {num:"ชั้น 4",label:"ลงทุน",en:"Investment",c:LEVEL_C.invest,
    items:["หุ้นรายตัว · ETF · ทองคำ","อสังหาริมทรัพย์ · กองทุนรวม","ส่งต่อความมั่งคั่ง · มรดก"]},
];
function Page1({step}) {
  return <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
        <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>พีระมิดการเงิน <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Financial Pyramid</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:24,padding:"6px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#10B981"}}/>
        <span style={{fontSize:12,color:"#374151",fontWeight:500}}>ภาพรวมการวางแผนการเงิน</span>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:9,background:C.navyPale,border:`0.5px solid ${C.border}`,borderRadius:10,padding:"9px 13px"}}>
      <span style={{fontSize:15}}>🔺</span>
      <span style={{fontSize:12,color:C.text2,lineHeight:1.5}}>อ่านพีระมิดจาก <b style={{color:C.navy}}>ฐานขึ้นบน</b> — สร้างชั้นล่าง (สภาพคล่อง · ความคุ้มครอง) ให้มั่นคงก่อน แล้วจึงต่อยอดสู่ <b style={{color:C.navy}}>เป้าหมายและการลงทุน</b> ด้านบน</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:"1rem",alignItems:"center",flex:1}}>
      <div>{[PYR_LEVELS[0],PYR_LEVELS[1]].map((lv,i)=><LevelCard key={i} lv={lv}/>)}</div>
      <div style={{background:"white",borderRadius:16,padding:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}><FullPyramid/></div>
      <div>{[PYR_LEVELS[2],PYR_LEVELS[3]].map((lv,i)=><LevelCard key={i} lv={lv}/>)}</div>
    </div>
  </div>;
}
function Panel1() { return null; }




