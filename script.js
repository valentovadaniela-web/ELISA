// ---------- KONFIGURÁCIA PROTOKOLOV (abecedne) ----------
const PROTOCOLS = {
    "Bluetongue": {
        name: "Bluetongue (Katarálna horúčka oviec)",
        testName: "ELISA BT Ab (IDEXX)",
        controlWells: { pk: ["A1"], nk: ["B1","C1"] },
        formula: "bluetongue",
        validity: { minNK: 0.7, maxNK: 3.0, maxPKsn: 20 },
        interpret: { type: "sn_percent", neg: 80, dubLow: 70, dubHigh: 80, pos: 70 }
    },
    "BVD": {
        name: "BVD (vírusová hnačka hovädzieho dobytka)",
        testName: "ELISA INgezim Pestivirus Compac",
        controlWells: { pk: ["A1"], nk: ["B1"] },
        formula: "bvd_ingezim",
        validity: { serum: { maxPK: 0.4, minNK: 0.8 }, milk: { minPK: 0.8, maxNK: 0.24 } },
        interpret: { type: "bvd", serum: { negCutoffFactor: 0.55, posCutoffFactor: 0.5 }, milk: { spRatio: 0.30 } }
    },
    "EBL": {
        name: "EBL (Enzootická bovinná leukóza)",
        testName: "ELISA EBLV Ab (TestLine)",
        blankWell: "A1",
        controlWells: { pk: ["D1","E1"], nk: ["B1","C1"] },
        formula: "sp",
        validity: { maxBlankOD: 0.200, maxNKRatio: 1/3, minPK: 0.5, maxPK: 2.5 },
        interpret: { type: "sp", individual: { neg: 40, pos: 40 }, pooled: { neg: 30, dubLow: 30, dubHigh: 40, pos: 40 } }
    },
    "EVA": {
        name: "EVA (Vírusová arteritída koní)",
        testName: "ELISA EVA Ab (detekcia protilátok)",
        controlPairs: { pk: ["A1","A2"], nk: ["B1","B2"] },
        formula: "cleanOD",
        validity: { maxNKcleanOD: 0.1, minPKcleanOD: 0.5 },
        interpret: { type: "cleanOD", neg: 0.1, dubLow: 0.10, dubHigh: 0.15, pos: 0.15 }
    },
    "FIP": {
        name: "FIP (Mačacia infekčná peritonitída)",
        testName: "ELISA FIP Ab - titračná",
        controlWells: { pk: ["A1"], nk: ["B1"] },
        formula: "fip_titer",
        validity: { minPK: 0.6, maxPK: 1.2, maxNK: 0.2 },
        interpret: { type: "fip", multiplier: 4 },
        dilutions: [200,800,1600,3200,6400,12800],
        rows: ['C','D','E','F','G','H']
    },
    "IBR_gB": {
        name: "IBR gB (nevakcínované)",
        testName: "ELISA IBR gB Ab (IDEXX)",
        controlWells: { pk: ["A1","A2"], nk: ["B1","B2"] },
        formula: "blocking",
        validity: { minNKod: 0.5, minPKblock: 80 },
        interpret: { type: "percent", neg: 45, dubLow: 45, dubHigh: 55, pos: 55 }
    },
    "IBR_gE": {
        name: "IBR gE (vakcínované)",
        testName: "ELISA IBR gE Ab (IDEXX) - kompetitívna",
        controlWells: { pk: ["A1","A2"], nk: ["B1","B2"] },
        formula: "sn",
        validity: { minDiffNK_PK: 0.300 },
        interpret: { type: "sn", serum: { neg: 0.70, dubLow: 0.60, dubHigh: 0.70, pos: 0.60 }, milk: { neg: 0.80, pos: 0.80 } }
    },
    "PTBC": {
        name: "PTBC (Paratuberkulóza)",
        testName: "ELISA MAP Ab (ID Screen Paratuberculosis Indirect)",
        controlPairs: { pk: ["C1","D1","C2","D2"], nk: ["A1","B1","A2","B2"] },
        formula: "correctedOD",
        validity: { minPKcorrOD: 0.350, minRatioPK_NK: 3.5 },
        interpret: { type: "sp", serum: { neg: 60, dubLow: 61, dubHigh: 69, pos: 70 }, milkIndividual: { neg: 30, pos: 30 }, milkPooled: { neg: 15, pos: 15 } }
    },
    "RHDV": {
        name: "RHDV (Mor králikov)",
        testName: "ELISA INgezim RHDV DAS",
        controlWells: { pk: ["A1"], nk: ["B1"] },
        formula: "rhdv_cutoff",
        validity: { minPK: 1.0, maxNKratio: 0.15 },
        interpret: { type: "cutoff", multiplier: 0.15 }
    },
    "Toxoplasma": {
        name: "Toxoplasma (Toxoplasma gondii)",
        testName: "ELISA ID Screen Toxoplasmosis Indirect Multi-species",
        controlWells: { pk: ["C1","D1"], nk: ["A1","B1"] },
        formula: "toxoplasma_sp",
        validity: { minPK: 0.350, minRatioPK_NK: 3 },
        interpret: { type: "sp_percent", standard: { neg: 40, dubLow: 40, dubHigh: 50, pos: 50 }, dog: { neg: 40, dubLow: 40, dubHigh: 70, pos: 70 } }
    },
    "WNV": {
        name: "WNV (Západonílska horúčka koní)",
        testName: "ELISA WNV IgM Capture",
        controlPairs: { pk: ["A1","A2"], nk: ["B1","B2"] },
        formula: "cleanOD",
        validity: { maxNKcleanOD: 0.25, minPKcleanOD: 0.8 },
        interpret: { type: "cleanOD", neg: 0.30, dubLow: 0.30, dubHigh: 0.35, pos: 0.35 }
    }
};

const STORAGE_KEY = 'elisa_multi_protocol_history';
const ROWS = ['A','B','C','D','E','F','G','H'];
let currentProtocol = "IBR_gB";
let currentSampleType = "serum";
let currentEblType = "individual";
let currentPtbcType = "serum";
let currentBvdType = "serum";
let currentToxoplasmaType = "standard";

// Inicializácia platničky
const plateBody = document.getElementById('plate-body');
function buildPlate() {
    plateBody.innerHTML = '';
    ROWS.forEach(r => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<th>${r}</th>`;
        for(let i=1; i<=12; i++){
            let well = `${r}${i}`;
            tr.innerHTML += `<td><input type="text" class="cell-input" id="${well}"></td>`;
        }
        plateBody.appendChild(tr);
    });
}
buildPlate();

function highlightControls() {
    document.querySelectorAll('.cell-input').forEach(inp => inp.classList.remove('cell-pk','cell-nk','cell-blank'));
    const proto = PROTOCOLS[currentProtocol];
    if(proto.formula === "cleanOD" && proto.controlPairs) {
        if(proto.controlPairs.pk) proto.controlPairs.pk.forEach(w => { let el = document.getElementById(w); if(el) el.classList.add('cell-pk'); });
        if(proto.controlPairs.nk) proto.controlPairs.nk.forEach(w => { let el = document.getElementById(w); if(el) el.classList.add('cell-nk'); });
    } else if(proto.formula === "correctedOD" && proto.controlPairs) {
        if(proto.controlPairs.pk) proto.controlPairs.pk.forEach(w => { let el = document.getElementById(w); if(el) el.classList.add('cell-pk'); });
        if(proto.controlPairs.nk) proto.controlPairs.nk.forEach(w => { let el = document.getElementById(w); if(el) el.classList.add('cell-nk'); });
    } else if(proto.controlWells) {
        if(proto.controlWells.pk) proto.controlWells.pk.forEach(w => { let el = document.getElementById(w); if(el) el.classList.add('cell-pk'); });
        if(proto.controlWells.nk) proto.controlWells.nk.forEach(w => { let el = document.getElementById(w); if(el) el.classList.add('cell-nk'); });
    }
    if(proto.blankWell) { let el = document.getElementById(proto.blankWell); if(el) el.classList.add('cell-blank'); }
}

function switchProtocol() {
    const select = document.getElementById('nakazaSelect');
    currentProtocol = select.value;
    document.getElementById('test').value = PROTOCOLS[currentProtocol].testName;
    const sampleDiv = document.getElementById('sampleTypeDiv');
    const eblDiv = document.getElementById('eblTypeDiv');
    const ptbcDiv = document.getElementById('ptbcTypeDiv');
    const bvdDiv = document.getElementById('bvdTypeDiv');
    const toxoDiv = document.getElementById('toxoplasmaTypeDiv');
    sampleDiv.style.display = eblDiv.style.display = ptbcDiv.style.display = bvdDiv.style.display = toxoDiv.style.display = 'none';
    if(currentProtocol === 'IBR_gE') sampleDiv.style.display = 'flex';
    else if(currentProtocol === 'EBL') eblDiv.style.display = 'flex';
    else if(currentProtocol === 'PTBC') ptbcDiv.style.display = 'flex';
    else if(currentProtocol === 'BVD') bvdDiv.style.display = 'flex';
    else if(currentProtocol === 'Toxoplasma') toxoDiv.style.display = 'flex';
    highlightControls();
    updateLimitsBox();
    document.getElementById('vysledky-sekcia').style.display = 'none';
}

function updateInterpretBounds() {
    if(currentProtocol === 'IBR_gE') { const radio = document.querySelector('input[name="sampleType"]:checked'); if(radio) currentSampleType = radio.value; updateLimitsBox(); if(document.getElementById('vysledky-sekcia').style.display === 'block') vypocitaj(false); }
    else if(currentProtocol === 'EBL') { const radio = document.querySelector('input[name="eblType"]:checked'); if(radio) currentEblType = radio.value; updateLimitsBox(); if(document.getElementById('vysledky-sekcia').style.display === 'block') vypocitaj(false); }
    else if(currentProtocol === 'PTBC') { const radio = document.querySelector('input[name="ptbcType"]:checked'); if(radio) currentPtbcType = radio.value; updateLimitsBox(); if(document.getElementById('vysledky-sekcia').style.display === 'block') vypocitaj(false); }
    else if(currentProtocol === 'BVD') { const radio = document.querySelector('input[name="bvdType"]:checked'); if(radio) currentBvdType = radio.value; updateLimitsBox(); if(document.getElementById('vysledky-sekcia').style.display === 'block') vypocitaj(false); }
    else if(currentProtocol === 'Toxoplasma') { const radio = document.querySelector('input[name="toxoplasmaType"]:checked'); if(radio) currentToxoplasmaType = radio.value; updateLimitsBox(); if(document.getElementById('vysledky-sekcia').style.display === 'block') vypocitaj(false); }
}

function updateLimitsBox() {
    const proto = PROTOCOLS[currentProtocol];
    const limitsDiv = document.getElementById('limitsBox');
    if(!limitsDiv) return;
    let validityHtml = `<div class="limit-group"><h4>Kritériá validity (${proto.name})</h4>`;
    if(proto.formula === "cleanOD") validityHtml += `<p>• Čistá OD NK <strong>< ${proto.validity.maxNKcleanOD}</strong></p><p>• Čistá OD PK <strong>> ${proto.validity.minPKcleanOD}</strong></p>`;
    else if(proto.formula === "blocking") { if(proto.validity.minNKod) validityHtml += `<p>• NK priemerná OD <strong>≥ ${proto.validity.minNKod}</strong></p>`; if(proto.validity.minPKblock) validityHtml += `<p>• PK % blokovania <strong>> ${proto.validity.minPKblock} %</strong></p>`; }
    else if(proto.formula === "sn") validityHtml += `<p>• (OD NK - OD PK) <strong>≥ ${proto.validity.minDiffNK_PK}</strong></p>`;
    else if(proto.formula === "sp") validityHtml += `<p>• OD Blank <strong>< ${proto.validity.maxBlankOD}</strong></p><p>• OD NK <strong>< 1/3 × OD PK</strong> (priemer)</p><p>• Priemer OD PK v rozmedzí <strong>${proto.validity.minPK} - ${proto.validity.maxPK}</strong></p>`;
    else if(proto.formula === "correctedOD") validityHtml += `<p>• Priemerná korigovaná OD PK <strong>> ${proto.validity.minPKcorrOD}</strong></p><p>• Pomer (kor.OD PK / kor.OD NK) <strong>> ${proto.validity.minRatioPK_NK}</strong></p>`;
    else if(proto.formula === "bvd_ingezim") { if(currentBvdType === 'serum') validityHtml += `<p>• OD PK <strong>< ${proto.validity.serum.maxPK}</strong></p><p>• OD NK <strong>> ${proto.validity.serum.minNK}</strong></p>`; else validityHtml += `<p>• OD PK <strong>> ${proto.validity.milk.minPK}</strong></p><p>• OD NK <strong>< ${proto.validity.milk.maxNK}</strong></p>`; }
    else if(proto.formula === "fip_titer") validityHtml += `<p>• OD PK v rozmedzí <strong>${proto.validity.minPK} - ${proto.validity.maxPK}</strong></p><p>• OD NK <strong>≤ ${proto.validity.maxNK}</strong></p>`;
    else if(proto.formula === "bluetongue") validityHtml += `<p>• Priemerná OD NK v rozmedzí <strong>${proto.validity.minNK} - ${proto.validity.maxNK}</strong></p><p>• S/N% PK <strong>< ${proto.validity.maxPKsn} %</strong></p>`;
    else if(proto.formula === "rhdv_cutoff") validityHtml += `<p>• OD PK <strong>> ${proto.validity.minPK}</strong></p><p>• OD NK <strong>< Cut-off</strong> (Cut-off = 0,15 × OD PK)</p>`;
    else if(proto.formula === "toxoplasma_sp") validityHtml += `<p>• Priemerná OD PK <strong>> ${proto.validity.minPK}</strong></p><p>• Pomer (priemer PK / priemer NK) <strong>> ${proto.validity.minRatioPK_NK}</strong></p>`;
    validityHtml += `</div>`;
    
    let interpretHtml = `<div class="limit-group"><h4>Kritériá interpretácie vzoriek</h4>`;
    if(proto.interpret.type === 'percent') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: < ${proto.interpret.neg} %</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: ${proto.interpret.dubLow} - ${proto.interpret.dubHigh} %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: ≥ ${proto.interpret.pos} %</p>`;
    else if(proto.interpret.type === 'cleanOD') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: ≤ ${proto.interpret.neg}</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: ${proto.interpret.dubLow} - ${proto.interpret.dubHigh}</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: ≥ ${proto.interpret.pos}</p>`;
    else if(proto.interpret.type === 'sn') { if(currentProtocol === 'IBR_gE') { if(currentSampleType === 'serum') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/N > 0,70</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: 0,60 - 0,70</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/N ≤ 0,60</p>`; else interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/N > 0,80</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/N ≤ 0,80</p>`; } }
    else if(proto.interpret.type === 'sp') { if(currentProtocol === 'EBL') { if(currentEblType === 'individual') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P < 40 %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P ≥ 40 %</p>`; else interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P < 30 %</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: 30 - 40 %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P ≥ 40 %</p>`; } else if(currentProtocol === 'PTBC') { if(currentPtbcType === 'serum') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P ≤ 60 %</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: 61 - 69 %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P ≥ 70 %</p>`; else if(currentPtbcType === 'milkIndividual') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P ≤ 30 %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P > 30 %</p>`; else interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P ≤ 15 %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P > 15 %</p>`; } }
    else if(proto.interpret.type === 'bvd') { if(currentBvdType === 'serum') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: OD > NK × 0,55</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: NK×0,5 < OD ≤ NK×0,55</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: OD < NK × 0,5</p>`; else interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P ≤ 0,30</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P > 0,30</p>`; }
    else if(proto.interpret.type === 'fip') interpretHtml += `<p><span style="color:var(--success)">■</span> Cut-off = 4 × OD NK</p><p>● Titer = najvyššie riedenie (200–12800) s OD > cut-off</p><p>● Pravdepodobnosť FIP: Titer ≥6400 → 75 %, ≥12800 → 50 %, nižší → FECV</p>`;
    else if(proto.interpret.type === 'sn_percent') interpretHtml += `<p><span style="color:var(--danger)">■</span> POZITÍVNA: S/N% ≤ 70 %</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: 70 - 80 %</p><p><span style="color:var(--success)">■</span> NEGATÍVNA: S/N% ≥ 80 %</p>`;
    else if(proto.interpret.type === 'cutoff') interpretHtml += `<p><span style="color:var(--danger)">■</span> POZITÍVNA: OD > Cut-off (0,15×ODPK)</p><p><span style="color:var(--success)">■</span> NEGATÍVNA: OD < Cut-off</p><p>Pre vzorky v duplikáte sa používa priemer OD.</p>`;
    else if(proto.interpret.type === 'sp_percent') { if(currentToxoplasmaType === 'standard') interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P% ≤ 40 %</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: 40 - 50 %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P% ≥ 50 %</p>`; else interpretHtml += `<p><span style="color:var(--success)">■</span> NEGATÍVNA: S/P% ≤ 40 %</p><p><span style="color:var(--warning)">■</span> DUBIÓZNA: 40 - 70 %</p><p><span style="color:var(--danger)">■</span> POZITÍVNA: S/P% ≥ 70 %</p><p><em>(špecifické pre psie sérum)</em></p>`; }
    interpretHtml += `</div>`;
    limitsDiv.innerHTML = validityHtml + interpretHtml;
}

function getSampleWells() {
    const proto = PROTOCOLS[currentProtocol];
    let controlSet = new Set();
    if(proto.formula === "cleanOD" && proto.controlPairs) { if(proto.controlPairs.pk) proto.controlPairs.pk.forEach(w=>controlSet.add(w)); if(proto.controlPairs.nk) proto.controlPairs.nk.forEach(w=>controlSet.add(w)); }
    else if(proto.formula === "correctedOD" && proto.controlPairs) { if(proto.controlPairs.pk) proto.controlPairs.pk.forEach(w=>controlSet.add(w)); if(proto.controlPairs.nk) proto.controlPairs.nk.forEach(w=>controlSet.add(w)); }
    else if(proto.controlWells) { if(proto.controlWells.pk) proto.controlWells.pk.forEach(w=>controlSet.add(w)); if(proto.controlWells.nk) proto.controlWells.nk.forEach(w=>controlSet.add(w)); }
    if(proto.blankWell) controlSet.add(proto.blankWell);
    const wells = [];
    for(let r of ROWS) for(let i=1;i<=12;i++) { let well=`${r}${i}`; if(!controlSet.has(well)) wells.push(well); }
    return wells;
}

function getSamplePairs() {
    const proto = PROTOCOLS[currentProtocol];
    let controlSet = new Set();
    if(proto.controlPairs) { if(proto.controlPairs.pk) proto.controlPairs.pk.forEach(w=>controlSet.add(w)); if(proto.controlPairs.nk) proto.controlPairs.nk.forEach(w=>controlSet.add(w)); }
    const pairs = [];
    for(let r of ROWS) for(let i=1;i<=12;i+=2) { let wellMinus=`${r}${i}`, wellPlus=`${r}${i+1}`; if(!controlSet.has(wellMinus) && !controlSet.has(wellPlus)) pairs.push({minus:wellMinus, plus:wellPlus}); }
    return pairs;
}

function vypocitaj(save = true) {
    const proto = PROTOCOLS[currentProtocol];
    const getV = (id) => parseFloat(document.getElementById(id)?.value.replace(',','.')) || 0;
    
    if(proto.formula === "cleanOD") { // EVA, WNV
        const pkPlus=getV("A1"), pkMinus=getV("A2"), nkPlus=getV("B1"), nkMinus=getV("B2");
        const cleanOD_PK=pkPlus-pkMinus, cleanOD_NK=nkPlus-nkMinus;
        let isValid=true, msg="";
        if(cleanOD_NK>=proto.validity.maxNKcleanOD) { isValid=false; msg+=`Čistá OD NK (${cleanOD_NK.toFixed(3)}) ≥ ${proto.validity.maxNKcleanOD}. `; }
        if(cleanOD_PK<=proto.validity.minPKcleanOD) { isValid=false; msg+=`Čistá OD PK (${cleanOD_PK.toFixed(3)}) ≤ ${proto.validity.minPKcleanOD}. `; }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const pairs = getSamplePairs();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        for(let p of pairs) {
            const odM=getV(p.minus), odP=getV(p.plus);
            if(odM===0 && odP===0 && document.getElementById(p.minus).value.trim()==="") continue;
            const clean=odP-odM;
            let verdict="", cls="";
            if(clean<=proto.interpret.neg) { verdict="Negatívna"; cls="badge-neg"; }
            else if(clean>=proto.interpret.pos) { verdict="Pozitívna"; cls="badge-pos"; }
            else { verdict="Dubiózna"; cls="badge-dub"; }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${p.minus}/${p.plus}`;
            tbody.innerHTML += `<tr><td>${p.minus}/${p.plus}</td><td>${vzid}</td><td>${odP.toFixed(3)} / ${odM.toFixed(3)}</td><td>${clean.toFixed(3)}</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | Čistá OD NK: ${cleanOD_NK.toFixed(3)} (max <${proto.validity.maxNKcleanOD}) | Čistá OD PK: ${cleanOD_PK.toFixed(3)} (min >${proto.validity.minPKcleanOD}) ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "blocking") { // IBR gB
        const avgNK = (getV("B1")+getV("B2"))/2;
        const avgPK = (getV("A1")+getV("A2"))/2;
        const pkBlock = ((avgNK - avgPK)/avgNK)*100;
        let isValid=true, msg="";
        if(avgNK<proto.validity.minNKod) { isValid=false; msg+=`NK priemer (${avgNK.toFixed(3)}) < ${proto.validity.minNKod}. `; }
        if(pkBlock<proto.validity.minPKblock) { isValid=false; msg+=`PK blokovanie (${pkBlock.toFixed(1)}%) < ${proto.validity.minPKblock}%. `; }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const wells = getSampleWells();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        for(let w of wells) {
            const od=getV(w);
            if(od===0 && document.getElementById(w).value.trim()==="") continue;
            const blok = ((avgNK-od)/avgNK)*100;
            let verdict="", cls="";
            if(blok>=proto.interpret.pos) { verdict="Pozitívna"; cls="badge-pos"; }
            else if(blok>=proto.interpret.dubLow) { verdict="Dubiózna"; cls="badge-dub"; }
            else { verdict="Negatívna"; cls="badge-neg"; }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${w}`;
            tbody.innerHTML += `<tr><td>${w}</td><td>${vzid}</td><td>${od.toFixed(3)}</td><td>${blok.toFixed(1)}%</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | NK priemer: ${avgNK.toFixed(3)} | PK blok: ${pkBlock.toFixed(1)}% ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "sn") { // IBR gE
        const avgNK = (getV("B1")+getV("B2"))/2;
        const avgPK = (getV("A1")+getV("A2"))/2;
        const diff = avgNK - avgPK;
        let isValid = diff >= proto.validity.minDiffNK_PK;
        let msg = isValid?"":`Rozdiel (OD NK - OD PK) = ${diff.toFixed(3)} < ${proto.validity.minDiffNK_PK}.`;
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const wells = getSampleWells();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        let posLimit = (currentSampleType==='serum')?0.60:0.80;
        let dubLow = (currentSampleType==='serum')?0.60:null;
        let dubHigh = (currentSampleType==='serum')?0.70:null;
        for(let w of wells) {
            const od=getV(w);
            if(od===0 && document.getElementById(w).value.trim()==="") continue;
            const sn = od/avgNK;
            let verdict="", cls="";
            if(currentSampleType==='serum') {
                if(sn<=posLimit) { verdict="Pozitívna"; cls="badge-pos"; }
                else if(sn>dubLow && sn<=dubHigh) { verdict="Dubiózna"; cls="badge-dub"; }
                else { verdict="Negatívna"; cls="badge-neg"; }
            } else {
                if(sn<=posLimit) { verdict="Pozitívna"; cls="badge-pos"; }
                else { verdict="Negatívna"; cls="badge-neg"; }
            }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${w}`;
            tbody.innerHTML += `<tr><td>${w}</td><td>${vzid}</td><td>${od.toFixed(3)}</td><td>S/N = ${sn.toFixed(3)}</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | OD NK: ${avgNK.toFixed(3)} | OD PK: ${avgPK.toFixed(3)} | Rozdiel: ${diff.toFixed(3)} (≥${proto.validity.minDiffNK_PK}) ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "sp") { // EBL
        const blank=getV(proto.blankWell);
        const pkVals = proto.controlWells.pk.map(w=>getV(w));
        const avgPK = pkVals.reduce((a,b)=>a+b,0)/pkVals.length;
        const nkVals = proto.controlWells.nk.map(w=>getV(w));
        const avgNK = nkVals.reduce((a,b)=>a+b,0)/nkVals.length;
        let isValid=true, msg="";
        if(blank>=proto.validity.maxBlankOD) { isValid=false; msg+=`OD Blank (${blank.toFixed(3)}) ≥ ${proto.validity.maxBlankOD}. `; }
        if(avgNK >= (avgPK/3)) { isValid=false; msg+=`OD NK (${avgNK.toFixed(3)}) ≥ 1/3 OD PK (${(avgPK/3).toFixed(3)}). `; }
        if(avgPK<=proto.validity.minPK || avgPK>=proto.validity.maxPK) { isValid=false; msg+=`Priemer OD PK (${avgPK.toFixed(3)}) mimo ${proto.validity.minPK}-${proto.validity.maxPK}. `; }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const wells = getSampleWells();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        for(let w of wells) {
            const od=getV(w);
            if(od===0 && document.getElementById(w).value.trim()==="") continue;
            const sp = (od/avgPK)*100;
            let verdict="", cls="";
            if(currentEblType==='individual') {
                if(sp>=40) { verdict="Pozitívna"; cls="badge-pos"; } else { verdict="Negatívna"; cls="badge-neg"; }
            } else {
                if(sp>=40) { verdict="Pozitívna"; cls="badge-pos"; }
                else if(sp>=30) { verdict="Dubiózna"; cls="badge-dub"; }
                else { verdict="Negatívna"; cls="badge-neg"; }
            }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${w}`;
            tbody.innerHTML += `<tr><td>${w}</td><td>${vzid}</td><td>${od.toFixed(3)}</td><td>S/P = ${sp.toFixed(1)}%</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | Blank: ${blank.toFixed(3)} (max<${proto.validity.maxBlankOD}) | NK: ${avgNK.toFixed(3)} | PK: ${avgPK.toFixed(3)} (${proto.validity.minPK}-${proto.validity.maxPK}) | Podmienka NK<1/3PK: ${(avgNK<avgPK/3)?'splnená':'nesplnená'} ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "correctedOD") { // PTBC
        const nkMinus1=getV("A1"), nkMinus2=getV("B1"), nkPlus1=getV("A2"), nkPlus2=getV("B2");
        const corrNK1=nkPlus1-nkMinus1, corrNK2=nkPlus2-nkMinus2;
        const avgCorrNK = (Math.abs(corrNK1)+Math.abs(corrNK2))/2;
        const pkMinus1=getV("C1"), pkMinus2=getV("D1"), pkPlus1=getV("C2"), pkPlus2=getV("D2");
        const corrPK1=pkPlus1-pkMinus1, corrPK2=pkPlus2-pkMinus2;
        const avgCorrPK = (corrPK1+corrPK2)/2;
        let isValid=true, msg="";
        if(avgCorrPK<=proto.validity.minPKcorrOD) { isValid=false; msg+=`Kor.OD PK (${avgCorrPK.toFixed(3)}) ≤ ${proto.validity.minPKcorrOD}. `; }
        const ratio = avgCorrPK/avgCorrNK;
        if(ratio<=proto.validity.minRatioPK_NK) { isValid=false; msg+=`Pomer PK/NK (${ratio.toFixed(2)}) ≤ ${proto.validity.minRatioPK_NK}. `; }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const pairs = getSamplePairs();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        for(let p of pairs) {
            const odM=getV(p.minus), odP=getV(p.plus);
            if(odM===0 && odP===0 && document.getElementById(p.minus).value.trim()==="") continue;
            const corr=odP-odM;
            const sp = (corr/avgCorrPK)*100;
            let verdict="", cls="";
            if(currentPtbcType==='serum') {
                if(sp>=70) { verdict="Pozitívna"; cls="badge-pos"; }
                else if(sp>=61) { verdict="Dubiózna"; cls="badge-dub"; }
                else { verdict="Negatívna"; cls="badge-neg"; }
            } else if(currentPtbcType==='milkIndividual') {
                if(sp>30) { verdict="Pozitívna"; cls="badge-pos"; } else { verdict="Negatívna"; cls="badge-neg"; }
            } else {
                if(sp>15) { verdict="Pozitívna"; cls="badge-pos"; } else { verdict="Negatívna"; cls="badge-neg"; }
            }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${p.minus}/${p.plus}`;
            tbody.innerHTML += `<tr><td>${p.minus}/${p.plus}</td><td>${vzid}</td><td>${odP.toFixed(3)}/${odM.toFixed(3)}</td><td>kor.OD=${corr.toFixed(3)}<br>S/P=${sp.toFixed(1)}%</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | Kor.OD PK: ${avgCorrPK.toFixed(3)} (min>${proto.validity.minPKcorrOD}) | Kor.OD NK: ${avgCorrNK.toFixed(3)} | Pomer PK/NK: ${ratio.toFixed(2)} (požadovaný >${proto.validity.minRatioPK_NK}) ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "bvd_ingezim") {
        const pk=getV("A1"), nk=getV("B1");
        let isValid=true, msg="";
        if(currentBvdType==='serum') {
            if(pk>=proto.validity.serum.maxPK) { isValid=false; msg+=`OD PK (${pk.toFixed(3)}) ≥ ${proto.validity.serum.maxPK}. `; }
            if(nk<=proto.validity.serum.minNK) { isValid=false; msg+=`OD NK (${nk.toFixed(3)}) ≤ ${proto.validity.serum.minNK}. `; }
        } else {
            if(pk<=proto.validity.milk.minPK) { isValid=false; msg+=`OD PK (${pk.toFixed(3)}) ≤ ${proto.validity.milk.minPK}. `; }
            if(nk>=proto.validity.milk.maxNK) { isValid=false; msg+=`OD NK (${nk.toFixed(3)}) ≥ ${proto.validity.milk.maxNK}. `; }
        }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const wells = getSampleWells();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        if(currentBvdType==='serum') {
            const negCutoff = nk*proto.interpret.serum.negCutoffFactor;
            const posCutoff = nk*proto.interpret.serum.posCutoffFactor;
            for(let w of wells) {
                const od=getV(w);
                if(od===0 && document.getElementById(w).value.trim()==="") continue;
                let verdict="", cls="";
                if(od>negCutoff) { verdict="Negatívna"; cls="badge-neg"; }
                else if(od<posCutoff) { verdict="Pozitívna"; cls="badge-pos"; }
                else { verdict="Dubiózna"; cls="badge-dub"; }
                const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${w}`;
                tbody.innerHTML += `<tr><td>${w}</td><td>${vzid}</td><td>${od.toFixed(3)}</td><td>negCutoff=${negCutoff.toFixed(3)}<br>posCutoff=${posCutoff.toFixed(3)}</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
                idx++;
            }
        } else {
            const spRatio = proto.interpret.milk.spRatio;
            for(let w of wells) {
                const od=getV(w);
                if(od===0 && document.getElementById(w).value.trim()==="") continue;
                const sp = od/pk;
                let verdict="", cls="";
                if(sp>spRatio) { verdict="Pozitívna"; cls="badge-pos"; } else { verdict="Negatívna"; cls="badge-neg"; }
                const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${w}`;
                tbody.innerHTML += `<tr><td>${w}</td><td>${vzid}</td><td>${od.toFixed(3)}</td><td>S/P = ${sp.toFixed(3)}</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
                idx++;
            }
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} (${currentBvdType==='serum'?'sérum':'mlieko'}) | OD PK: ${pk.toFixed(3)} | OD NK: ${nk.toFixed(3)} ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "fip_titer") {
        const pk=getV("A1"), nk=getV("B1");
        let isValid=true, msg="";
        if(pk<proto.validity.minPK || pk>proto.validity.maxPK) { isValid=false; msg+=`OD PK (${pk.toFixed(3)}) mimo ${proto.validity.minPK}-${proto.validity.maxPK}. `; }
        if(nk>proto.validity.maxNK) { isValid=false; msg+=`OD NK (${nk.toFixed(3)}) > ${proto.validity.maxNK}. `; }
        const cutoff = nk * proto.interpret.multiplier;
        const dilutions = proto.dilutions;
        const rows = proto.rows;
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let sampleIdx=0;
        for(let col=1;col<=12;col++) {
            let odVals=[];
            let hasData=false;
            for(let i=0;i<rows.length;i++) { let val=getV(rows[i]+col); odVals.push(val); if(val!==0) hasData=true; }
            if(!hasData) continue;
            let titer=null;
            for(let i=dilutions.length-1;i>=0;i--) if(odVals[i]>cutoff) { titer=dilutions[i]; break; }
            let titerText = titer?`1/${titer}`:"negatívny";
            let interpretText = "";
            if(titer) { if(titer>=6400 && titer<12800) interpretText="Titer ≥6400 – 75% pravdepodobnosť FIP"; else if(titer>=12800) interpretText="Titer ≥12800 – 50% pravdepodobnosť FIP"; else interpretText="Nízky titer – skôr FECV"; }
            else interpretText="Negatívny – neobsahuje protilátky";
            const vzid = (sampleIdx<idArr.length)?idArr[sampleIdx]:`Vzorka stĺpec ${col}`;
            tbody.innerHTML += `<tr><td>Stĺpec ${col}</td><td>${vzid}</td><td>${odVals.map(v=>v.toFixed(3)).join(' / ')}</td><td>Cut-off=${cutoff.toFixed(3)}<br>Titer=${titerText}</td><td>${interpretText}</td></tr>`;
            sampleIdx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | OD PK: ${pk.toFixed(3)} (požadovaný ${proto.validity.minPK}-${proto.validity.maxPK}) | OD NK: ${nk.toFixed(3)} (≤${proto.validity.maxNK}) | Cut-off = 4×NK = ${cutoff.toFixed(3)} ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "bluetongue") {
        const avgNK = (getV("B1")+getV("C1"))/2;
        const pkVal = getV("A1");
        const pkSn = (pkVal/avgNK)*100;
        let isValid=true, msg="";
        if(avgNK<proto.validity.minNK || avgNK>proto.validity.maxNK) { isValid=false; msg+=`Priemer NK (${avgNK.toFixed(3)}) mimo rozsah ${proto.validity.minNK}-${proto.validity.maxNK}. `; }
        if(pkSn>=proto.validity.maxPKsn) { isValid=false; msg+=`S/N% PK (${pkSn.toFixed(1)}%) ≥ ${proto.validity.maxPKsn}%. `; }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const wells = getSampleWells();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        for(let w of wells) {
            const od=getV(w);
            if(od===0 && document.getElementById(w).value.trim()==="") continue;
            const sn = (od/avgNK)*100;
            let verdict="", cls="";
            if(sn<=proto.interpret.pos) { verdict="Pozitívna"; cls="badge-pos"; }
            else if(sn<proto.interpret.neg && sn>proto.interpret.dubLow) { verdict="Dubiózna"; cls="badge-dub"; }
            else { verdict="Negatívna"; cls="badge-neg"; }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${w}`;
            tbody.innerHTML += `<tr><td>${w}</td><td>${vzid}</td><td>${od.toFixed(3)}</td><td>S/N = ${sn.toFixed(1)}%</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | Priemer NK: ${avgNK.toFixed(3)} (požadovaný ${proto.validity.minNK}-${proto.validity.maxNK}) | S/N% PK: ${pkSn.toFixed(1)}% (požadované <${proto.validity.maxPKsn}%) ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "rhdv_cutoff") {
        const pk = getV("A1");
        const nk = getV("B1");
        const cutoff = proto.interpret.multiplier * pk;
        let isValid=true, msg="";
        if(pk<=proto.validity.minPK) { isValid=false; msg+=`OD PK (${pk.toFixed(3)}) ≤ ${proto.validity.minPK}. `; }
        if(nk>=cutoff) { isValid=false; msg+=`OD NK (${nk.toFixed(3)}) ≥ Cut-off (${cutoff.toFixed(3)}). `; }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        // vzorky v pároch (C1/D1, E1/F1, ...)
        const pairs = [];
        for(let rowIdx=0; rowIdx<ROWS.length; rowIdx+=2) {
            let row1=ROWS[rowIdx], row2=ROWS[rowIdx+1];
            if(row1 && row2) {
                for(let col=1; col<=12; col++) {
                    let well1=row1+col, well2=row2+col;
                    if(!(well1==="A1"||well1==="B1"||well2==="A1"||well2==="B1")) pairs.push({w1:well1, w2:well2});
                }
            }
        }
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        for(let p of pairs) {
            const od1=getV(p.w1), od2=getV(p.w2);
            if(od1===0 && od2===0 && document.getElementById(p.w1).value.trim()==="") continue;
            const avgOD = (od1+od2)/2;
            let verdict="", cls="";
            if(avgOD>cutoff) { verdict="Pozitívna"; cls="badge-pos"; } else { verdict="Negatívna"; cls="badge-neg"; }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${p.w1}/${p.w2}`;
            tbody.innerHTML += `<tr><td>${p.w1}/${p.w2}</td><td>${vzid}</td><td>${od1.toFixed(3)} / ${od2.toFixed(3)} (priemer ${avgOD.toFixed(3)})</td><td>Cut-off = ${cutoff.toFixed(3)}</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | OD PK: ${pk.toFixed(3)} (požadované >${proto.validity.minPK}) | OD NK: ${nk.toFixed(3)} (požadované <${cutoff.toFixed(3)}) | Cut-off = 0,15×PK = ${cutoff.toFixed(3)} ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
    else if(proto.formula === "toxoplasma_sp") {
        const pkVals = proto.controlWells.pk.map(w=>getV(w));
        const avgPK = pkVals.reduce((a,b)=>a+b,0)/pkVals.length;
        const nkVals = proto.controlWells.nk.map(w=>getV(w));
        const avgNK = nkVals.reduce((a,b)=>a+b,0)/nkVals.length;
        let isValid=true, msg="";
        if(avgPK<=proto.validity.minPK) { isValid=false; msg+=`Priemer PK (${avgPK.toFixed(3)}) ≤ ${proto.validity.minPK}. `; }
        const ratio = avgPK/avgNK;
        if(ratio<=proto.validity.minRatioPK_NK) { isValid=false; msg+=`Pomer PK/NK (${ratio.toFixed(2)}) ≤ ${proto.validity.minRatioPK_NK}. `; }
        const idArr = document.getElementById('idPaste').value.split(/\r?\n/).filter(l=>l.trim());
        const wells = getSampleWells();
        const tbody = document.getElementById('vysledky-body');
        tbody.innerHTML = "";
        let idx=0;
        let negLim, dubLow, dubHigh, posLim;
        if(currentToxoplasmaType==='standard') { negLim=40; dubLow=40; dubHigh=50; posLim=50; }
        else { negLim=40; dubLow=40; dubHigh=70; posLim=70; }
        for(let w of wells) {
            const od=getV(w);
            if(od===0 && document.getElementById(w).value.trim()==="") continue;
            const sp = ((od - avgNK) / (avgPK - avgNK)) * 100;
            let verdict="", cls="";
            if(sp<=negLim) { verdict="Negatívna"; cls="badge-neg"; }
            else if(sp>=posLim) { verdict="Pozitívna"; cls="badge-pos"; }
            else { verdict="Dubiózna"; cls="badge-dub"; }
            const vzid = (idx<idArr.length)?idArr[idx]:`Vzorka ${w}`;
            tbody.innerHTML += `<tr><td>${w}</td><td>${vzid}</td><td>${od.toFixed(3)}</td><td>S/P% = ${sp.toFixed(1)}%</td><td><span class="badge ${cls}">${verdict}</span></td></tr>`;
            idx++;
        }
        document.getElementById('validita-info').innerHTML = `STATUS: ${isValid?'VALIDNÝ':'NEVALIDNÝ'} | Priemer PK: ${avgPK.toFixed(3)} (min>${proto.validity.minPK}) | Priemer NK: ${avgNK.toFixed(3)} | Pomer PK/NK: ${ratio.toFixed(2)} (požadovaný >${proto.validity.minRatioPK_NK}) ${!isValid?'<br><span style="color:red;">'+msg+'</span>':''}`;
        document.getElementById('validita-info').style.background = isValid?"#f0fdf4":"#fef2f2";
        document.getElementById('vysledky-sekcia').style.display="block";
        if(save) saveGeneric();
    }
}

function saveGeneric() {
    const plateData = {};
    ROWS.forEach(r => { for(let i=1;i<=12;i++) plateData[`${r}${i}`] = document.getElementById(`${r}${i}`).value; });
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const entry = {
        protocol: currentProtocol,
        prijem: document.getElementById('prijem').value || "Bez č.",
        date: new Date().toLocaleString('sk-SK'),
        fullDate: document.getElementById('datum').value,
        osoba: document.getElementById('osoba').value,
        idList: document.getElementById('idPaste').value,
        plateData: plateData,
        sampleType: currentSampleType,
        eblType: currentEblType,
        ptbcType: currentPtbcType,
        bvdType: currentBvdType,
        toxoplasmaType: currentToxoplasmaType
    };
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0,20)));
    renderHistory();
}

function deleteHistoryEntry(index) { if(confirm("Naozaj vymazať?")) { let history = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); history.splice(index,1); localStorage.setItem(STORAGE_KEY,JSON.stringify(history)); renderHistory(); } }
function renderHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
    const list = document.getElementById('history-list');
    list.innerHTML = history.length?"":"Žiadne záznamy";
    history.forEach((item,index)=>{
        let extra="";
        if(item.protocol==='IBR_gE' && item.sampleType) extra = ` (${item.sampleType==='serum'?'sérum':'mlieko'})`;
        if(item.protocol==='EBL' && item.eblType) extra = ` (${item.eblType==='individual'?'individuálna':'zmesná'})`;
        if(item.protocol==='PTBC' && item.ptbcType) { if(item.ptbcType==='serum') extra=' (sérum/plazma)'; else if(item.ptbcType==='milkIndividual') extra=' (mlieko indiv.)'; else extra=' (mlieko bazén)'; }
        if(item.protocol==='BVD' && item.bvdType) extra = ` (${item.bvdType==='serum'?'sérum':'mlieko'})`;
        if(item.protocol==='Toxoplasma' && item.toxoplasmaType) extra = ` (${item.toxoplasmaType==='standard'?'štandard':'psie sérum'})`;
        list.innerHTML += `<div class="history-item"><span><strong>${item.prijem}</strong> (${item.date}) - ${item.osoba} [${PROTOCOLS[item.protocol]?.name||item.protocol}]${extra}</span><div class="history-buttons"><button class="btn btn-history" onclick="loadFromHistory(${index})">Otvoriť</button><button class="btn btn-delete" onclick="deleteHistoryEntry(${index})">Vymazať</button></div></div>`;
    });
}
function loadFromHistory(index) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
    const item = history[index];
    if(!item) return;
    document.getElementById('nakazaSelect').value = item.protocol;
    switchProtocol();
    if(item.protocol==='IBR_gE' && item.sampleType) { let r=document.querySelector(`input[name="sampleType"][value="${item.sampleType}"]`); if(r) r.checked=true; currentSampleType=item.sampleType; updateInterpretBounds(); }
    if(item.protocol==='EBL' && item.eblType) { let r=document.querySelector(`input[name="eblType"][value="${item.eblType}"]`); if(r) r.checked=true; currentEblType=item.eblType; updateInterpretBounds(); }
    if(item.protocol==='PTBC' && item.ptbcType) { let r=document.querySelector(`input[name="ptbcType"][value="${item.ptbcType}"]`); if(r) r.checked=true; currentPtbcType=item.ptbcType; updateInterpretBounds(); }
    if(item.protocol==='BVD' && item.bvdType) { let r=document.querySelector(`input[name="bvdType"][value="${item.bvdType}"]`); if(r) r.checked=true; currentBvdType=item.bvdType; updateInterpretBounds(); }
    if(item.protocol==='Toxoplasma' && item.toxoplasmaType) { let r=document.querySelector(`input[name="toxoplasmaType"][value="${item.toxoplasmaType}"]`); if(r) r.checked=true; currentToxoplasmaType=item.toxoplasmaType; updateInterpretBounds(); }
    document.getElementById('prijem').value = item.prijem;
    document.getElementById('osoba').value = item.osoba;
    document.getElementById('datum').value = item.fullDate;
    document.getElementById('idPaste').value = item.idList;
    for (const [id,val] of Object.entries(item.plateData)) { let el=document.getElementById(id); if(el) el.value=val; }
    vypocitaj(false);
    window.scrollTo({top: document.getElementById('vysledky-sekcia').offsetTop-20, behavior:'smooth'});
}
function exportHistory() { const data=localStorage.getItem(STORAGE_KEY)||"[]"; const blob=new Blob([data],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`elisa_historia_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
function importHistory(event) { const file=event.target.files[0]; if(!file) return; const reader=new FileReader(); reader.onload=e=>{ try{ const data=JSON.parse(e.target.result); if(Array.isArray(data)){ localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); renderHistory(); alert("História načítaná!"); } else alert("Nesprávny formát."); } catch(err){ alert("Chyba pri spracovaní."); } }; reader.readAsText(file); }
function importujVsetko() { const raw=document.getElementById('excelPaste').value.trim(); if(raw){ const rows=raw.split(/\r?\n/); rows.forEach((row,rIdx)=>{ if(rIdx<8){ const cells=row.split('\t'); cells.forEach((val,cIdx)=>{ if(cIdx<12) document.getElementById(ROWS[rIdx]+(cIdx+1)).value=val.replace(',','.').trim(); }); } }); } }
function init() {
    const select=document.getElementById('nakazaSelect');
    select.innerHTML='';
    const sorted=Object.keys(PROTOCOLS).sort((a,b)=>PROTOCOLS[a].name.localeCompare(PROTOCOLS[b].name));
    for(let k of sorted) { let opt=document.createElement('option'); opt.value=k; opt.innerText=PROTOCOLS[k].name; select.appendChild(opt); }
    document.getElementById('datum').valueAsDate=new Date();
    switchProtocol();
    renderHistory();
}
init();