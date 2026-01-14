import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types & Constants ---

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

// --- Components ---

const Card = ({ title, children, className = "" }: { title: string; children?: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-800 hover:border-slate-700 transition-colors duration-200 flex flex-col ${className}`}>
    <h3 className="text-lg font-bold mb-5 text-white flex items-center gap-2 border-b border-slate-800 pb-3">
      {title}
    </h3>
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

const NumberInput = ({ label, value, onChange, prefix = "$", suffix = "", readOnly = false }: { label: string, value: number, onChange?: (val: number) => void, prefix?: string, suffix?: string, readOnly?: boolean }) => (
  <div className="group">
    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1 group-hover:text-slate-400 transition-colors">{label}</label>
    <div className={`flex items-center rounded-lg border transition-all ${readOnly ? 'bg-slate-900 border-slate-800' : 'bg-slate-950 border-slate-800 group-focus-within:border-emerald-500/50 group-focus-within:ring-2 group-focus-within:ring-emerald-500/20'}`}>
      {prefix && <span className="pl-3 text-slate-500 text-sm font-medium select-none">{prefix}</span>}
      <input
        type="number"
        className={`w-full bg-transparent border-none text-white p-2.5 text-sm font-mono focus:ring-0 outline-none ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        readOnly={readOnly}
      />
      {suffix && <span className="pr-3 text-slate-500 text-xs font-bold select-none">{suffix}</span>}
    </div>
  </div>
);

const ResultRow = ({ label, value, isNegative = false, isTotal = false, subtext = "" }: { label: string, value: number, isNegative?: boolean, isTotal?: boolean, subtext?: string }) => (
  <div className={`flex justify-between items-end py-2 ${isTotal ? 'border-t border-slate-700/50 mt-3 pt-3' : 'border-b border-slate-800/50 last:border-0'}`}>
    <div className="flex flex-col">
      <span className={`${isTotal ? 'text-slate-100 font-bold' : 'text-slate-400 text-sm'}`}>{label}</span>
      {subtext && <span className="text-[10px] text-slate-600">{subtext}</span>}
    </div>
    <span className={`font-mono ${isTotal ? 'text-lg' : 'text-sm'} ${isNegative ? 'text-rose-400' : (value > 0 ? (isTotal ? 'text-emerald-400' : 'text-emerald-500/80') : 'text-slate-500')}`}>
      {isNegative ? '-' : ''}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
    </span>
  </div>
);

const StatBox = ({ label, value, subValue, icon }: { label: string, value: string, subValue?: string, icon?: React.ReactNode }) => (
  <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      {icon}
    </div>
    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</div>
    <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
    {subValue && <div className="text-emerald-500 text-xs font-medium mt-1">{subValue}</div>}
  </div>
);

const AnalysisPoint = ({ condition, type, title, message }: { condition: boolean, type: 'danger' | 'warning' | 'info', title: string, message: string }) => {
  if (!condition) return null;
  
  const styles = {
    danger: 'bg-rose-950/30 border-rose-900/50 text-rose-200',
    warning: 'bg-amber-950/30 border-amber-900/50 text-amber-200',
    info: 'bg-blue-950/30 border-blue-900/50 text-blue-200',
  };

  const icons = {
    danger: (
      <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
       <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }

  return (
    <div className={`p-4 rounded-lg border flex gap-3 ${styles[type]}`}>
      {icons[type]}
      <div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-xs opacity-80 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

const App = () => {
  // --- State: Global Assumptions ---
  const arcLengthWeeks = 6;
  
  // 1. D&D Sessions (In-Person)
  const [arcPrice, setArcPrice] = useState(150); // Total cost for 6 weeks
  const sessionPrice = arcPrice / arcLengthWeeks;
  
  const [playersPerTable, setPlayersPerTable] = useState(5);
  const [dropInPrice] = useState(25);
  const [dropInsPerArc, setDropInsPerArc] = useState(2); 
  const [venueCostPerSession, setVenueCostPerSession] = useState(50); 
  const [runSecondTable, setRunSecondTable] = useState(true);
  const [hiredDMRate, setHiredDMRate] = useState(50); 

  // 2. Downtime Party
  const [partyTicketPrice, setPartyTicketPrice] = useState(15);
  const [partyVenueCost, setPartyVenueCost] = useState(150);
  const [partySuppliesCost, setPartySuppliesCost] = useState(100);
  const [attendeesPerTable, setAttendeesPerTable] = useState(6); 

  // 3. Online Sessions
  const [onlineArcPrice, setOnlineArcPrice] = useState(120);
  const onlineSessionPrice = onlineArcPrice / arcLengthWeeks;
  
  const [onlinePlatformCost, setOnlinePlatformCost] = useState(15); 
  const [onlineTables, setOnlineTables] = useState(1);

  // 4. Classic Games
  const [classicEntryFee, setClassicEntryFee] = useState(10);
  const [classicPlayers, setClassicPlayers] = useState(8);
  const [classicPrizeCost, setClassicPrizeCost] = useState(30);
  const [classicEventsPerMonth, setClassicEventsPerMonth] = useState(1);

  // --- Calculations ---

  // D&D In Person
  const sessionsPerYear = WEEKS_PER_YEAR; 
  const arcsPerYear = WEEKS_PER_YEAR / arcLengthWeeks;

  // Table 1 (Owner Run)
  const table1WeeklyRev = (playersPerTable * sessionPrice) + ((dropInsPerArc * dropInPrice) / arcLengthWeeks);
  const table1WeeklyCost = venueCostPerSession;
  const table1AnnualProfit = (table1WeeklyRev - table1WeeklyCost) * sessionsPerYear;

  // Table 2 (Hired DM)
  const table2WeeklyRev = table1WeeklyRev; 
  const table2WeeklyCost = venueCostPerSession + hiredDMRate;
  const table2AnnualProfit = (table2WeeklyRev - table2WeeklyCost) * sessionsPerYear;
  
  const totalDnDAnnualProfit = table1AnnualProfit + (runSecondTable ? table2AnnualProfit : 0);

  // Downtime Party
  const activeTables = 1 + (runSecondTable ? 1 : 0);
  const totalPartyAttendees = attendeesPerTable * activeTables; 
  const partyRevPerEvent = totalPartyAttendees * partyTicketPrice;
  const partyCostPerEvent = partyVenueCost + partySuppliesCost;
  const partyAnnualProfit = (partyRevPerEvent - partyCostPerEvent) * arcsPerYear;

  // Online
  const onlineWeeklyRev = (playersPerTable * onlineSessionPrice) * onlineTables;
  const onlineAnnualRev = onlineWeeklyRev * WEEKS_PER_YEAR;
  const onlineAnnualCost = onlinePlatformCost * MONTHS_PER_YEAR;
  const onlineAnnualProfit = onlineAnnualRev - onlineAnnualCost;

  // Classic Games
  const classicEventRev = classicPlayers * classicEntryFee;
  const classicEventCost = classicPrizeCost;
  const classicAnnualProfit = (classicEventRev - classicEventCost) * (classicEventsPerMonth * 12);

  // Totals
  const grandTotalAnnualProfit = totalDnDAnnualProfit + partyAnnualProfit + onlineAnnualProfit + classicAnnualProfit;
  const grandTotalMonthlyAvg = grandTotalAnnualProfit / 12;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Event Financial Planner</h1>
          <p className="text-slate-400 mt-2 font-light text-lg">Revenue Modeling & Cost Analysis</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 py-1 px-3 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Projection
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="Est. Annual Profit" 
          value={`$${grandTotalAnnualProfit.toLocaleString()}`} 
          subValue="+12% vs target"
          icon={<svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>}
        />
        <StatBox 
          label="Monthly Average" 
          value={`$${grandTotalMonthlyAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={<svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>}
        />
        <StatBox 
          label="Active Tables" 
          value={`${activeTables + onlineTables}`} 
          subValue={`${activeTables} In-Person / ${onlineTables} Online`}
          icon={<svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>}
        />
        <StatBox 
          label="Profit Margin" 
          value={`${Math.round((grandTotalAnnualProfit / (grandTotalAnnualProfit + (venueCostPerSession * sessionsPerYear * activeTables) + (hiredDMRate * sessionsPerYear * (runSecondTable ? 1 : 0)))) * 100)}%`} 
          subValue="Gross Estimate"
          icon={<svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 15.293 6.293A1 1 0 0115.5 6H12z" clipRule="evenodd"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column: Core Business */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="1. In-Person D&D Arcs (6 Weeks)">
            <div className="mb-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800 text-sm text-slate-400 flex justify-between items-center">
               <span><strong>Model:</strong> {playersPerTable} players @ 6-week cycles.</span>
               <div className="flex items-center space-x-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Config:</span>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={runSecondTable} 
                        onChange={(e) => setRunSecondTable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-slate-700 rounded-full peer-checked:bg-emerald-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">Hire 2nd DM</span>
                  </label>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <NumberInput label="Arc Cost (6 Weeks)" value={arcPrice} onChange={setArcPrice} />
              <NumberInput label="Session Fee (Calc)" value={sessionPrice} readOnly suffix="readonly" />
              <NumberInput label="Venue Cost / Session" value={venueCostPerSession} onChange={setVenueCostPerSession} />
              <NumberInput label="Hired DM Rate" value={hiredDMRate} onChange={setHiredDMRate} />
            </div>

            <div className="bg-slate-950 rounded-lg p-5 border border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Monthly Financial Breakdown</h4>
              <ResultRow label="Table 1 Revenue (Owner)" subtext="Runs 52 weeks/yr" value={(table1WeeklyRev * 52) / 12} />
              <ResultRow label="Table 1 Costs (Venue)" value={(table1WeeklyCost * 52) / 12} isNegative />
              
              {runSecondTable && (
                <>
                  <div className="py-2 flex items-center gap-2 opacity-50">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <span className="text-[10px] text-slate-500 uppercase">Expansion Table</span>
                    <div className="h-px bg-slate-700 flex-1"></div>
                  </div>
                  <ResultRow label="Table 2 Revenue" subtext="Same capacity assumed" value={(table2WeeklyRev * 52) / 12} />
                  <ResultRow label="Table 2 Costs" subtext="Venue + Hired DM" value={(table2WeeklyCost * 52) / 12} isNegative />
                </>
              )}
              
              <ResultRow label="Net D&D Monthly Profit" value={totalDnDAnnualProfit / 12} isTotal />
            </div>
          </Card>

          <Card title="2. Downtime Party">
             <div className="flex gap-4 mb-6 items-start">
               <div className="flex-1">
                 <p className="text-sm text-slate-400 mb-4">
                   Special events hosted after every 6-week arc. Revenue is driven by total attendees from active tables.
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <NumberInput label="Ticket Price" value={partyTicketPrice} onChange={setPartyTicketPrice} />
                    <NumberInput label="Guests / Table" value={attendeesPerTable} onChange={setAttendeesPerTable} prefix="#" />
                    <NumberInput label="Venue Cost" value={partyVenueCost} onChange={setPartyVenueCost} />
                    <NumberInput label="Supplies Cost" value={partySuppliesCost} onChange={setPartySuppliesCost} />
                 </div>
               </div>
               <div className="hidden md:block w-px bg-slate-800 self-stretch mx-2"></div>
               <div className="w-full md:w-64 bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-center">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-2">Event Profitability</div>
                  <ResultRow label="Revenue" subtext={`${totalPartyAttendees} attendees`} value={partyRevPerEvent} />
                  <ResultRow label="Expenses" value={partyCostPerEvent} isNegative />
                  <div className="h-px bg-slate-800 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-bold">Net / Party</span>
                    <span className={`font-mono font-bold ${partyRevPerEvent - partyCostPerEvent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${(partyRevPerEvent - partyCostPerEvent).toLocaleString()}
                    </span>
                  </div>
               </div>
             </div>
          </Card>
        </div>

        {/* Side Column: Additional Streams & Feedback */}
        <div className="space-y-6">
          <Card title="3. Online Sessions">
            <div className="grid grid-cols-2 gap-3 mb-4">
               <NumberInput label="Arc Cost (6 Weeks)" value={onlineArcPrice} onChange={setOnlineArcPrice} />
               <NumberInput label="Session Fee (Calc)" value={onlineSessionPrice} readOnly suffix="readonly" />
               <NumberInput label="Tables" value={onlineTables} onChange={(v) => setOnlineTables(Math.max(0, v))} suffix="" prefix="#" />
               <NumberInput label="Software Cost/Mo" value={onlinePlatformCost} onChange={setOnlinePlatformCost} />
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
               <ResultRow label="Monthly Revenue" value={onlineAnnualRev / 12} />
               <ResultRow label="Software Subs" value={onlinePlatformCost} isNegative />
               <ResultRow label="Net Monthly" value={onlineAnnualProfit / 12} isTotal />
            </div>
          </Card>

          <Card title="4. Classic Games">
            <div className="grid grid-cols-2 gap-3 mb-4">
               <NumberInput label="Entry Fee" value={classicEntryFee} onChange={setClassicEntryFee} />
               <NumberInput label="Events / Month" value={classicEventsPerMonth} onChange={setClassicEventsPerMonth} suffix="" prefix="#" />
               <NumberInput label="Prize Cost" value={classicPrizeCost} onChange={setClassicPrizeCost} />
            </div>
             <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
               <ResultRow label="Monthly Revenue" value={classicEventRev * classicEventsPerMonth} />
               <ResultRow label="Monthly Cost" value={classicEventCost * classicEventsPerMonth} isNegative />
               <ResultRow label="Net Monthly" value={classicAnnualProfit / 12} isTotal />
            </div>
          </Card>

           <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Analysis
            </h3>
            <div className="space-y-3">
              <AnalysisPoint 
                condition={table2WeeklyRev - table2WeeklyCost <= 0}
                type="danger"
                title="Table 2 Loss"
                message="Hired DM costs exceed revenue."
              />
              <AnalysisPoint 
                condition={(table2WeeklyRev - table2WeeklyCost) > 0 && (table2WeeklyRev - table2WeeklyCost) < 50}
                type="warning"
                title="Table 2 Low Margin"
                message="Profit < $50/week. Risky."
              />
              <AnalysisPoint 
                condition={partyRevPerEvent < partyCostPerEvent}
                type="danger"
                title="Party Loss"
                message="Party costs exceed ticket sales."
              />
              <AnalysisPoint 
                condition={true}
                type="info"
                title="Expansion"
                message={`Running ${activeTables} tables drives party profit.`}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);