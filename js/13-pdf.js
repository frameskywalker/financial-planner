// ─── PDF EXPORT ─────────────────────────────────────────────────────────
function buildPDF(D) {
  const {totIn,totOut,net,savRate,liqGoal,liqGap,liqPct,protTot,retGap,prepFV,needed,ytr,yir,fm,ca}=(() => {
    const mEqP=r=>(r.freq==="yearly"?(r.amt||0)/12:(r.amt||0));
    const totIn=D.income.reduce((s,r)=>s+mEqP(r),0);
    const totFix=D.fixed.reduce((s,r)=>s+mEqP(r),0);
    const totVar=D.variable.reduce((s,r)=>s+mEqP(r),0);
    const totOut=totFix+totVar;
    const net=totIn-(totOut+D.savings);
    const savRate=totIn>0?Math.round(D.savings/totIn*100):0;
    const liqGoal=D.expense*D.mult;
    const liqGap=Math.max(0,liqGoal-D.saved);
    const liqPct=liqGoal>0?Math.min(100,Math.round(D.saved/liqGoal*100)):0;
    const protLife=Object.values(D.lifeIns).filter(v=>v>0).length;
    const protNl=Object.values(D.nonLife).filter(v=>v>0).length;
    const protTot=protLife+protNl;
    const ca=calcAge(D.dob)||35;
    const ytr=Math.max(0,(D.retAge||60)-ca);
    const yir=Math.max(0,(D.lifeExp||85)-(D.retAge||60));
    const inf=(D.infl||3)/100,ra2=(D.retAfter||3)/100,rb=(D.retBefore||6)/100;
    const fm=(D.monthlyNeed||0)*Math.pow(1+inf,ytr);
    let needed=0;if(ra2>0&&yir>0)needed=fm*12*(1-Math.pow(1+ra2,-yir))/ra2;
    let prepFV=0;D.retAssets.forEach(a=>{prepFV+=(a.cv||0)*Math.pow(1+(a.rr||0)/100,ytr);});
    const retGap=Math.max(0,needed-prepFV);
    const rb2=(D.retBefore||6)/100;
    const mSave=(rb2>0&&ytr>0)?retGap*(rb2/12)/(Math.pow(1+rb2/12,ytr*12)-1):0;
    return{totIn,totOut,net,savRate,liqGoal,liqGap,liqPct,protTot,retGap,prepFV,needed,ytr,yir,fm,ca,mSave};
  })();

  const rb=(D.retBefore||6)/100;
  const mSave=(rb>0&&ytr>0)?retGap*(rb/12)/(Math.pow(1+rb/12,ytr*12)-1):0;
  const liqOk=liqPct>=80,protOk=Math.round(protTot/6*100)>=60,cfOk=net>=0,retOk=retGap<100000;
  const today=new Date().toLocaleDateString("th-TH",{year:"numeric",month:"long",day:"numeric"});
  const todayEn=new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"});
  const f=n=>Math.round(n||0).toLocaleString("th-TH");
  const fM=n=>{const v=Math.abs(n||0);return v>=1e6?(n/1e6).toFixed(2)+" ล.":f(n);};
  const dash=v=>v||"—";
  const EDU_L=[{lbl:"อนุบาล",lbE:"Kindergarten",y:3,sa:0},{lbl:"ประถม",lbE:"Primary",y:6,sa:3},{lbl:"มัธยม",lbE:"Secondary",y:6,sa:9},{lbl:"ป.ตรี",lbE:"Bachelor",y:4,sa:15},{lbl:"ป.โท",lbE:"Master",y:2,sa:19}];
  const hasChildren=D.children.length>0;
  const totalPages=hasChildren?5:4;

  const nextSteps=[];
  if(!liqOk)nextSteps.push({th:`เพิ่มเงินสำรองให้ครบ ${D.mult}x`,en:`Build emergency fund to ${D.mult}× monthly expenses`,sub:`ขาดอีก ${fM(liqGap)} ฿`});
  if(!protOk)nextSteps.push({th:"เพิ่มความคุ้มครองประกันชีวิตและสุขภาพ",en:"Increase life & health insurance coverage",sub:"ทุนประกันควรอยู่ที่ 10× รายได้ต่อปี"});
  if(retGap>0)nextSteps.push({th:`ออมเพื่อเกษียณ ${f(mSave)} ฿/เดือน`,en:`Save ${f(mSave)} ฿/mo at ${D.retBefore||6}% return`,sub:`ขาดอีก ${fM(retGap)} ฿`});
  if(!cfOk)nextSteps.push({th:"ปรับสมดุลรายรับ-รายจ่าย",en:"Rebalance income and expenses",sub:"กระแสเงินสดปัจจุบันติดลบ"});
  if(nextSteps.length===0)nextSteps.push({th:"รักษาวินัยการออมและลงทุน",en:"Maintain savings discipline and continue investing",sub:"สุขภาพการเงินอยู่ในเกณฑ์ดี"});

  const css=`*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Kanit',sans-serif;background:#2A2A2A;padding:2rem;display:flex;flex-direction:column;align-items:center;gap:2rem}
.pl{color:#AAA;font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;align-self:flex-start;width:210mm}
.a4{background:#EDE8E0;width:210mm;min-height:297mm;padding:16mm 18mm;position:relative;border-radius:4px;box-shadow:0 8px 32px rgba(0,0,0,0.4);display:flex;flex-direction:column}
.ft{margin-top:auto;padding-top:.875rem;border-top:0.5px solid rgba(0,0,0,0.1);display:flex;justify-content:space-between;font-size:9px;color:#8A9A8A}
.pn{position:absolute;top:1.25rem;right:2.5rem;font-size:9px;color:#8A9A8A;background:rgba(0,0,0,0.07);padding:2px 9px;border-radius:12px}
.lr{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem}
.lb{width:30px;height:30px;background:#1E2B2E;border-radius:5px;display:flex;align-items:center;justify-content:center}
.lt{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:11px solid #D4941A}
.br{font-size:12px;font-weight:600;color:#1E2B2E;line-height:1.2}
.bs{font-size:9px;color:#8A9A8A;letter-spacing:.07em;text-transform:uppercase}
.dp{font-size:10px;color:#8A9A8A;background:rgba(0,0,0,0.07);padding:3px 10px;border-radius:12px}
.ct{font-size:28px;font-weight:700;color:#1A1A1A;margin-bottom:2px;letter-spacing:-.01em}
.ce{font-size:12px;color:#8A9A8A;margin-bottom:1.5rem;letter-spacing:.02em}
.cb{background:rgba(0,0,0,0.055);border-radius:10px;padding:1rem 1.125rem;display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin-bottom:1.5rem}
.cl{font-size:9px;color:#8A9A8A;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}
.cv{font-size:12px;font-weight:500;color:#1A1A1A}
.di{font-size:10px;color:#8A9A8A;line-height:1.75}
.dv{height:0.5px;background:rgba(0,0,0,0.1);margin:.875rem 0}
.st{font-size:12px;font-weight:700;color:#1A1A1A;margin-bottom:.625rem;display:flex;align-items:center;gap:7px}
.se{font-size:9px;color:#8A9A8A;font-weight:400;margin-left:2px;letter-spacing:.04em}
.ac{width:3px;height:13px;border-radius:2px;display:inline-block;flex-shrink:0}
.two{display:grid;grid-template-columns:1fr 1fr;gap:.875rem}
.thr{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.625rem}
.kp{background:rgba(0,0,0,0.05);border-radius:7px;padding:.5rem .75rem}
.kl{font-size:8.5px;color:#8A9A8A;margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em}
.kv{font-size:15px;font-weight:700;color:#1A1A1A}
.kv.g{color:#0E6E55}.kv.r{color:#A33030}.kv.a{color:#8A5010}
.dr{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:0.5px solid rgba(0,0,0,0.07);font-size:10.5px}
.dr:last-child{border-bottom:none}
.dl{color:#6A6A6A}.dv2{color:#1A1A1A;font-weight:500}
.dv2.g{color:#0E6E55}.dv2.r{color:#A33030}.dv2.a{color:#8A5010}
.sb{font-size:8.5px;padding:2px 7px;border-radius:8px;font-weight:500}
.ok{background:#E2F5EE;color:#085041}.wn{background:#FDF0DC;color:#633806}.gp{background:#FDECEA;color:#791F1F}
.ns{display:flex;gap:8px;padding:5px 0;border-bottom:0.5px solid rgba(0,0,0,0.07);align-items:flex-start}
.ns:last-child{border-bottom:none}
.nn{width:17px;height:17px;border-radius:50%;background:rgba(0,0,0,0.08);color:#8A5010;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.nm{font-size:11px;font-weight:500;color:#1A1A1A;margin-bottom:1px}
.ns2{font-size:9.5px;color:#6A6A6A;line-height:1.4}
.mn{background:rgba(0,0,0,0.045);border-radius:7px;padding:.5rem .75rem;margin-top:.5rem}
.bb{height:5px;background:rgba(0,0,0,0.1);border-radius:3px;overflow:hidden;margin-top:3px}
.bf{height:100%;border-radius:3px}
@media print{body{background:white;padding:0;gap:0}.a4{box-shadow:none;border-radius:0;page-break-after:always;width:210mm;min-height:297mm;padding:16mm 18mm}.a4:last-child{page-break-after:avoid}.pl{display:none}@page{size:A4;margin:0}}`;

  const prot=[[`ทุนประกัน`,D.lifeIns.sum,1e6],[`ค่าห้อง`,D.lifeIns.room,5000],[`ค่ารักษา`,D.lifeIns.treat,3e5],[`โรคร้ายแรง`,D.lifeIns.critical,5e5],[`อุบัติเหตุ`,D.nonLife.acc,2e5],[`ค่าชดเชย`,D.nonLife.comp,1000]];
  const statusBadge=(ok,warn)=>ok?`<span class="sb ok">สมบูรณ์ · OK</span>`:warn?`<span class="sb wn">ควรเพิ่ม · Review</span>`:`<span class="sb gp">ขาดอีก · Gap</span>`;
  const protBadge=(v,b)=>{const r=(v||0)/b;return r>=0.8?`<span class="sb ok">✓</span>`:r>=0.3?`<span class="sb wn">ควรเพิ่ม</span>`:`<span class="sb gp">ยังไม่มี</span>`;};
  const kpi=(l,v,cls="")=>`<div class="kp"><div class="kl">${l}</div><div class="kv ${cls}">${v}</div></div>`;
  const dr=(l,v,cls="")=>`<div class="dr"><span class="dl">${l}</span><span class="dv2 ${cls}">${v}</span></div>`;
  const sec=(col,th,en)=>`<div class="st"><span class="ac" style="background:${col}"></span>${th} <span class="se">${en}</span></div>`;
  const pNum=(n)=>`<div class="pn">${n} / ${totalPages}</div>`;
  const footer=(n)=>`<div class="ft"><span>Financial Planning Pyramid · Co-View Worksheet</span><span>Page ${n} of ${totalPages}</span></div>`;

  // EDU totals per child
  const eduRows=D.children.map((ch,ci)=>{
    const ca2=parseInt(ch.a)||0;
    const ed=D.eduData[ci]||[];
    let tot=0;
    const rows=EDU_L.map((l,li)=>{const y=Math.max(0,l.sa-ca2),cost=ed[li]?.cost||0,fv=cost*l.y*Math.pow(1.06,y);tot+=fv;return fv>0?dr(`${l.lbl} · ${l.lbE}`,f(fv)+" ฿"):""}).join("");
    return{ch,rows,tot};
  });

  const page1=`
<div class="pl">Page 1 of ${totalPages} — Cover · ปก</div>
<div class="a4">${pNum(1)}
  <div class="lr">
    <div style="display:flex;align-items:center;gap:9px">
      <div class="lb"><div class="lt"></div></div>
      <div><div class="br">Financial Planning Pyramid</div><div class="bs">Co-View Worksheet</div></div>
    </div>
    <div class="dp">${today} · ${todayEn}</div>
  </div>
  <div class="ct">แผนการเงินส่วนบุคคล</div>
  <div class="ce">Personal Financial Plan</div>
  <div class="cb">
    <div><div class="cl">ชื่อ · Name</div><div class="cv">${dash(D.name)}</div></div>
    <div><div class="cl">อายุ · Age</div><div class="cv">${ca?ca+" ปี · years":"—"}</div></div>
    <div><div class="cl">สถานภาพ · Status</div><div class="cv">${D.status==="married"?"สมรส · Married":"โสด · Single"}</div></div>
    <div><div class="cl">อาชีพ · Occupation</div><div class="cv">${dash(D.occ)}</div></div>
    <div><div class="cl">บุตร · Children</div><div class="cv">${D.children.length} คน · children</div></div>
    <div><div class="cl">จัดทำโดย · Prepared by</div><div class="cv">${dash(D.advisorName)}${D.advisorPhone?" · "+D.advisorPhone:""}</div></div>
  </div>
  <div class="dv"></div>
  <div class="di">รายงานฉบับนี้จัดทำขึ้นเพื่อวางแผนการเงินส่วนบุคคล โดยอิงจากข้อมูลที่ได้รับจากลูกค้า ณ วันที่จัดทำ ข้อมูลและตัวเลขทางการเงินอาจเปลี่ยนแปลงได้ตามสภาวะตลาด<br><br>This report is prepared for personal financial planning purposes based on information provided by the client at the time of preparation. All financial figures are subject to change based on market conditions.</div>
  ${footer(1)}
</div>`;

  const page2=`
<div class="pl">Page 2 of ${totalPages} — Financial Health · ภาพรวม</div>
<div class="a4">${pNum(2)}
  ${sec("#1E2B2E","ภาพรวมสุขภาพการเงิน","Financial Health Overview")}
  <div class="thr" style="margin-bottom:1rem">
    ${kpi("รายรับ/เดือน · Income",f(totIn)+" ฿","g")}
    ${kpi("รายจ่าย/เดือน · Expenses",f(totOut)+" ฿","r")}
    ${kpi("Savings Rate",savRate+"%")}
    ${kpi("เงินออม/เดือน · Savings",f(D.savings)+" ฿")}
    ${kpi("เงินสำรอง · Emergency",f(D.saved)+" ฿",liqOk?"g":"r")}
    ${kpi("Retirement Gap",fM(retGap)+" ฿","a")}
  </div>
  <div class="dv"></div>
  <div class="two">
    <div>
      ${sec("#D4941A","สถานะแต่ละด้าน","Status by Area")}
      <div class="dr"><span class="dl">สำรองสภาพคล่อง · Liquidity</span>${statusBadge(liqOk,false)}</div>
      <div class="dr"><span class="dl">การคุ้มครอง · Protection</span>${statusBadge(protOk,!protOk&&protTot>0)}</div>
      <div class="dr"><span class="dl">เป้าหมายการเงิน · Goals</span>${statusBadge(D.shortGoals.length>0||D.midGoals.length>0,false)}</div>
      <div class="dr"><span class="dl">กระแสเงินสด · Cash Flow</span>${statusBadge(cfOk,false)}</div>
      <div class="dr"><span class="dl">กองทุนเกษียณ · Retirement</span>${statusBadge(retOk,!retOk&&prepFV>0)}</div>
    </div>
    <div>
      ${sec("#0E6E55","ขั้นตอนถัดไป","Next Steps")}
      ${nextSteps.slice(0,4).map((ns,i)=>`<div class="ns"><div class="nn">${i+1}</div><div><div class="nm">${ns.th}</div><div class="ns2">${ns.en}</div></div></div>`).join("")}
    </div>
  </div>
  ${footer(2)}
</div>`;

  const page3=`
<div class="pl">Page 3 of ${totalPages} — Liquidity · Protection · Goals · Cash Flow</div>
<div class="a4">${pNum(3)}
  <div class="thr">
    <div>
      ${sec("#0E6E55","สำรองสภาพคล่อง","Liquidity")}
      ${dr("เป้าหมาย "+D.mult+"x",f(liqGoal)+" ฿")}
      ${dr("เตรียมไว้แล้ว",f(D.saved)+" ฿","g")}
      ${dr("ขาดอีก · Gap",f(liqGap)+" ฿",liqGap>0?"r":"g")}
      <div class="mn">
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#8A9A8A"><span>ความคืบหน้า</span><span>${liqPct}%</span></div>
        <div class="bb"><div class="bf" style="width:${liqPct}%;background:${liqOk?"#0E6E55":"#D4941A"}"></div></div>
      </div>
    </div>
    <div>
      ${sec("#A33030","การคุ้มครอง","Protection")}
      ${prot.map(([l,v,b])=>`<div class="dr"><span class="dl">${l}</span>${protBadge(v,b)}</div>`).join("")}
    </div>
    <div>
      ${sec("#534AB7","เป้าหมาย","Goals")}
      ${D.shortGoals.length>0?`<div style="font-size:9px;color:#8A9A8A;text-transform:uppercase;margin-bottom:3px">ระยะสั้น · Short</div>${D.shortGoals.map(g=>dr(g.n||"—",f(g.a)+" ฿")).join("")}`:""}
      ${D.midGoals.length>0?`<div style="font-size:9px;color:#8A9A8A;text-transform:uppercase;margin:5px 0 3px">ระยะกลาง · Mid</div>${D.midGoals.map(g=>dr(g.n||"—",f(g.a)+" ฿")).join("")}`:""}
      ${D.shortGoals.length===0&&D.midGoals.length===0?`<div style="font-size:10px;color:#8A9A8A">ยังไม่มีเป้าหมาย</div>`:""}
      ${dr("รวม · Total",f([...D.shortGoals,...D.midGoals].reduce((s,g)=>s+(g.a||0),0))+" ฿","a")}
    </div>
  </div>
  <div class="dv"></div>
  ${sec("#2B4066","กระแสเงินสด","Cash Flow")}
  <div class="two">
    <div>
      <div style="font-size:10px;font-weight:600;color:#0E6E55;margin-bottom:.375rem">รายรับ · Income</div>
      ${D.income.map(r=>dr(r.lbl,f(r.amt)+" ฿","g")).join("")}
      ${dr("รวม · Total",f(totIn)+" ฿","g")}
    </div>
    <div>
      <div style="font-size:10px;font-weight:600;color:#A33030;margin-bottom:.375rem">รายจ่าย · Expenses</div>
      ${[...D.fixed,...D.variable].map(r=>dr(r.lbl,f(r.amt)+" ฿","r")).join("")}
      ${dr("รวม · Total",f(totOut)+" ฿","r")}
    </div>
  </div>
  <div class="mn" style="margin-top:.625rem;display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem">
    <div><div style="font-size:9px;color:#8A9A8A;margin-bottom:2px">ออม/เดือน · Savings</div><div style="font-size:13px;font-weight:700;color:#1E2B2E">${f(D.savings)} ฿</div></div>
    <div><div style="font-size:9px;color:#8A9A8A;margin-bottom:2px">เงินเหลือ · Net</div><div style="font-size:13px;font-weight:700;color:${net>=0?"#0E6E55":"#A33030"}">${f(net)} ฿</div></div>
    <div><div style="font-size:9px;color:#8A9A8A;margin-bottom:2px">Savings Rate</div><div style="font-size:13px;font-weight:700;color:#1E2B2E">${savRate}%</div></div>
  </div>
  ${footer(3)}
</div>`;

  const page4=`
<div class="pl">Page 4 of ${totalPages} — Retirement · แผนเกษียณ</div>
<div class="a4">${pNum(4)}
  ${sec("#4E6B3A","วางแผนเกษียณ","Retirement Planning")}
  <div class="thr" style="margin-bottom:1rem">
    ${kpi("เกษียณเมื่ออายุ · Retire at",(D.retAge||60)+" ปี")}
    ${kpi("อายุขัย · Life expectancy",(D.lifeExp||85)+" ปี")}
    ${kpi("ช่วงเกษียณ · Period",yir+" ปี")}
    ${kpi("รายจ่าย/เดือน · Monthly need",f(D.monthlyNeed)+" ฿")}
    ${kpi("เงินเฟ้อ · Inflation",(D.infl||3)+"%/ปี")}
    ${kpi("ผลตอบแทน · Return",(D.retBefore||6)+"%/ปี")}
  </div>
  <div class="dv"></div>
  <div class="two">
    <div>
      ${sec("#2B4066","กองทุนที่ต้องเตรียม","Required Fund")}
      ${dr("รายจ่าย ณ วันเกษียณ",f(fm)+" ฿/เดือน")}
      ${dr("กองทุนที่ต้องการ",fM(needed)+" ฿","a")}
      ${dr("เตรียมไว้แล้ว (FV)",fM(prepFV)+" ฿")}
      ${dr("ขาดอีก · Gap",fM(retGap)+" ฿",retGap>0?"r":"g")}
      <div class="mn">
        <div style="font-size:9px;color:#8A9A8A;margin-bottom:3px">ต้องออมเพิ่ม · Additional savings needed</div>
        <div style="font-size:14px;font-weight:700;color:#1E2B2E">${f(mSave)} ฿/เดือน ที่ ${D.retBefore||6}%</div>
      </div>
    </div>
    <div>
      ${sec("#2B4066","สินทรัพย์ที่เตรียมไว้","Prepared Assets")}
      ${D.retAssets.length===0?`<div style="font-size:10px;color:#8A9A8A">ยังไม่มีสินทรัพย์ที่บันทึก</div>`
        :D.retAssets.filter(a=>(a.cv||0)>0).map(a=>{const fv=(a.cv||0)*Math.pow(1+(a.rr||0)/100,ytr);return dr(a.lbl,f(fv)+" ฿");}).join("")}
      ${dr("รวม FV · Total FV",fM(prepFV)+" ฿",prepFV>0?"g":"")}
    </div>
  </div>
  ${footer(4)}
</div>`;

  const page5=!hasChildren?"":`
<div class="pl">Page 5 of ${totalPages} — Education · Recommendations</div>
<div class="a4">${pNum(5)}
  ${sec("#534AB7","ทุนการศึกษาบุตร","Education Fund")}
  <div class="two" style="margin-bottom:.875rem">
    ${eduRows.map(({ch,rows,tot},ci)=>`
    <div>
      <div style="font-size:10px;font-weight:600;color:#1A1A1A;margin-bottom:.375rem">บุตรคนที่ ${ci+1} · Child ${ci+1} (อายุ ${ch.a||"?"} ปี)</div>
      ${rows||`<div style="font-size:10px;color:#8A9A8A">ยังไม่มีข้อมูล</div>`}
      ${dr("รวม · Total",f(tot)+" ฿","a")}
    </div>`).join("")}
  </div>
  <div class="mn" style="margin-bottom:.875rem">
    <div style="font-size:9px;color:#8A9A8A;margin-bottom:3px">ทุนการศึกษารวมทั้งหมด · Total education fund required</div>
    <div style="font-size:16px;font-weight:700;color:#1E2B2E">${f(eduRows.reduce((s,r)=>s+r.tot,0))} ฿</div>
  </div>
  <div class="dv"></div>
  ${sec("#D4941A","ข้อแนะนำ","Recommendations")}
  ${nextSteps.map((ns,i)=>`<div class="ns"><div class="nn">${i+1}</div><div><div class="nm">${ns.th} · ${ns.en}</div><div class="ns2">${ns.sub}</div></div></div>`).join("")}
  ${footer(5)}
</div>`;

  return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<title>แผนการเงิน — ${D.name||"ลูกค้า"}</title>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
${["<","style>"].join("")}${css}${["<","/style>"].join("")}</head><body>
${page1}${page2}${page3}${page4}${page5}
</body></html>`;
}

function openPDF(D) {
  const html=buildPDF(D);
  const w=window.open("","_blank");
  if(w){w.document.write(html);w.document.close();}
}


