const { useState, useCallback, useEffect, useRef } = React;

// ─── FIREBASE ────────────────────────────────────────────────────────────
const auth = firebase.auth();
const db   = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ─── DEV MODE: เปิด ?dev=1 ใน URL เพื่อข้าม Google login ──────────────
const DEV_MODE = new URLSearchParams(window.location.search).get("dev") === "1";

// ─── SHARE MODE: ?share=uid_clientId ────────────────────────────────────
const _shareParam = new URLSearchParams(window.location.search).get("share");
const SHARE_MODE = !!_shareParam;
const SHARE_UID = SHARE_MODE ? _shareParam.split("_")[0] : null;
const SHARE_CID = SHARE_MODE ? _shareParam.split("_").slice(1).join("_") : null;



// ─── THEME ─────────────────────────────────────────────────────────────
const C = {
  navy:"#0D2B4E", navy2:"#163D6E", navy3:"#1E5499",
  navyLight:"#EBF2FB", navyPale:"#F4F8FD",
  gold:"#B87A14", gold2:"#D4941A", goldLight:"#FDF3E0",
  coral:"#C0622A", olive:"#4E6B3A", baseDark:"#2B4066", baseDarker:"#1C2F4D",
  teal:"#0E6E55", tealLight:"#E2F5EE",
  red:"#A33030", redLight:"#FDECEA",
  amber:"#8A5010", amberLight:"#FDF0DC",
  surface:"#EDE8E0", white:"#FAF8F5",
  border:"rgba(13,43,78,0.09)", border2:"rgba(13,43,78,0.16)",
  text:"#0D2B4E", text2:"#2C4A6E", text3:"#6A85A8",
  darkPanel:"#1A2B42",
};
const s = {
  app:{display:"flex",flexDirection:"column",height:"100dvh",minHeight:"-webkit-fill-available",fontFamily:"'Kanit',sans-serif",background:"#EDE8E0",color:"#1A1A1A",overflow:"hidden"},
  topbar:{height:50,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.25rem",flexShrink:0},
  logoBox:{width:26,height:26,background:C.gold,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"},
  progStrip:{height:2,background:"rgba(255,255,255,.1)",flexShrink:0},
  body:{display:"flex",flex:1,overflow:"hidden"},
  sidebar:{background:"#2B2D31",borderRight:`0.5px solid rgba(255,255,255,0.06)`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,transition:"width .25s cubic-bezier(.4,0,.2,1)"},
  pyrWrap:{padding:".875rem .875rem .625rem",borderBottom:`0.5px solid rgba(255,255,255,0.07)`,flexShrink:0},
  stepsSection:{padding:".5rem .5rem",flex:1,overflowY:"auto"},
  stepItem:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,cursor:"pointer",marginBottom:2,transition:"background .15s"},
  stepNum:{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,flexShrink:0},
  mainWrap:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0},
  scrollArea:{flex:1,overflowY:"auto",display:"flex",alignItems:"flex-start",gap:".875rem",padding:"1.25rem"},
  contentCol:{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:".875rem"},
  panelCol:{width:212,flexShrink:0},
  card:{background:"#FAF8F5",border:`0.5px solid rgba(0,0,0,0.08)`,borderRadius:14,padding:"1rem 1.125rem"},
  cardTitle:{fontSize:12,fontWeight:600,color:"#7A8A7A",letterSpacing:".06em",textTransform:"uppercase",marginBottom:".75rem",display:"flex",alignItems:"center",gap:6},
  ctAcc:{width:3,height:14,borderRadius:2,background:C.gold,display:"inline-block",flexShrink:0},
  label:{fontSize:14,color:"#6A7A6A",marginBottom:4,display:"block",fontWeight:400},
  hint:{fontSize:12,color:"#8A9A8A",marginTop:3},
  input:{fontFamily:"'Kanit',sans-serif",fontSize:14,color:"#1A1A1A",background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",outline:"none",width:"100%",boxSizing:"border-box"},
  summaryPanel:{background:"#1E2B2E",borderRadius:14,padding:"1rem 1.125rem",color:"white"},
  spEye:{fontSize:10,color:"rgba(255,255,255,.4)",letterSpacing:".09em",textTransform:"uppercase",marginBottom:".75rem"},
  spLbl:{fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:3,fontWeight:400},
  spVal:{fontSize:24,fontWeight:700,color:"white",lineHeight:1},
  spSub:{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2},
  spDiv:{height:.5,background:"rgba(255,255,255,.07)",margin:".625rem 0"},
  bottomNav:{height:46,background:"#FAF8F5",borderTop:`0.5px solid rgba(0,0,0,0.08)`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.25rem",gap:"1rem",flexShrink:0},
  navBtn:{padding:"9px 20px",borderRadius:10,fontSize:14,fontFamily:"'Kanit',sans-serif",fontWeight:500,cursor:"pointer",border:`0.5px solid rgba(0,0,0,0.15)`,background:"#FAF8F5",color:"#1A1A1A",display:"flex",alignItems:"center",gap:5,transition:"background .15s"},
  navBtnPrimary:{padding:"9px 22px",borderRadius:10,fontSize:14,fontFamily:"'Kanit',sans-serif",fontWeight:600,cursor:"pointer",border:"none",background:"#3B82F6",color:"white"},
  tipChip:{display:"inline-flex",alignItems:"center",gap:5,background:"#FDF3E0",border:`0.5px solid #D4941A`,borderRadius:20,padding:"5px 12px",fontSize:12,color:"#8A5010",fontWeight:500,whiteSpace:"nowrap",flexShrink:0,marginTop:2},
  pageTitle:{fontSize:38,fontWeight:700,color:"#1A1A1A",lineHeight:1.05,marginBottom:6,letterSpacing:"-.01em"},
  pageSub:{fontSize:14,color:"#7A8A7A",lineHeight:1.5},
  stepBadge:{fontSize:11,fontWeight:600,color:"#B87A14",letterSpacing:".08em",textTransform:"uppercase",marginBottom:5},
};

// ─── UTILS ─────────────────────────────────────────────────────────────
const fmt = n => Math.round(n||0).toLocaleString("th-TH");
const fmtM = n => { const v=Math.abs(n||0); return v>=1e6?(n/1e6).toFixed(2)+" ล.":fmt(n); };
const calcAge = dob => dob ? Math.floor((new Date()-new Date(dob))/31557600000) : null;

// ─── PYRAMID SVG ────────────────────────────────────────────────────────
const PYRAMID_HIGHLIGHTS = {
  0:[],1:[],
  2:["short","mid","long"],3:["liq","risk"],
  4:["liq","risk"],5:["short","mid","long"],
  6:["invest"],7:["invest"],
  8:["invest","short","mid","long","liq","risk"],
};
// Unified pyramid palette — shared by cards, overview diagram, and sidebar
const LEVEL_C = {liq:"#1E5499", risk:"#0E6E55", goals:"#B87A14", invest:"#C0622A"};
const LAYER_COLORS = {invest:LEVEL_C.invest,short:LEVEL_C.goals,mid:LEVEL_C.goals,long:LEVEL_C.goals,liq:LEVEL_C.liq,risk:LEVEL_C.risk};
const NEUTRAL = "#B4B2A4";

// ─── STEP LIST ──────────────────────────────────────────────────────────
const STEPS = [
  {n:"พีระมิดการเงิน",e:"Pyramid Overview"},
  {n:"ข้อมูลลูกค้า",e:"Client Info"},
  {n:"กระแสเงินสด",e:"Cash Flow"},
  {n:"สำรองสภาพคล่อง",e:"Liquidity"},
  {n:"การคุ้มครอง",e:"Protection"},
  {n:"เป้าหมายการเงิน",e:"Goals"},
  {n:"แผนเกษียณ",e:"Retirement"},
  {n:"ทุนการศึกษา",e:"Education"},
  {n:"วางแผนภาษี",e:"Tax Planning"},
  {n:"สรุปแผนการเงิน",e:"Summary"},
];

// ─── INITIAL STATE ──────────────────────────────────────────────────────
const initState = () => ({
  name:"",dob:"",occ:"",phone:"",email:"",status:"single",
  spName:"",spDob:"",spOcc:"",children:[],
  expense:0,mult:6,saved:0,
  lifeIns:{sum:0,room:0,treat:0,critical:0},
  nonLife:{acc:0,comp:0},
  lifePol:[],nonlifePol:[],
  goalsTab:"short",shortGoals:[],midGoals:[],
  income:[{lbl:"เงินเดือน",amt:0,freq:"monthly"}],
  fixed:[{lbl:"ผ่อนบ้าน/ค่าเช่า",amt:0,freq:"monthly"}],
  variable:[{lbl:"ค่าอาหาร",amt:0,freq:"monthly"}],
  savings:0,
  retAge:60,lifeExp:85,monthlyNeed:30000,infl:3,retBefore:6,retAfter:3,
  retAssets:[],
  eduTab:0,eduData:[],eduPrepared:"",
  advisorName:"",advisorPhone:"",advisorEmail:"",
  // ─── Tax Deduction Page ───
  tax:{
    // กลุ่ม 1: ส่วนตัว/ครอบครัว
    spouseDeduct:false, // คู่สมรสไม่มีรายได้
    parentCount:0,      // จำนวนพ่อแม่ที่ดูแล (0-4)
    disabledCount:0,    // จำนวนผู้พิการที่อุปการะ
    maternityExp:0,     // ค่าฝากครรภ์/คลอดบุตร
    // กลุ่ม 2: ประกัน/ออม/ลงทุน
    sso:0,              // ประกันสังคม
    lifeInsDeduct:0,    // เบี้ยประกันชีวิต/สะสมทรัพย์
    healthInsDeduct:0,  // เบี้ยประกันสุขภาพ
    parentHealthIns:0,  // ประกันสุขภาพพ่อแม่
    rmf:0,              // RMF
    ssf:0,              // Thai ESG
    pvd:0,              // กองทุนสำรองเลี้ยงชีพ
    nsf:0,              // กอช.
    annuityIns:0,       // ประกันบำนาญ
    // กลุ่ม 3: บริจาค
    donationGeneral:0,  // บริจาคทั่วไป
    donationEdu:0,      // บริจาคเพื่อการศึกษา/กีฬา
    donationParty:0,    // บริจาคพรรคการเมือง
    // กลุ่ม 4: กระตุ้นเศรษฐกิจ
    easyEReceipt:0,     // Easy e-Receipt
    homeLoanInterest:0, // ดอกเบี้ยกู้บ้าน
    solarCell:0,        // ติดตั้งโซล่าร์เซลล์
    newHouse:0,         // ค่าสร้างบ้านใหม่
  },
});

const STEP_ICONS=["🔺","👤","💳","💧","🛡","🎯","🏖","🎓","🧾","📋"];
