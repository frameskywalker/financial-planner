// ─── PAGE 10: TAX PLANNING ──────────────────────────────────────────────
function Page10({D,set,step}) {
  const {annualIncome,totIn}=useCalcs(D);
  const tx=D.tax||{};
  const upd=(k,v)=>set(p=>({...p,tax:{...p.tax,[k]:v}}));

  // ─ auto-derived from other pages ─
  const numChildren=D.children.length;
  const numChildren2=(D.children||[]).filter((_,i)=>i>=1).length; // 2nd+ born ≥2561 (assume all qualify for simplicity)

  // กลุ่ม 1 auto-calc
  const selfDeduct=60000;
  const spouseDeduct=tx.spouseDeduct?60000:0;
  const child1Deduct=numChildren>=1?30000:0;
  const child2Deduct=numChildren2*30000;
  const childDeduct=child1Deduct+child2Deduct;
  const parentDeduct=(tx.parentCount||0)*30000;
  const disabledDeduct=(tx.disabledCount||0)*60000;
  const maternityDeduct=Math.min(tx.maternityExp||0,60000);
  const group1=selfDeduct+spouseDeduct+childDeduct+parentDeduct+disabledDeduct+maternityDeduct;

  // กลุ่ม 2 insurance/savings caps
  const ssoD=Math.min(tx.sso||0,9000);
  const lifeInsD=Math.min(tx.lifeInsDeduct||0,100000);
  const healthInsD=Math.min(tx.healthInsDeduct||0,25000);
  const lifeHealthCap=Math.min(lifeInsD+healthInsD,100000);
  const parentHlthD=Math.min(tx.parentHealthIns||0,15000);
  const retireCap=500000;
  const rmfD=Math.min(tx.rmf||0,retireCap);
  const ssfD=Math.min(tx.ssf||0,300000);
  const pvdD=Math.min(tx.pvd||0,retireCap);
  const nsfD=Math.min(tx.nsf||0,30000);
  const annuityD=Math.min(tx.annuityIns||0,200000);
  const retireGroup=Math.min(rmfD+pvdD+nsfD+annuityD,retireCap);
  const group2=ssoD+lifeHealthCap+parentHlthD+ssfD+retireGroup;

  // กลุ่ม 3 donations (after deductions — simplified: use 10% of post-deduct income)
  const donationGenD=Math.min(tx.donationGeneral||0,annualIncome*0.1);
  const donationEduD=Math.min((tx.donationEdu||0)*2,annualIncome*0.1);
  const donationPartyD=Math.min(tx.donationParty||0,10000);
  const group3=donationGenD+donationEduD+donationPartyD;

  // กลุ่ม 4 stimulus
  const easyD=Math.min(tx.easyEReceipt||0,50000);
  const homeLoanD=Math.min(tx.homeLoanInterest||0,100000);
  const solarD=Math.min(tx.solarCell||0,200000);
  const newHouseD=Math.min(tx.newHouse||0,100000);
  const group4=easyD+homeLoanD+solarD+newHouseD;

  const totalDeduct=group1+group2+group3+group4;

  // standard expense deduction: 50% of income, max 100,000
  const expenseDeduct=Math.min(annualIncome*0.5,100000);
  const taxableIncome=Math.max(0,annualIncome-expenseDeduct-totalDeduct);
  const taxWithDeduct=calcThaiTax(taxableIncome).tax;
  const taxWithout=calcThaiTax(Math.max(0,annualIncome-expenseDeduct)).tax;
  const taxSaved=Math.max(0,taxWithout-taxWithDeduct);

  const pct=annualIncome>0?Math.round(totalDeduct/annualIncome*100):0;

  return (
    <div style={{background:"#F3F4F6",borderRadius:16,padding:"1.25rem",margin:"-0.25rem",display:"flex",flexDirection:"column",gap:"1rem",minHeight:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:"#3B82F6",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>STEP {(step||0)+1} / 10</div>
          <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,letterSpacing:"-.01em"}}>วางแผนภาษี <span style={{fontSize:14,color:"#9CA3AF",fontWeight:400}}>Tax Planning</span></div>
        </div>
        {/* Summary KPIs */}
        <div style={{display:"flex",gap:".625rem"}}>
          {[
            {lbl:"รายได้ทั้งปี",val:fmtM(annualIncome),col:C.navy3},
            {lbl:"ลดหย่อนรวม",val:fmtM(totalDeduct),col:C.gold},
            {lbl:"ภาษีก่อนลดหย่อน",val:fmtM(taxWithout),col:C.red},
            {lbl:"ประหยัดภาษีได้",val:fmtM(taxSaved),col:C.teal},
          ].map(({lbl,val,col})=>(
            <div key={lbl} style={{background:"white",borderRadius:12,padding:".5rem .75rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",minWidth:110,textAlign:"center"}}>
              <div style={{fontSize:9,color:C.text3,marginBottom:3,fontWeight:500,textTransform:"uppercase",letterSpacing:".05em"}}>{lbl}</div>
              <div style={{fontSize:15,fontWeight:700,color:col}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:".875rem",alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:".875rem"}}>

          {/* Group 1 */}
          <TaxSection title="1. ค่าลดหย่อนส่วนตัวและครอบครัว" color={C.navy3}>
            {/* Auto items */}
            <div style={{background:C.navyPale,borderRadius:10,padding:".625rem .75rem",marginBottom:".5rem"}}>
              <div style={{fontSize:10,fontWeight:600,color:C.navy3,marginBottom:4,letterSpacing:".04em",textTransform:"uppercase"}}>คำนวณอัตโนมัติจากข้อมูลลูกค้า</div>
              {[
                {lbl:"ค่าลดหย่อนส่วนตัว",val:selfDeduct},
                ...(numChildren>0?[{lbl:`บุตร ${numChildren} คน`,val:childDeduct}]:[]),
              ].map(({lbl,val})=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.text2,padding:"2px 0"}}>
                  <span>{lbl}</span><span style={{fontWeight:600,color:C.navy}}>{fmt(val)} ฿</span>
                </div>
              ))}
            </div>
            {/* Manual */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid #F0EDE8"}}>
              <div style={{width:28,height:28,background:"#F4F8FD",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>💑</div>
              <div style={{flex:1,fontSize:13,color:C.navy,fontWeight:500}}>คู่สมรสไม่มีรายได้</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>upd("spouseDeduct",true)} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${tx.spouseDeduct?"#3B82F6":"#E5E7EB"}`,background:tx.spouseDeduct?"#3B82F6":"white",color:tx.spouseDeduct?"white":"#6B7280",fontSize:12,cursor:"pointer",fontFamily:"'Kanit',sans-serif",fontWeight:tx.spouseDeduct?600:400}}>มี</button>
                <button onClick={()=>upd("spouseDeduct",false)} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${!tx.spouseDeduct?"#E5E7EB":"#E5E7EB"}`,background:!tx.spouseDeduct?"#F9FAFB":"white",color:!tx.spouseDeduct?"#1A1A1A":"#6B7280",fontSize:12,cursor:"pointer",fontFamily:"'Kanit',sans-serif",fontWeight:!tx.spouseDeduct?600:400}}>ไม่มี</button>
              </div>
              <div style={{fontSize:11,color:C.text3,width:90,textAlign:"right",flexShrink:0}}>{tx.spouseDeduct?"60,000 ฿":"—"}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid #F0EDE8"}}>
              <div style={{width:28,height:28,background:"#F4F8FD",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>👴</div>
              <div style={{flex:1,fontSize:13,color:C.navy,fontWeight:500}}>พ่อแม่ที่เลี้ยงดู <span style={{fontSize:10,color:C.text3}}>(สูงสุด 4 คน)</span></div>
              <div style={{display:"flex",gap:4}}>
                {[0,1,2,3,4].map(n=>(
                  <button key={n} onClick={()=>upd("parentCount",n)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${(tx.parentCount||0)===n?"#3B82F6":"#E5E7EB"}`,background:(tx.parentCount||0)===n?"#3B82F6":"white",color:(tx.parentCount||0)===n?"white":"#6B7280",fontSize:13,cursor:"pointer",fontFamily:"'Kanit',sans-serif",fontWeight:600}}>{n}</button>
                ))}
              </div>
              <div style={{fontSize:11,color:C.text3,width:90,textAlign:"right",flexShrink:0}}>{parentDeduct>0?fmt(parentDeduct)+" ฿":"—"}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid #F0EDE8"}}>
              <div style={{width:28,height:28,background:"#F4F8FD",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>♿</div>
              <div style={{flex:1,fontSize:13,color:C.navy,fontWeight:500}}>อุปการะผู้พิการ/ทุพลภาพ</div>
              <div style={{display:"flex",gap:4}}>
                {[0,1,2,3].map(n=>(
                  <button key={n} onClick={()=>upd("disabledCount",n)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${(tx.disabledCount||0)===n?"#3B82F6":"#E5E7EB"}`,background:(tx.disabledCount||0)===n?"#3B82F6":"white",color:(tx.disabledCount||0)===n?"white":"#6B7280",fontSize:13,cursor:"pointer",fontFamily:"'Kanit',sans-serif",fontWeight:600}}>{n}</button>
                ))}
              </div>
              <div style={{fontSize:11,color:C.text3,width:90,textAlign:"right",flexShrink:0}}>{disabledDeduct>0?fmt(disabledDeduct)+" ฿":"—"}</div>
            </div>
            <TaxInput label="ค่าฝากครรภ์และคลอดบุตร" icon="🤱" value={tx.maternityExp||0} onChange={v=>upd("maternityExp",v)} max={60000} note="ตามจ่ายจริง สูงสุด 60,000 / ครรภ์"/>
            <div style={{display:"flex",justifyContent:"flex-end",paddingTop:6,marginTop:4}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy}}>รวมกลุ่มที่ 1: <span style={{color:C.navy3}}>{fmt(group1)} ฿</span></div>
            </div>
          </TaxSection>

          {/* Group 2 */}
          <TaxSection title="2. ค่าลดหย่อนประกัน เงินออม และการลงทุน" color={C.gold}>
            <TaxInput label="เงินประกันสังคม" icon="🏛" value={tx.sso||0} onChange={v=>upd("sso",v)} max={9000} note="ตามจ่ายจริง สูงสุด 9,000"/>
            <TaxInput label="เบี้ยประกันชีวิต / สะสมทรัพย์" icon="🛡" value={tx.lifeInsDeduct||0} onChange={v=>upd("lifeInsDeduct",v)} max={100000} note="คุ้มครอง 10 ปีขึ้นไป สูงสุด 100,000"/>
            <TaxInput label="เบี้ยประกันสุขภาพ" icon="🏥" value={tx.healthInsDeduct||0} onChange={v=>upd("healthInsDeduct",v)} max={25000} note="รวมกับชีวิตต้องไม่เกิน 100,000 / ลดหย่อนสูงสุด 25,000"/>
            <TaxInput label="เบี้ยประกันสุขภาพพ่อแม่" icon="👨‍⚕️" value={tx.parentHealthIns||0} onChange={v=>upd("parentHealthIns",v)} max={15000} note="สูงสุด 15,000"/>
            <div style={{height:"0.5px",background:C.border,margin:"4px 0 8px"}}/>
            <div style={{fontSize:10,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>กลุ่มเกษียณ (รวมกันไม่เกิน 500,000)</div>
            <TaxInput label="กองทุนรวม RMF" icon="📈" value={tx.rmf||0} onChange={v=>upd("rmf",v)} max={500000} note="30% ของรายได้ สูงสุด 500,000"/>
            <TaxInput label="กองทุน Thai ESG / ESGX" icon="🌿" value={tx.ssf||0} onChange={v=>upd("ssf",v)} max={300000} note="30% ของรายได้ สูงสุด 300,000"/>
            <TaxInput label="กองทุนสำรองเลี้ยงชีพ PVD / กบข." icon="🏦" value={tx.pvd||0} onChange={v=>upd("pvd",v)} max={500000} note="15-30% ของรายได้ สูงสุด 500,000"/>
            <TaxInput label="กองทุนการออมแห่งชาติ (กอช.)" icon="💼" value={tx.nsf||0} onChange={v=>upd("nsf",v)} max={30000} note="สูงสุด 30,000"/>
            <TaxInput label="ประกันชีวิตแบบบำนาญ" icon="🌅" value={tx.annuityIns||0} onChange={v=>upd("annuityIns",v)} max={200000} note="15% ของรายได้ สูงสุด 200,000"/>
            {(rmfD+pvdD+nsfD+annuityD)>retireCap&&<div style={{background:C.amberLight,borderRadius:8,padding:"6px 10px",fontSize:11,color:C.amber,marginTop:4}}>⚠️ กลุ่มเกษียณรวมเกิน 500,000 — ปรับเป็น 500,000 อัตโนมัติ</div>}
            <div style={{display:"flex",justifyContent:"flex-end",paddingTop:6,marginTop:4}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy}}>รวมกลุ่มที่ 2: <span style={{color:C.gold}}>{fmt(group2)} ฿</span></div>
            </div>
          </TaxSection>

          {/* Group 3 */}
          <TaxSection title="3. ค่าลดหย่อนกลุ่มเงินบริจาค" color={C.teal}>
            <TaxInput label="เงินบริจาคทั่วไป" icon="❤️" value={tx.donationGeneral||0} onChange={v=>upd("donationGeneral",v)} note="สูงสุด 10% ของเงินได้หลังหักลดหย่อน"/>
            <TaxInput label="บริจาคเพื่อการศึกษา/กีฬา/สาธารณะ" icon="🏫" value={tx.donationEdu||0} onChange={v=>upd("donationEdu",v)} note="ลดหย่อนได้ 2 เท่า สูงสุด 10%"/>
            <TaxInput label="บริจาคพรรคการเมือง" icon="🗳" value={tx.donationParty||0} onChange={v=>upd("donationParty",v)} max={10000} note="สูงสุด 10,000"/>
            <div style={{display:"flex",justifyContent:"flex-end",paddingTop:6,marginTop:4}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy}}>รวมกลุ่มที่ 3: <span style={{color:C.teal}}>{fmt(group3)} ฿</span></div>
            </div>
          </TaxSection>

          {/* Group 4 */}
          <TaxSection title="4. ค่าลดหย่อนกลุ่มกระตุ้นเศรษฐกิจ" color={C.coral}>
            <TaxInput label="Easy e-Receipt 2568" icon="🧾" value={tx.easyEReceipt||0} onChange={v=>upd("easyEReceipt",v)} max={50000} note="16 ม.ค. – 28 ก.พ. 2568 สูงสุด 50,000"/>
            <TaxInput label="ดอกเบี้ยกู้ซื้อ/สร้างที่อยู่อาศัย" icon="🏠" value={tx.homeLoanInterest||0} onChange={v=>upd("homeLoanInterest",v)} max={100000} note="สูงสุด 100,000"/>
            <TaxInput label="ค่าติดตั้งโซล่าร์เซลล์" icon="☀️" value={tx.solarCell||0} onChange={v=>upd("solarCell",v)} max={200000} note="สูงสุด 200,000"/>
            <TaxInput label="ค่าสร้างบ้านใหม่ ปี 2567-68" icon="🏗" value={tx.newHouse||0} onChange={v=>upd("newHouse",v)} max={100000} note="10,000 ต่อ 1 ล้าน สูงสุด 100,000"/>
            <div style={{display:"flex",justifyContent:"flex-end",paddingTop:6,marginTop:4}}>
              <div style={{fontSize:13,fontWeight:700,color:C.navy}}>รวมกลุ่มที่ 4: <span style={{color:C.coral}}>{fmt(group4)} ฿</span></div>
            </div>
          </TaxSection>

        </div>

        {/* Right panel: tax summary */}
        <div style={{display:"flex",flexDirection:"column",gap:".625rem",position:"sticky",top:0}}>
          {/* Tax bracket visual */}
          <div style={{background:"#1E2B2E",borderRadius:16,padding:"1rem",color:"white"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.4)",letterSpacing:".09em",textTransform:"uppercase",marginBottom:".625rem"}}>สรุปภาษีปี 2568</div>
            {[
              {lbl:"รายได้ทั้งปี",val:fmt(annualIncome)+" ฿",size:22},
              {lbl:"หักค่าใช้จ่าย (50%)",val:"-"+fmt(expenseDeduct)+" ฿",size:13,dim:true},
              {lbl:"ลดหย่อนรวม",val:"-"+fmt(totalDeduct)+" ฿",size:13,dim:true},
              {lbl:"เงินได้สุทธิ",val:fmt(taxableIncome)+" ฿",size:18,sep:true},
            ].map(({lbl,val,size,dim,sep})=>(
              <div key={lbl}>
                {sep&&<div style={{height:.5,background:"rgba(255,255,255,.1)",margin:".5rem 0"}}/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                  <span style={{fontSize:11,color:dim?"rgba(255,255,255,.35)":"rgba(255,255,255,.6)"}}>{lbl}</span>
                  <span style={{fontSize:size||13,fontWeight:600,color:dim?"rgba(255,255,255,.4)":"white"}}>{val}</span>
                </div>
              </div>
            ))}
            <div style={{height:.5,background:"rgba(255,255,255,.1)",margin:".5rem 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>ภาษีก่อนลดหย่อน</span>
              <span style={{fontSize:15,fontWeight:600,color:"#F87171"}}>{fmt(taxWithout)} ฿</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>ภาษีหลังลดหย่อน</span>
              <span style={{fontSize:15,fontWeight:600,color:"white"}}>{fmt(taxWithDeduct)} ฿</span>
            </div>
            <div style={{height:.5,background:"rgba(255,255,255,.1)",margin:".5rem 0"}}/>
            <div style={{background:"rgba(94,201,165,0.15)",borderRadius:10,padding:".625rem .75rem"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.5)",marginBottom:3}}>ประหยัดภาษีได้</div>
              <div style={{fontSize:28,fontWeight:700,color:"#5EC9A5",lineHeight:1}}>{fmt(taxSaved)}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>บาท / ปี</div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{background:"white",borderRadius:16,padding:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:".625rem"}}>สัดส่วนลดหย่อน</div>
            {[
              {lbl:"ส่วนตัว/ครอบครัว",val:group1,col:C.navy3},
              {lbl:"ประกัน/ออม/ลงทุน",val:group2,col:C.gold},
              {lbl:"บริจาค",val:group3,col:C.teal},
              {lbl:"กระตุ้นเศรษฐกิจ",val:group4,col:C.coral},
            ].map(({lbl,val,col})=>{
              const w=totalDeduct>0?Math.round(val/totalDeduct*100):0;
              return (
                <div key={lbl} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.text2,marginBottom:2}}>
                    <span>{lbl}</span><span style={{fontWeight:600,color:col}}>{fmt(val)} ฿</span>
                  </div>
                  <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:w+"%",background:col,borderRadius:3,transition:"width .4s ease"}}/>
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:8,paddingTop:8,borderTop:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700}}>
              <span style={{color:C.text3}}>รวมทั้งหมด</span>
              <span style={{color:C.navy}}>{fmt(totalDeduct)} ฿ <span style={{fontSize:10,fontWeight:400,color:C.text3}}>({pct}%)</span></span>
            </div>
          </div>

          {/* Tax bracket reference */}
          <div style={{background:"white",borderRadius:16,padding:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:".625rem"}}>อัตราภาษี 2568</div>
            {[
              {r:"0-150K","rate":"ยกเว้น"},
              {r:"150K-300K","rate":"5%"},
              {r:"300K-500K","rate":"10%"},
              {r:"500K-750K","rate":"15%"},
              {r:"750K-1M","rate":"20%"},
              {r:"1M-2M","rate":"25%"},
              {r:"2M-5M","rate":"30%"},
              {r:"5M+","rate":"35%"},
            ].map(({r,rate})=>{
              const isHere=taxableIncome>0&&(
                (r==="0-150K"&&taxableIncome<=150000)||
                (r==="150K-300K"&&taxableIncome>150000&&taxableIncome<=300000)||
                (r==="300K-500K"&&taxableIncome>300000&&taxableIncome<=500000)||
                (r==="500K-750K"&&taxableIncome>500000&&taxableIncome<=750000)||
                (r==="750K-1M"&&taxableIncome>750000&&taxableIncome<=1000000)||
                (r==="1M-2M"&&taxableIncome>1000000&&taxableIncome<=2000000)||
                (r==="2M-5M"&&taxableIncome>2000000&&taxableIncome<=5000000)||
                (r==="5M+"&&taxableIncome>5000000)
              );
              return (
                <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 6px",borderRadius:6,background:isHere?"#EBF2FB":"transparent",marginBottom:1}}>
                  <span style={{fontSize:11,color:isHere?C.navy:C.text3}}>{r}</span>
                  <span style={{fontSize:11,fontWeight:isHere?700:400,color:isHere?C.navy3:C.text3}}>{rate}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
function Panel10(){return null;}

