import { useState, useCallback } from "react";

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const cnRequests = [
  { id:"CN-REQ-4253", customer:"Sports World LLC", custId:"CUST-99281", invoice:"INV-2024-001", reason:"Mixed", amount:610, status:"NEW", assigned:"Sarah K.", sla:"2d left", slaDanger:false },
  { id:"CN-REQ-4251", customer:"AlSports Trading", custId:"CUST-88120", invoice:"INV-2024-050", reason:"Shortage", amount:1200, status:"OPS REVIEW", assigned:"Ahmed M.", sla:"1d left", slaDanger:false },
  { id:"CN-REQ-4248", customer:"Gulf Sports Co", custId:"CUST-77341", invoice:"INV-2024-033", reason:"Defect", amount:3450, status:"FINANCE REVIEW", assigned:"Layla H.", sla:"OVERDUE", slaDanger:true },
  { id:"CN-REQ-4245", customer:"Emirates Athletic", custId:"CUST-66210", invoice:"INV-2024-021", reason:"Price Correction", amount:890, status:"APPROVED", assigned:"Sarah K.", sla:"Done", slaDanger:false },
  { id:"CN-REQ-4240", customer:"Dubai Runners LLC", custId:"CUST-55190", invoice:"INV-2024-015", reason:"Excess", amount:2100, status:"REJECTED", assigned:"Ahmed M.", sla:"Done", slaDanger:false },
  { id:"CN-REQ-4238", customer:"Fitness Hub LLC", custId:"CUST-44880", invoice:"INV-2023-999", reason:"Shortage", amount:450, status:"OPS REVIEW", assigned:"Omar S.", sla:"3d left", slaDanger:false },
  { id:"CN-REQ-4235", customer:"Sport Zone FZCO", custId:"CUST-33720", invoice:"INV-2023-988", reason:"Margin Support", amount:5000, status:"FINANCE REVIEW", assigned:"Layla H.", sla:"OVERDUE", slaDanger:true },
  { id:"CN-REQ-4231", customer:"Active Life Group", custId:"CUST-22610", invoice:"INV-2023-975", reason:"Defect", amount:720, status:"RETURNED", assigned:"Sarah K.", sla:"Waiting", slaDanger:false },
];

const customers = [
  { id:"CUST-99281", name:"Sports World LLC", type:"Direct", limit:250000, used:68, terms:"30 Days", status:"Active" },
  { id:"CUST-88120", name:"AlSports Trading", type:"Distributor", limit:500000, used:82, terms:"45 Days", status:"Active" },
  { id:"CUST-77341", name:"Gulf Sports Co", type:"Retailer", limit:180000, used:45, terms:"30 Days", status:"Active" },
  { id:"CUST-66210", name:"Emirates Athletic", type:"Retailer", limit:120000, used:91, terms:"60 Days", status:"On Hold" },
  { id:"CUST-55190", name:"Dubai Runners LLC", type:"Online", limit:90000, used:30, terms:"30 Days", status:"Active" },
  { id:"CUST-44880", name:"Fitness Hub LLC", type:"Direct", limit:200000, used:55, terms:"45 Days", status:"Suspended" },
];

const custRequests = [
  { id:"CR-REQ-0089", name:"Gulf Sports Co", type:"New Account", limit:200000, by:"Tariq A.", status:"PENDING FINANCE" },
  { id:"CR-REQ-0087", name:"AlNasr Sports", type:"New Account", limit:150000, by:"Reem N.", status:"APPROVED" },
  { id:"CR-REQ-0085", name:"Sports World LLC", type:"Edit Facility", limit:300000, by:"Tariq A.", status:"FINANCE REVIEW" },
  { id:"CR-REQ-0082", name:"Fitness Hub LLC", type:"Edit Facility", limit:200000, by:"Mona K.", status:"PENDING" },
  { id:"CR-REQ-0079", name:"Desert Run LLC", type:"New Account", limit:80000, by:"Reem N.", status:"REJECTED" },
];

const pieData = [
  { label:"Shortage", pct:38, color:"#C8102E" },
  { label:"Defect", pct:22, color:"#F59E0B" },
  { label:"Price Correction", pct:18, color:"#3B82F6" },
  { label:"Excess", pct:14, color:"#8B5CF6" },
  { label:"Other", pct:8, color:"#6B7280" },
];

const barData = [
  { month:"Sep", val:82 }, { month:"Oct", val:95 }, { month:"Nov", val:71 },
  { month:"Dec", val:130 }, { month:"Jan", val:112 }, { month:"Feb", val:148 },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
const statusColor = {
  "NEW":"bg-gray-100 text-gray-700",
  "OPS REVIEW":"bg-amber-100 text-amber-800",
  "FINANCE REVIEW":"bg-blue-100 text-blue-800",
  "APPROVED":"bg-green-100 text-green-800",
  "REJECTED":"bg-red-100 text-red-800",
  "RETURNED":"bg-purple-100 text-purple-800",
  "POSTED":"bg-emerald-100 text-emerald-800",
  "PENDING FINANCE":"bg-amber-100 text-amber-800",
  "PENDING":"bg-gray-100 text-gray-700",
  "Active":"bg-green-100 text-green-800",
  "On Hold":"bg-amber-100 text-amber-800",
  "Suspended":"bg-red-100 text-red-800",
};

const reasonColor = {
  "Shortage":"bg-red-50 text-red-700 border border-red-200",
  "Defect":"bg-orange-50 text-orange-700 border border-orange-200",
  "Price Correction":"bg-blue-50 text-blue-700 border border-blue-200",
  "Excess":"bg-purple-50 text-purple-700 border border-purple-200",
  "Mixed":"bg-gray-50 text-gray-700 border border-gray-200",
  "Margin Support":"bg-teal-50 text-teal-700 border border-teal-200",
};

function Badge({ text, extra="" }) {
  const cls = statusColor[text] || "bg-gray-100 text-gray-600";
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls} ${extra}`}>{text}</span>;
}

function ReasonBadge({ text }) {
  const cls = reasonColor[text] || "bg-gray-50 text-gray-700 border border-gray-200";
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${cls}`}>{text}</span>;
}

// ── SVG DONUT CHART ───────────────────────────────────────────────────────────
function DonutChart() {
  const r = 60, cx = 80, cy = 80, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="22"/>
        {pieData.map((d, i) => {
          const dash = (d.pct / 100) * circ;
          const gap = circ - dash;
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth="22"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              style={{ transform:"rotate(-90deg)", transformOrigin:"50% 50%" }}/>
          );
          offset += dash;
          return seg;
        })}
        <text x={cx} y={cy-6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1A2340">47</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="10" fill="#6b7280">Total CNs</text>
      </svg>
      <div className="space-y-1.5">
        {pieData.map(d => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background:d.color }}/>
            <span className="text-gray-600 w-28">{d.label}</span>
            <span className="font-semibold text-gray-800">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BAR CHART ─────────────────────────────────────────────────────────────────
function BarChart() {
  const max = Math.max(...barData.map(d => d.val));
  return (
    <div className="flex items-end gap-3 h-36 pt-4">
      {barData.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-gray-700">${d.val}K</span>
          <div className="w-full rounded-t-md" style={{ height:`${(d.val/max)*100}%`, background:"#C8102E", minHeight:8 }}/>
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ── STEP WIZARD (New Customer Request) ───────────────────────────────────────
const STEPS = ["Company Info","Contacts","Credit Terms","Discounts & Rebates","Shipping","Attachments","Review"];

function StepWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [discounts, setDiscounts] = useState([{ cat:"Running", pct:5 }]);
  const [rebates, setRebates] = useState([{ type:"Volume Rebate", basis:"% of Quarterly Sales", rate:3 }]);
  const [vatYes, setVatYes] = useState(true);
  const [childYes, setChildYes] = useState(false);
  const [shippingDiff, setShippingDiff] = useState(false);
  const [docs, setDocs] = useState({ vat:false, trade:true, id:false, contract:false });
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addDiscount = () => setDiscounts([...discounts, { cat:"Lifestyle", pct:0 }]);
  const addRebate = () => setRebates([...rebates, { type:"Promotional Rebate", basis:"% of Monthly Sales", rate:0 }]);

  const uploadedCount = Object.values(docs).filter(Boolean).length;

  if (submitted) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
        <p className="text-gray-500 mb-2">Reference: <span className="font-bold text-gray-800">CR-REQ-0090</span></p>
        <p className="text-gray-500 text-sm mb-6">The Finance team has been notified and will review within 2 business days.</p>
        <button onClick={onClose} className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold hover:bg-red-700">Close</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Credit Account Request</h2>
            <p className="text-sm text-gray-500 mt-0.5">Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        {/* Progress */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-red-600" : "bg-gray-200"}`}/>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs ${i === step ? "text-red-600 font-semibold" : "text-gray-400"}`}>{s}</span>
            ))}
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Customer Full Legal Name *</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Gulf Sports Co LLC"/></div>
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Trading Name</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Brand or trading name"/></div>
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Customer Type *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>Direct Customer</option><option>Distributor</option><option>Retailer</option><option>Online Reseller</option><option>Government</option>
                  </select>
                </div>
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Trade License Number *</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. DED-2024-001234"/></div>
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Legal Address Line 1 *</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Street address"/></div>
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Emirate *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option><option>RAK</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Is VAT Registered?</label>
                <div className="flex gap-3">
                  <button onClick={() => setVatYes(true)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${vatYes ? "border-red-600 bg-red-50 text-red-700" : "border-gray-300 text-gray-600"}`}>Yes</button>
                  <button onClick={() => setVatYes(false)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${!vatYes ? "border-red-600 bg-red-50 text-red-700" : "border-gray-300 text-gray-600"}`}>No</button>
                </div>
              </div>
              {vatYes && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div><label className="text-xs font-semibold text-blue-800 block mb-1">TRN Number *</label><input className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm bg-white" placeholder="15-digit UAE TRN"/></div>
                  <div><label className="text-xs font-semibold text-blue-800 block mb-1">VAT Registration Date</label><input type="date" className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm bg-white"/></div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Create Child Accounts?</label>
                <div className="flex gap-3 mb-3">
                  <button onClick={() => setChildYes(true)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${childYes ? "border-red-600 bg-red-50 text-red-700" : "border-gray-300 text-gray-600"}`}>Yes</button>
                  <button onClick={() => setChildYes(false)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${!childYes ? "border-red-600 bg-red-50 text-red-700" : "border-gray-300 text-gray-600"}`}>No</button>
                </div>
                {childYes && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex gap-2"><input className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Child account name"/><input className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Relationship (e.g. Branch)"/><button className="text-red-500 text-lg px-1">×</button></div>
                    <button className="text-xs text-red-600 font-semibold hover:underline">+ Add Child Account</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {["Operations Contact","Finance / Accounts Contact"].map(section => (
                <div key={section} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">{section}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1">Full Name *</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/></div>
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1">Job Title</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/></div>
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1">Email Address *</label><input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/></div>
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1">Phone Number *</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="+971 XX XXX XXXX"/></div>
                  </div>
                </div>
              ))}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-amber-50">
                <h3 className="font-semibold text-amber-900 text-sm border-b border-amber-200 pb-2">Authorised Signatory</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-amber-800 block mb-1">Full Name *</label><input className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white"/></div>
                  <div><label className="text-xs font-semibold text-amber-800 block mb-1">Nationality</label><input className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white"/></div>
                  <div><label className="text-xs font-semibold text-amber-800 block mb-1">ID/Passport Number *</label><input className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white"/></div>
                  <div><label className="text-xs font-semibold text-amber-800 block mb-1">Expiry Date *</label><input type="date" className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white"/></div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Credit Limit Requested *</label><div className="flex"><span className="border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-sm bg-gray-50 text-gray-600">USD</span><input className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-sm" placeholder="0.00"/></div></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Payment Terms *</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>30 Days Net</option><option>45 Days Net</option><option>60 Days Net</option><option>90 Days Net</option><option>Cash in Advance</option><option>Letter of Credit</option></select></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Avg. Monthly Sales (Estimated)</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="USD 0.00"/></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Avg. Monthly Sales (Actual — last 3 mo.)</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="USD 0.00"/></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Annual Sales Target</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="USD 0.00"/></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Credit Currency</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>USD</option><option>AED</option><option>EUR</option><option>GBP</option></select></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Bank Name</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Emirates NBD"/></div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Bank IBAN</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="AE XX XXXX XXXX XXXX XXXX XX"/></div>
              <div className="col-span-2"><label className="text-xs font-semibold text-gray-600 block mb-1">Special Pricing Agreement Notes</label><textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Any special pricing or contract terms..."/></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* Discounts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Category Discounts</h3>
                  <button onClick={addDiscount} className="text-xs text-red-600 font-semibold border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50">+ Add Category</button>
                </div>
                <div className="space-y-2">
                  {discounts.map((d, i) => (
                    <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <select value={d.cat} onChange={e => { const nd=[...discounts]; nd[i].cat=e.target.value; setDiscounts(nd); }} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                        {["Running","Training","Lifestyle","Basketball","Kids","All Categories","Accessories","Apparel","Footwear"].map(c => <option key={c}>{c}</option>)}
                      </select>
                      <div className="flex border border-gray-300 rounded overflow-hidden">
                        <input type="number" value={d.pct} onChange={e => { const nd=[...discounts]; nd[i].pct=e.target.value; setDiscounts(nd); }} className="w-16 px-2 py-1.5 text-sm text-center focus:outline-none"/>
                        <span className="bg-gray-100 px-2 py-1.5 text-sm text-gray-600">%</span>
                      </div>
                      <button onClick={() => setDiscounts(discounts.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 font-bold px-1">×</button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Rebates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Rebates & Markdown Agreements</h3>
                  <button onClick={addRebate} className="text-xs text-red-600 font-semibold border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50">+ Add Rebate</button>
                </div>
                <div className="space-y-2">
                  {rebates.map((r, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex gap-2">
                        <select value={r.type} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                          {["Volume Rebate","Promotional Rebate","Markdown","Co-op Marketing","Sell-Through Support","Seasonal Discount","Other"].map(t=><option key={t}>{t}</option>)}
                        </select>
                        <select value={r.basis} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                          {["% of Monthly Sales","% of Quarterly Sales","% of Annual Sales","Fixed Amount","Per Unit"].map(b=><option key={b}>{b}</option>)}
                        </select>
                        <div className="flex border border-gray-300 rounded overflow-hidden">
                          <input type="number" value={r.rate} className="w-14 px-2 py-1.5 text-sm text-center focus:outline-none bg-white"/>
                          <span className="bg-gray-100 px-2 py-1.5 text-sm text-gray-600">%</span>
                        </div>
                        <button onClick={() => setRebates(rebates.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 font-bold px-1">×</button>
                      </div>
                      <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white" placeholder="Threshold / notes (e.g. Min $50,000 quarterly purchase)"/>
                    </div>
                  ))}
                </div>
              </div>
              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-800 font-semibold">📊 Summary Preview</p>
                <p className="text-sm text-blue-700 mt-1">
                  {discounts.length} discount categories (avg {Math.round(discounts.reduce((s,d)=>s+Number(d.pct),0)/discounts.length)}%) across {rebates.length} rebate programme{rebates.length!==1?"s":""}.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Is shipping address same as legal address?</label>
                <div className="flex gap-3 mb-3">
                  <button onClick={() => setShippingDiff(false)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${!shippingDiff?"border-red-600 bg-red-50 text-red-700":"border-gray-300 text-gray-600"}`}>Yes</button>
                  <button onClick={() => setShippingDiff(true)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${shippingDiff?"border-red-600 bg-red-50 text-red-700":"border-gray-300 text-gray-600"}`}>No — Add Different Address</button>
                </div>
                {shippingDiff && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-semibold text-gray-500 block mb-1">Address Nickname</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" placeholder='e.g. "Dubai Warehouse"'/></div>
                      <div><label className="text-xs font-semibold text-gray-500 block mb-1">Contact Person</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"/></div>
                      <div className="col-span-2"><label className="text-xs font-semibold text-gray-500 block mb-1">Address Line 1</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"/></div>
                    </div>
                    <button className="text-xs text-red-600 font-semibold hover:underline">+ Add Another Delivery Address</button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Preferred Incoterm *</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>EXW — Ex Works</option>
                  <option>FCA — Free Carrier</option>
                  <option>FOB — Free on Board</option>
                  <option>CFR — Cost and Freight</option>
                  <option>CIF — Cost, Insurance and Freight</option>
                  <option>DAP — Delivered at Place</option>
                  <option>DDP — Delivered Duty Paid</option>
                  <option>CPT — Carriage Paid To</option>
                  <option>CIP — Carriage and Insurance Paid To</option>
                </select>
                <p className="text-xs text-gray-500 mt-1 italic">FOB: Seller delivers goods on board the vessel nominated by the buyer at the named port.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Preferred Carrier</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. DHL, Aramex"/></div>
                <div><label className="text-xs font-semibold text-gray-600 block mb-1">Port of Loading</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Jebel Ali Port"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 block mb-1">Special Handling Requirements</label><textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Temperature sensitive, fragile, oversized, etc."/></div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className={`text-xs font-semibold px-3 py-2 rounded-lg mb-4 ${uploadedCount === 4 ? "bg-green-50 text-green-800 border border-green-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                {uploadedCount === 4 ? "✅ All required documents uploaded." : `⚠️ ${uploadedCount} of 4 required documents uploaded. Please upload all before submitting.`}
                <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full"><div className={`h-1.5 rounded-full ${uploadedCount === 4 ? "bg-green-500" : "bg-amber-500"}`} style={{ width:`${(uploadedCount/4)*100}%` }}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key:"vat", label:"VAT Certificate", note:"Required if VAT registered", accept:"PDF, JPG, PNG" },
                  { key:"trade", label:"Trade License", note:"Mandatory", accept:"PDF, JPG, PNG" },
                  { key:"id", label:"ID / Passport of Authorised Signatory", note:"Mandatory", accept:"PDF, JPG, PNG" },
                  { key:"contract", label:"Signed Contract Copy", note:"Mandatory", accept:"PDF, DOCX" },
                ].map(doc => (
                  <div key={doc.key} onClick={() => setDocs({...docs, [doc.key]:!docs[doc.key]})}
                    className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${docs[doc.key] ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50"}`}>
                    <div className="text-3xl mb-2">{docs[doc.key] ? "✅" : "📄"}</div>
                    <p className="font-semibold text-gray-800 text-sm">{doc.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{doc.note}</p>
                    <p className="text-xs text-gray-400 mt-1">{doc.accept}</p>
                    {docs[doc.key] && <p className="text-xs text-green-700 font-medium mt-2">document_uploaded.pdf ✓</p>}
                    {!docs[doc.key] && <p className="text-xs text-red-500 mt-2">Click to simulate upload</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="font-semibold text-green-800">Ready to Submit for Finance Approval</p>
                <p className="text-sm text-green-700 mt-1">A notification will be sent to the Finance Manager immediately.</p>
              </div>
              {[["Company Information",["Customer Legal Name: Gulf Sports Co LLC","Type: Retailer","TRN: 100312345600003","Emirate: Dubai"]],
                ["Contact Details",["Ops Contact: Mohammed Al Farsi — ops@gulfsports.ae","Finance Contact: Fatima Nasser — finance@gulfsports.ae","Signatory: Ahmed Rashid (UAE National)"]],
                ["Credit Terms",["Credit Limit: USD 200,000","Payment Terms: 30 Days Net","Avg Monthly Sales: USD 18,000"]],
                ["Discounts & Rebates",[`${discounts.length} discount categories | ${rebates.length} rebate programmes`]],
                ["Attachments",[`${uploadedCount} of 4 documents uploaded`]],
              ].map(([title, items]) => (
                <div key={title} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-semibold text-sm text-gray-700">{title}</div>
                  <div className="px-4 py-3 space-y-1">
                    {items.map(item => <p key={item} className="text-sm text-gray-600">• {item}</p>)}
                  </div>
                </div>
              ))}
              <label className="flex items-start gap-2 cursor-pointer mt-4">
                <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-0.5 accent-red-600"/>
                <span className="text-sm text-gray-700">I confirm all information provided is accurate and complete, and I am authorised to submit this request on behalf of my organisation.</span>
              </label>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center p-5 border-t bg-gray-50">
          <button onClick={() => step > 0 ? setStep(step-1) : onClose()} className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">{step === 0 ? "Cancel" : "← Back"}</button>
          {step < STEPS.length - 1
            ? <button onClick={() => setStep(step+1)} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Continue →</button>
            : <button onClick={() => confirmed && setSubmitted(true)} disabled={!confirmed} className={`px-6 py-2 rounded-xl text-sm font-semibold text-white ${confirmed ? "bg-red-600 hover:bg-red-700" : "bg-gray-300 cursor-not-allowed"}`}>Submit for Finance Approval</button>
          }
        </div>
      </div>
    </div>
  );
}

// ── SLIDE-OVER PANEL ─────────────────────────────────────────────────────────
function SlideOver({ req, onClose }) {
  const [tab, setTab] = useState("overview");
  const [comment, setComment] = useState("");
  const [shareWithCustomer, setShareWithCustomer] = useState(false);
  const [comments, setComments] = useState([
    { author:"Sarah K.", role:"Ops", time:"10 Feb 14:22", text:"Verified shortage against delivery note. Qty confirmed.", visible:true },
    { author:"Ahmed M.", role:"Finance", time:"11 Feb 09:15", text:"Pending Finance Manager final sign-off.", visible:false },
  ]);

  const postComment = () => {
    if (!comment.trim()) return;
    setComments([...comments, { author:"You", role:"Finance Manager", time:"Now", text:comment, visible:shareWithCustomer }]);
    setComment("");
  };

  const tabs = ["Overview","Line Items","Attachments","Comments","Audit Log"];

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={onClose}/>
      <div className="w-[580px] bg-white shadow-2xl flex flex-col h-full">
        {/* Panel Header */}
        <div className="p-5 border-b flex items-start justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{req.id}</span>
              <Badge text={req.status}/>
            </div>
            <p className="text-sm text-gray-600">{req.customer} · {req.custId}</p>
            <p className="text-xs text-gray-400 mt-0.5">Submitted: {req.invoice} · Assigned: {req.assigned}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        {/* Tabs */}
        <div className="flex border-b px-4 bg-white">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase().replace(" ",""))} className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${tab===t.toLowerCase().replace(" ","") ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{t}</button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[["Invoice Ref", req.invoice], ["Reason", req.reason], ["Submitted", "10 Feb 2026"], ["SLA", req.sla]].map(([k,v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{k}</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-xs text-red-700">Total Claim Value</p>
                <p className="text-3xl font-bold text-red-700">${req.amount.toLocaleString()}.00</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Internal Notes</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Add internal notes (not visible to customer)..."/>
              </div>
            </div>
          )}
          {tab === "lineitems" && (
            <div>
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-800 text-white">
                  {["SKU","Product","Reason","Claim Qty","Unit $","Credit","Approved Qty"].map(h=><th key={h} className="px-2 py-2 text-left font-semibold">{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    ["NB-574-GRY-09","574 Core Grey Sz9","Shortage","4","$85","$340",""],
                    ["NB-327-BLU-10","327 Retro Blue Sz10","Excess","3","$90","$270",""],
                    ["NB-990-BLK-11","990v6 Black Sz11","Defect","1","$199","$199",""],
                  ].map((row, i) => (
                    <tr key={i} className={i%2===0?"bg-white":"bg-gray-50"}>
                      {row.map((cell,j) => j===6
                        ? <td key={j} className="px-2 py-2"><input type="number" className="w-14 border border-gray-300 rounded px-1 py-0.5 text-xs text-center" placeholder="Qty"/></td>
                        : <td key={j} className="px-2 py-2 text-gray-700">{cell}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-right text-sm font-bold text-red-700">Total Approved Credit: $0.00</div>
            </div>
          )}
          {tab === "attachments" && (
            <div className="space-y-3">
              {[["Delivery Note — INV-2024-001.pdf","PDF","124 KB","Customer","10 Feb"],["Defect Photo 1.jpg","Image","2.1 MB","Customer","10 Feb"],["Shortage Evidence.xlsx","Excel","48 KB","Operations","11 Feb"]].map(([name,type,size,by,date])=>(
                <div key={name} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-lg">{type==="Image"?"🖼️":type==="Excel"?"📊":"📄"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-500">{size} · Uploaded by {by} · {date} Feb</p>
                  </div>
                  <button className="text-xs text-red-600 font-semibold hover:underline">Download</button>
                </div>
              ))}
            </div>
          )}
          {tab === "comments" && (
            <div className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                {comments.map((c,i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.author[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-800">{c.author}</span>
                        <span className="text-xs text-gray-400">{c.role}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{c.time}</span>
                        {c.visible && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Visible to Customer</span>}
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <textarea rows={2} value={comment} onChange={e=>setComment(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Add a comment..."/>
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" checked={shareWithCustomer} onChange={e=>setShareWithCustomer(e.target.checked)} className="accent-blue-600"/>Share with Customer
                  </label>
                  <button onClick={postComment} className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-700">Post Comment</button>
                </div>
              </div>
            </div>
          )}
          {tab === "auditlog" && (
            <div className="space-y-3">
              {[["11 Feb 09:15","Ahmed M.","Status → FINANCE REVIEW"],["10 Feb 16:40","Sarah K.","Status → OPS REVIEW"],["10 Feb 14:22","Sarah K.","Comment added"],["10 Feb 12:00","System","Request received — Status: NEW"],].map(([time,user,action])=>(
                <div key={action} className="flex gap-3 items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>
                  <div>
                    <p className="text-xs text-gray-400">{time} · {user}</p>
                    <p className="text-sm text-gray-700">{action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Action Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-2">
          <button className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">✅ Approve</button>
          <button className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600">↩ Return</button>
          <button className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">✕ Reject</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [cnFilter, setCnFilter] = useState("All");
  const [selectedReq, setSelectedReq] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [role, setRole] = useState("Finance Manager");
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = [
    { key:"dashboard", icon:"📊", label:"Dashboard" },
    { key:"cn", icon:"📋", label:"CN Requests" },
    { key:"customers", icon:"🏢", label:"Customer Requests" },
    { key:"master", icon:"👥", label:"Customer Master" },
  ];

  const cnFilters = ["All","NEW","OPS REVIEW","FINANCE REVIEW","APPROVED","REJECTED","RETURNED"];
  const filteredCN = cnFilter === "All" ? cnRequests : cnRequests.filter(r => r.status === cnFilter);

  const notifs = [
    { icon:"🔴", text:"CN-REQ-4248 requires Finance Review", time:"5 min ago" },
    { icon:"🟡", text:"CN-REQ-4253 submitted by Sports World LLC", time:"1 hr ago" },
    { icon:"🟢", text:"Customer CR-REQ-0087 approved", time:"2 hr ago" },
    { icon:"🔵", text:"SLA reminder: CN-REQ-4235 overdue", time:"3 hr ago" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 bg-[#1A2340] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#C8102E] rounded-lg flex items-center justify-center font-extrabold text-white text-sm">NB</div>
            <div><p className="text-white font-bold text-xs leading-tight">Credit Control</p><p className="text-white/50 text-xs">Portal</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(n => (
            <button key={n.key} onClick={() => setPage(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${page===n.key ? "bg-red-600/20 text-white border-l-4 border-red-600 pl-2" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
              <span>{n.icon}</span><span className="font-medium">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">FM</div>
            <div className="flex-1 min-w-0"><p className="text-white text-xs font-semibold truncate">Layla Hassan</p><p className="text-white/40 text-xs truncate">{role}</p></div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-900">
            {page==="dashboard"?"Dashboard":page==="cn"?"CN Requests":page==="customers"?"Customer Requests":"Customer Master"}
          </h1>
          <div className="flex items-center gap-3">
            <select value={role} onChange={e=>setRole(e.target.value)} className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-600">
              <option>Finance Manager</option><option>Operations Staff</option><option>Sales Representative</option><option>Finance Analyst</option>
            </select>
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg hover:bg-gray-100">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-30 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <span className="font-semibold text-sm text-gray-800">Notifications</span>
                    <button className="text-xs text-red-600 font-medium">Mark all read</button>
                  </div>
                  {notifs.map((n,i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer">
                      <span className="text-lg mt-0.5">{n.icon}</span>
                      <div><p className="text-xs text-gray-800">{n.text}</p><p className="text-xs text-gray-400 mt-0.5">{n.time}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-8 h-8 bg-[#1A2340] rounded-full flex items-center justify-center text-white text-xs font-bold">LH</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── DASHBOARD ── */}
          {page === "dashboard" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label:"CNs Posted (Month)", val:"47", color:"border-green-500", icon:"✅", sub:"+8 vs last month" },
                  { label:"CNs Pending Approval", val:"12", color:"border-amber-500", icon:"⏳", sub:"3 overdue SLA" },
                  { label:"Customer Requests Pending", val:"8", color:"border-blue-500", icon:"🏢", sub:"2 new today" },
                  { label:"Approved Customers", val:"234", color:"border-green-500", icon:"👥", sub:"6 new this month" },
                  { label:"CN Value Posted (Month)", val:"$148.5K", color:"border-red-500", icon:"💰", sub:"+12% vs last month" },
                ].map(card => (
                  <div key={card.label} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${card.color}`}>
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <p className="text-2xl font-extrabold text-gray-900">{card.val}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{card.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>
              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-5">CN Requests by Reason Code</h3>
                  <DonutChart/>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-2">CN Posted Value — Last 6 Months</h3>
                  <p className="text-xs text-gray-400 mb-4">USD (thousands)</p>
                  <BarChart/>
                </div>
              </div>
              {/* Bottom Tables */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Pending CN Approvals</h3>
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-500 border-b">{["ID","Customer","Amount","Status",""].map(h=><th key={h} className="pb-2 text-left font-semibold">{h}</th>)}</tr></thead>
                    <tbody>
                      {cnRequests.slice(0,5).map(r=>(
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-2 text-blue-600 font-semibold">{r.id}</td>
                          <td className="py-2 text-gray-700 truncate max-w-[80px]">{r.customer}</td>
                          <td className="py-2 font-semibold text-gray-800">${r.amount.toLocaleString()}</td>
                          <td className="py-2"><Badge text={r.status}/></td>
                          <td className="py-2"><button onClick={()=>{setPage("cn");setSelectedReq(r);}} className="text-xs text-red-600 font-semibold border border-red-300 px-2 py-0.5 rounded-md hover:bg-red-50">Review</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Recent Customer Requests</h3>
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-500 border-b">{["ID","Customer","Type","Status",""].map(h=><th key={h} className="pb-2 text-left font-semibold">{h}</th>)}</tr></thead>
                    <tbody>
                      {custRequests.map(r=>(
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-2 text-blue-600 font-semibold">{r.id}</td>
                          <td className="py-2 text-gray-700 truncate max-w-[80px]">{r.name}</td>
                          <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded font-medium ${r.type==="New Account"?"bg-blue-50 text-blue-700":"bg-amber-50 text-amber-700"}`}>{r.type}</span></td>
                          <td className="py-2"><Badge text={r.status}/></td>
                          <td className="py-2"><button onClick={()=>setPage("customers")} className="text-xs text-red-600 font-semibold border border-red-300 px-2 py-0.5 rounded-md hover:bg-red-50">View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CN REQUESTS ── */}
          {page === "cn" && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-2 flex-wrap">
                {cnFilters.map(f => (
                  <button key={f} onClick={() => setCnFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${cnFilter===f ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {f} {f==="All" ? `(${cnRequests.length})` : `(${cnRequests.filter(r=>r.status===f).length})`}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  <input className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Search requests..."/>
                  <button className="bg-green-600 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-green-700">Export</button>
                </div>
              </div>
              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1A2340] text-white">
                      {["Request ID","Customer","Invoice","Reason","Amount","Status","Assigned","SLA","Actions"].map(h=>(
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCN.map((r,i) => (
                      <tr key={r.id} className={`border-b hover:bg-gray-50 transition-colors ${i%2===0?"bg-white":"bg-gray-50/50"}`}>
                        <td className="px-4 py-3"><button onClick={()=>setSelectedReq(r)} className="text-blue-600 font-bold hover:underline">{r.id}</button></td>
                        <td className="px-4 py-3"><div className="font-semibold text-gray-800">{r.customer}</div><div className="text-gray-400">{r.custId}</div></td>
                        <td className="px-4 py-3 text-gray-600">{r.invoice}</td>
                        <td className="px-4 py-3"><ReasonBadge text={r.reason}/></td>
                        <td className="px-4 py-3 font-bold text-gray-800">${r.amount.toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge text={r.status}/></td>
                        <td className="px-4 py-3 text-gray-600">{r.assigned}</td>
                        <td className="px-4 py-3"><span className={`font-semibold ${r.slaDanger?"text-red-600":"text-green-700"}`}>{r.sla}</span></td>
                        <td className="px-4 py-3">
                          <button onClick={()=>setSelectedReq(r)} className="text-xs text-red-600 font-semibold border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50">Review</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCN.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="font-semibold">No requests match this filter</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CUSTOMER REQUESTS ── */}
          {page === "customers" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  {["All","Pending","Finance Review","Approved","Rejected"].map(f=>(
                    <button key={f} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${f==="All"?"bg-red-600 text-white":"bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>{f}</button>
                  ))}
                </div>
                <button onClick={()=>setShowNewCustomer(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 shadow-md">+ New Customer Request</button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[["Pending Requests","8","⏳"],["Approved This Month","14","✅"],["Avg Processing Time","3.2 days","⏱️"]].map(([l,v,i])=>(
                  <div key={l} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <span className="text-3xl">{i}</span>
                    <div><p className="text-2xl font-extrabold text-gray-900">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                  </div>
                ))}
              </div>
              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1A2340] text-white">
                      {["Request ID","Customer Name","Type","Credit Limit","Submitted By","Status","Action"].map(h=>(
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {custRequests.map((r,i) => (
                      <tr key={r.id} className={`border-b hover:bg-gray-50 ${i%2===0?"bg-white":"bg-gray-50/50"}`}>
                        <td className="px-4 py-3 text-blue-600 font-bold">{r.id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{r.name}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${r.type==="New Account"?"bg-blue-100 text-blue-800":"bg-amber-100 text-amber-800"}`}>{r.type}</span></td>
                        <td className="px-4 py-3 font-semibold text-gray-800">${r.limit.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600">{r.by}</td>
                        <td className="px-4 py-3"><Badge text={r.status}/></td>
                        <td className="px-4 py-3 flex gap-1">
                          <button className="text-xs text-red-600 font-semibold border border-red-300 px-2 py-1 rounded-lg hover:bg-red-50">Review</button>
                          <button className="text-xs text-gray-600 border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-50">Docs</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CUSTOMER MASTER ── */}
          {page === "master" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" placeholder="Search by name, ID, or trade license..."/>
                {["Status","Customer Type","Credit Limit","Emirate"].map(f=>(
                  <select key={f} className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-600 shadow-sm"><option>Filter: {f}</option></select>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1A2340] text-white">
                      {["Customer ID","Customer Name","Type","Credit Limit","Utilization","Avail. Credit","Terms","Status","Actions"].map(h=>(
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c,i) => {
                      const avail = Math.round(c.limit * (1 - c.used/100));
                      const barColor = c.used >= 90 ? "bg-red-500" : c.used >= 70 ? "bg-amber-500" : "bg-green-500";
                      return (
                        <tr key={c.id} className={`border-b hover:bg-gray-50 ${i%2===0?"bg-white":"bg-gray-50/50"}`}>
                          <td className="px-4 py-3 text-blue-600 font-bold">{c.id}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{c.name}</td>
                          <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">{c.type}</span></td>
                          <td className="px-4 py-3 font-semibold text-gray-800">${(c.limit/1000).toFixed(0)}K</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${barColor}`} style={{ width:`${c.used}%` }}/></div>
                              <span className={`font-bold ${c.used>=90?"text-red-600":c.used>=70?"text-amber-600":"text-green-700"}`}>{c.used}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">${(avail/1000).toFixed(0)}K</td>
                          <td className="px-4 py-3 text-gray-600">{c.terms}</td>
                          <td className="px-4 py-3"><Badge text={c.status}/></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button className="text-xs text-red-600 font-semibold border border-red-300 px-2 py-1 rounded-lg hover:bg-red-50">View</button>
                              <button className="text-xs text-gray-600 border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-50">Edit</button>
                              <button className="text-xs text-blue-600 border border-blue-300 px-2 py-1 rounded-lg hover:bg-blue-50">CN</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Over */}
      {selectedReq && <SlideOver req={selectedReq} onClose={() => setSelectedReq(null)}/>}

      {/* New Customer Wizard */}
      {showNewCustomer && <StepWizard onClose={() => setShowNewCustomer(false)}/>}
    </div>
  );
}
