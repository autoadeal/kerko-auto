// --- Scroll to Top ---
const scrollBtn = document.getElementById("scrollTopBtn");
if (scrollBtn) {
    window.onscroll = function () {
        scrollBtn.style.display =
            (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200)
                ? "block" : "none";
    };
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Auth Modal ---
const modal = document.getElementById("authModal");
function openModal(tab = "login") {
    modal.style.display = "flex";
    switchTab(tab);
}
function closeModal() {
    modal.style.display = "none";
}
function switchTab(tab) {
    document.getElementById("form-login").style.display    = tab === "login"    ? "block" : "none";
    document.getElementById("form-register").style.display = tab === "register" ? "block" : "none";
    document.getElementById("tab-login").classList.toggle("active",    tab === "login");
    document.getElementById("tab-register").classList.toggle("active", tab === "register");
}

// Close modal on overlay click
if (modal) {
    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
    });
}

// Auto-dismiss flash messages after 4s
document.addEventListener("DOMContentLoaded", function () {
    const flashes = document.querySelectorAll(".flash");
    flashes.forEach(el => {
        setTimeout(() => {
            el.style.transition = "opacity 0.5s";
            el.style.opacity = "0";
            setTimeout(() => el.remove(), 500);
        }, 4000);
    });
});

// Brands and models
const carData = {
    "Volkswagen": ["Polo", "Golf", "Jetta", "Passat", "Arteon", "Caddy", "Tiguan", "Touareg", "Touran", "Sharan", "ID.3", "ID.4", "ID.5", "ID.7", "T-Cross", "T-Roc", "Bora", "Taigo", "Tayron", "Multivan", "California"],
    "BMW": ["Seria 1", "Seria 2", "Seria 3", "Seria 4", "Seria 5", "Seria 6", "Seria 7", "Seria 8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "i3", "i4", "i5", "i7",  "iX1", "iX2", "iX3", "iX", "Z1", "Z3", "Z4", "Z8"],
    "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "G-Class", "V-Class", "CLA", "CLE", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "GT", "SL", "EQA", "EQB", "EQE", "EQS", "EQA", "EQT", "EQV" ],
    "Audi": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "e-tron", "TT", "R8"],
    "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Mondeo", "Explorer", "Mustang Mach-E", "Mustang", "Ranger", "Transit", "S-Max", "Galaxy", "EcoSport", "Edge"],
    "Toyota": ["Yaris", "Corolla", "C-HR", "RAV4", "Aygo", "Prius", "Camry", "Land Cruiser", "Hilux", "bZ4X", "Supra", "Proace"],
    "Skoda": ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq", "Elroq", "Scala", "Citigo", "Yeti", "Rapid"],
    "Renault": ["Clio", "Captur", "Megane", "Austral", "Rafale", "Scenic", "Espace", "Twingo", "Zoe", "Kadjat", "Arkana", "Symbioz", "Kangoo", "Talisman"],
    "Fiat": ["500", "500e", "Panda", "Grande Panda", "Tipo", "600", "500L", "500X", "Punto", "Bravo", "Ducato", "Doblo"],
    "Peugeot": ["108", "207", "208", "2008", "307" ,"308", "3008", "408", "508", "5008", "RCZ", "Partner", "Rifter", "Expert"],
    "BYD": ["Seagull", "Dolphin", "Atto 3", "Seal", "Seal U", "Han", "Tang", "Yuan Plus", "E2"],
    "Hyundai": ["i10", "i20", "i30", "Kona", "Tucson", "Santa Fe", "IONIQ 5", "IONIQ 6", "Bayon", "Elantra", "Sonata", "Nexo"],
    "Kia": ["Picanto", "Rio", "Ceed", "XCeed", "Sportage", "Sorento", "EV3", "EV4", "EV6", "EV9", "Niro", "Stonic", "Stinger", "Soul"],
    "Opel": ["Corsa", "Astra", "Mokka", "Grandland", "Crossland", "Insignia", "Adam", "Zafira", "Combo", "Frontera", "Rocks-e"],
    "Citroen": ["C1", "C3", "C4", "C5", "Berlingo", "Ami", "DS3", "Jumpy"],
    "Dacia": ["Sandero", "Duster", "Jogger", "Spring", "Logan", "Bigster", "Lodgy", "Dokker"],
    "Volvo": ["XC40", "XC60", "XC90", "V40", "V60", "V90", "S60", "S90", "EX30", "EX90", "C40"],
    "Seat": ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco", "Alhambra", "Mii", "Toledo"],
    "Mini": ["Cooper", "Countryman", "Clubman", "Paceman", "Aceman", "Convertible"],
    "Land Rover": ["Range Rover", "Range Rover Sport", "Range Rover Velar", "Evoque", "Defender", "Discovery", "Discovery Sport"],
    "Nissan": ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Ariya", "Navara", "Note", "Pulsar"],
    "Suzuki": ["Swift", "Vitara", "S-Cross", "Jimny", "Ignis", "Across", "Swace", "Baleno"],
    "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-60", "CX-80", "MX-30", "MX-5"],
    "Jeep": ["Avenger", "Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator"],
    "Lexus": ["UX", "NX", "RX", "RZ", "LBX", "ES", "LS", "IS", "LC", "CT"],
    "Alfa Romeo": ["Giulietta", "Giulia", "Stelvio", "Tonale", "Junior", "4C", "8C"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Honda": ["Civic", "Jazz", "HR-V", "CR-V", "ZR-V", "e", "Accord", "NSX"],
    "Mitsubishi": ["Space Star", "ASX", "Eclipse Cross", "Outlander", "L200", "Colt", "Pajero"]
};

function populateModels(brandSelectId, modelSelectId, preselectedModel = "") {
    const brandSelect = document.getElementById(brandSelectId);
    const modelSelect = document.getElementById(modelSelectId);
    
    if (!brandSelect || !modelSelect) return;

    modelSelect.innerHTML = '<option value="">Modeli</option>'; // Reset
    const selectedBrand = brandSelect.value;
    
    if (selectedBrand && carData[selectedBrand]) {
        carData[selectedBrand].forEach(model => {
            const option = document.createElement("option");
            option.value = model;
            option.textContent = model;
            if (model === preselectedModel) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
    }
}

function toggleAdvanced() {
    const section = document.getElementById('advancedFilters');
    const btnText = document.getElementById('btnMore');
    const icon = document.getElementById('moreIcon');

    if (section.style.maxHeight === '0px' || section.style.maxHeight === '') {
        section.style.maxHeight = '200px';
        btnText.innerHTML = '<i class="fa-solid fa-minus-circle" id="moreIcon"></i> Më pak';
    } else {
        section.style.maxHeight = '0px';
        btnText.innerHTML = '<i class="fa-solid fa-plus-circle" id="moreIcon"></i> Me shumë';
    }
}
    
const generationData = {
    "Volkswagen": {
        "Polo": ['9N3 2005–2009', '6R/6C 2009–2017', 'AW 2017–2026'],
        "Golf": ['Mk5 2003–2009', 'Mk6 2008–2013', 'Mk7 2012–2020', 'Mk8 2019–2026'],
        "Jetta": ['A5 2005–2010', 'A6 2010–2018', 'A7 2018–2026'],
        "Passat": ['B6 2005–2010', 'B7 2010–2014', 'B8 2014–2023', 'B9 2024–2026'],
        "Arteon": ['2017–2024'],
        "Caddy": ['Typ 2K 2003–2020', 'Mk5 2020–2026'],
        "Tiguan": ['AD/BW 2016–2023', 'Mk3 2024–2026'],
        "Touareg": ['7L 2002–2010', '7P 2010–2018', 'CR 2018–2026'],
        "Touran": ['1T 2003–2015', '5T 2015–2026'],
        "Sharan": ['7N 2010–2022'],
        "ID.3": ['2020–2026'],
        "ID.4": ['2020–2026'],
        "ID.5": ['2021–2026'],
        "ID.7": ['2023–2026'],
        "T-Cross": ['2018–2026'],
        "T-Roc": ['A1 2017–2025', 'Gen 2 2025–2026'],
        "Bora": ['1998-2006'],
        "Taigo": ['2021–2026'],
        "Tayron": ['Gen 1 2018–2024', 'Gen 2 2024–2026'],
        "Multivan": ['T5 2003–2015', 'T6 2015–2021', 'T7 2021–2026'],
        "California": ['T5 2003–2015', 'T6 2015–2024', 'T7 2024–2026'],
    },
    "Audi": {
        "A1": ['2010-2018 (8X)', '2018-2026 (GB)'],
        "A2": ['8Z 1999-2005'],
        "A3": ['8L 1996-2003', '8P 2003-2012', '8V 2012-2020', '8Y 2020-2026'],
        "A4": ['B5 1994-2000', 'B6 2000-2004', 'B7 2004-2007', 'B8 2007-2015', 'B9 2015-2024', 'B10 2024-2026'],
        "A5": ['8T 2007-2016', 'F5 2016-2024', 'B10 2024-2026'],
        "A6": ['C4 1994-1997', 'C5 1997-2004', 'C6 2004-2011', 'C7 2011-2018', 'C8 2018-2024', 'C9 (A7) 2024-2026'],
        "A7": ['4G 2010-2018, 4K 2018-2026'],
        "A8": ['D2 1994-2002', 'D3 2002-2009', 'D4 2009-2017', 'D5 2017-2026'],
        "Q2": ['GA 2016-2026'],
        "Q3": ['8U 2011-2018', 'F3 2018-2026'],
        "Q4": ['F4 2021-2026'],
        "Q5": ['8R 2008-2017', 'FY 2017-2024', 'MK3 2024-2026'],
        "Q6": ['2024-2026'],
        "Q7": ['4L 2005-2015', '4M 2015-2026'],
        "Q8": ['4M 2018-2026', 'GE 2018-2023', '2023-2026'],
        "TT": ['8N 1998-2006', '8J 2006-2014', '8S 2014-2023'],
        "R8": ['Type 42 2006-2015', 'Type 4S 2015-2024'],
    },
    "BMW": {
        "Seria 1": ['E87 2004-2013', 'F20 2011-2019', 'F40 2019-2024', 'F70 2024-2026'],
        "Seria 2": ['F22 2014-2021', 'G42 2021-2026', 'Active Tourer: F45 2014-2021', 'U06 2021-2026'],
        "Seria 3": ['E36 1990-2000', 'E46 1998-2006', 'E90 2005-2013', 'F30 2011-2019', 'G20 2019-2026'],
        "Seria 4": ['F32 2013-2020', 'G22 2020-2026'],
        "Seria 5": ['E39 1995-2003', 'E60 2003-2010', 'F10 2010-2017', 'G30 2017-2023', 'G60 2023-2026'],
        "Seria 6": ['E63 2003-2010', 'F12 2011-2018', 'G32 2017-2024'],
        "Seria 7": ['E38 1994-2001', 'E65 2001-2008', 'F01 2008-2015', 'G11 2015-2022', 'G70 2022-2026'],
        "Seria 8": ['E31 1990-1999', 'G15 2018-2026'],
        "X1": ['E84 2009-2015', 'F48 2015-2022', 'U11 2022-2026'],
        "X2": ['F39 2017-2023', 'U10 2023-2026'],
        "X3": ['E83 2003-2010', 'F25 2010-2017', 'G01 2017-2024', 'G45 2024-2026'],
        "X4": ['F26 2014-2018', 'G02 2018-2026'],
        "X5": ['E53 1999-2006', 'E70 2006-2013', 'F15 2013-2018', 'G05 2018-2026'],
        "X6": ['E71 2008-2014', 'F16 2014-2019', 'G06 2019-2026'],
        "X7": ['G07 2018-2026'],
        "i3": ['I01 2013-2022'],
        "i4": ['G26 2021-2026'],
        "i5": ['G60 2023-2026'],
        "i7": ['G70 2022-2026'],
        "iX1": ['U11 2022-2026'],
        "iX2": ['U10 2023-2026'],
        "iX3": ['G08 2020-2025'],
        "iX": ['i20 2021-2026'],
        "Z1": ['1989-1991'],
        "Z3": ['E36/7 1995-2002'],
        "Z4": ['E85 2002-2008', 'E89 2009-2016', 'G29 2018-2026'],
        "Z8": ['E52 2000-2003'],
        },
    "Mercedes-Benz": {
        "A-Class": ['W168 1997-2004', 'W169 2004-2012', 'W176 2012-2018', 'W177 2018-2026'],
        "B-Class": ['W245 2005-2011', 'W246 2011-2018', 'W247 2018-2026'],
        "C-Class": ['W202 1993-2000', 'W203 2000-2007', 'W204 2007-2014', 'W205 2014-2021', 'W206 2021-2026'],
        "E-Class": ['W124 1984-1995', 'W210 1995-2003', 'W211 2002-2009', 'W212 2009-2016', 'W213 2016-2023', 'W214 2023-2026'],
        "S-Class": ['W140 1991-1998', 'W220 1998-2005', 'W221 2005-2013', 'W222 2013-2020', 'W223 2020-2026'],
        "G-Class": ['W463 1990-2018', 'W463 2018-2024', 'W465 2024-2026'],
        "V-Class": ['W638 1996-2003', 'W639 2003-2014', 'W447 2014-2026'],
        "CLA": ['C117 2013-2019', 'C118 2019-2026'],
        "CLE": ['C236 2023-2026'],
        "CLS": ['W219 2004-2010', 'W218 2010-2018', 'C257 2018-2023'],
        "GLA": ['X156 2013-2020', 'H247 2020-2026'],
        "GLB": ['X247 2019-2026'],
        "GLC": ['X253 2015-2022', 'X254 2022-2026'],
        "GLE": ['W163 1997-2005', 'W164 2005-2011', 'W166 2011-2019', 'V167 2019-2026'],
        "GLS": ['X164 2006-2012', 'X166 2012-2019', 'X167 2019-2026'],
        "GT": ['C190 2014-2021', 'C192 2023-2026'],
        "SL": ['R230 2001-2011', 'R231 2012-2020', 'R232 2021-2026'],
        "EQA": ['H243 2021-2026'],
        "EQB": ['X243 2021-2026'],
        "EQE": ['V295 2022-2026'],
        "EQS": ['V297 2021-2026'],
        "EQT": ['W420 2023-2026'],
        "EQV": ['W447 2020-2026'],
        },
    "Ford": {
        "Fiesta": ['Mk4 1995-2002','Mk5 2002-2008', 'Mk6 2008-2017', 'Mk7 2017-2023'],
        "Focus": ['Mk1 1998-2004', 'Mk2 2004-2010', 'Mk3 2011-2018', 'Mk4 2018-2026'],
        "Puma": ['Mk1 1997-2002', 'Mk2 2019-2026'],
        "Kuga": ['Mk1 2008-2012', 'Mk2 2012-2019', 'Mk3 2019-2026'],
        "Mondeo": ['Mk4 2007-2014', 'Mk5 2014-2022'],
        "Explorer": ['Mk5 2010-2019', 'Mk6 2019-2024', 'EV 2024-2026'],
        "Mustang Mach-E": ['2021-2026'],
        "Mustang": ['Gen 6 2015-2023', 'Gen 7 2023-2026'],
        "Ranger": ['T6 2011-2022', 'P703 2022-2026'],
        "Transit": ['Mark 7 2006-2013', 'Mark 8 2013-2026'],
        "S-Max": ['Mk1 2006-2015', 'Mk2 2015-2023'],
        "Galaxy": ['Mk3 2006-2015', 'Mk4 2015-2023'],
        "EcoSport": ['BV226 2003-2012', 'B515 2012-2023'],
        "Edge": ['Mk1 2007-2015', 'Mk2 2015-2024'],
        },
    "Toyota": {
        "Yaris": ['XP90 2005-2011', 'XP130 2011-2020', 'XP210 2020-2026'],
        "Corolla": ['E150 2006-2013', 'E170 2013-2018', 'E210 2018-2026'],
        "C-HR": ['AX10 2016-2023', 'AX20 2023-2026'],
        "RAV4": ['XA20 2000-2005', 'XA30 2005-2012', 'XA40 2012-2018', 'XA50 2018-2026'],
        "Aygo": ['AB10 2005-2014', 'AB40 2014-2021', 'Aygo X 2021-2026'],
        "Prius": ['XW30 2009-2015', 'XW50 2015-2022', 'XW60 2022-2026'],
        "Camry": ['XV50 2011-2017', 'XV70 2017-2024', 'XV80 2024-2026'],
        "Land Cruiser": ['J150 2009-2023', 'J250 2024-2026', 'J200 2007-2021', 'J300 2021-2026'],
        "Hilux": ['AN10 2004-2015', 'AN120 2015-2026'],
        "bZ4X": ['2022-2026'],
        "Supra": ['A90 2019-2026'],
        "Proace": ['MDX 2013-2016', 'KO 2016-2026'],
        },
    "Skoda": {
        "Fabia": ['Mk2 2007-2014', 'Mk3 2014-2021', 'Mk4 2021-2026'],
        "Octavia": ['Mk2 2004-2013', 'Mk3 2012-2020', 'Mk4 2020-2026'],
        "Superb": ['B6 2008-2015', 'B8 2015-2023', 'B9 2023-2026'],
        "Kamiq": ['NW4 2019-2026'],
        "Karoq": ['NU7 2017-2026'],
        "Kodiaq": ['NS7 2016-2023', 'PS7 2023-2026'],
        "Enyaq": ['iV 2020-2026'],
        "Elroq": ['2024-2026'],
        "Scala": ['2019-2026'],
        "Citigo": ['2011-2020'],
        "Yeti": ['5L 2009-2017'],
        "Rapid": ['NH 2012-2019'],
        },
    "Renault": {
        "Clio": ['III 2005-2012', 'IV 2012-2019', 'V 2019-2026'],
        "Captur": ['Gen 1 2013-2019', 'Gen 2 2019-2026'],
        "Megane": ['III 2008-2016', 'IV 2016-2024', 'E-Tech 2022-2026'],
        "Austral": ['2022-2026'],
        "Rafale": ['2024-2026'],
        "Scenic": ['III 2009-2016', 'IV 2016-2022', 'E-Tech 2024-2026'],
        "Espace": ['IV 2002-2014', 'V 2015-2023', 'VI 2023-2026'],
        "Twingo": ['II 2007-2014', 'III 2014-2024'],
        "Zoe": ['2012-2024'],
        "Kadjar": ['2015-2022'],
        "Arkana": ['2021-2026'],
        "Symbioz": ['2024-2026'],
        "Kangoo": ['Gen 2 2007-2021', 'Gen 3 2021-2026'],
        "Talisman": ['2015-2022'],
        },
    "Fiat": {
        "500": ['Gen 2 2007-2024', '500e 2020-2026'],
        "Panda": ['Gen 3 2011-2024', '2024-2026'],
        "Grande Panda": ['2024-2026'],
        "Tipo": ['356 2015-2026'],
        "600": ['2023-2026'],
        "500L": ['2012-2022'],
        "500X": ['2014-2026'],
        "Punto": ['2005-2012', '2012-2018'],
        "Bravo": ['198 2007-2014'],
        "Ducato": ['S3 2006-2014', 'S4 2014-2026'],
        "Doblo": ['Gen 2 2010-2022', 'Gen 3 2022-2026'],
        },
    "Peugeot": {
        "108": ['2014-2021'],
        "207": ['2006-2014'],
        "208": ['Gen I 2012-2019', 'Gen II 2019-2026'],
        "2008": ['Gen I 2013-2019', 'Gen II 2019-2026'],
        "307": ['2001-2008'],
        "308": ['Gen I 2007-2013', 'Gen II 2013-2021', 'Gen III 2021-2026'],
        "3008": ['Gen I 2009-2016', 'Gen II 2016-2023', 'Gen III 2023-2026'],
        "408": ['Gen I 2010-2022', 'Gen II 2022-2026'],
        "508": ['Gen I 2010-2018', 'Gen II 2018-2026'],
        "5008": ['Gen I 2009-2017', 'Gen II 2017-2024', 'Gen III 2024-2026'],
        "RCZ": ['2010-2015'],
        "Partner": ['Mk1 1996-2008', 'Mk2 2008-2018', 'Mk3 2018-2026'],
        "Rifter": ['2018-2026'],
        "Expert": ['Mk2 2007-2016', 'Mk3 2016-2026'],
        },
    "BYD": {
        "Seagull": ['2023-2026'],
        "Dolphin": ['2021-2026'],
        "Atto 3": ['2022-2026'],
        "Seal": ['2023-2026'],
        "Seal U": ['2023-2026'],
        "Han": ['2020-2026'],
        "Tang": ['Gen II 2018-2026'],
        "Yuan Plus": ['2022-2026'],
        "E2": ['2019-2026'],
        },
    "Hyundai": {
        "i10": ['PA 2007-2013', 'IA 2013-2019', 'AC3 2019-2026'],
        "i20": ['PB 2008-2014', 'GB 2014-2020', 'BC3 2020-2026'],
        "i30": ['FD 2007-2012', 'GD 2011-2017', 'PD 2016-2026'],
        "Kona": ['OS 2017-2023', 'SX2 2023-2026'],
        "Tucson": ['LM 2009-2015', 'TL 2015-2020', 'NX4 2020-2026'],
        "Santa Fe": ['CM 2006-2012', 'DM 2012-2018', 'TM 2018-2023', 'MX5 2023-2026'],
        "IONIQ 5": ['2021-2026'],
        "IONIQ 6": ['2022-2026'],
        "Bayon": ['2021-2026'],
        "Elantra": ['MD 2010-2015', 'AD 2015-2020', 'CN7 2020-2026'],
        "Sonata": ['YF 2009-2014', 'LF 2014-2019', 'DN8 2019-2026'],
        "Nexo": ['2018-2026'],
        },
    "Kia": {
        "Picanto": ['SA 2004-2011', 'TA 2011-2017', 'JA 2017-2026'],
        "Rio": ['UB 2011-2017', 'YB 2017-2023'],
        "Ceed": ['ED 2006-2012', 'JD 2012-2018', 'CD 2018-2026'],
        "XCeed": ['2019-2026'],
        "Sportage": ['SL 2010-2015', 'QL 2015-2021', 'NQ5 2021-2026'],
        "Sorento": ['XM 2009-2014', 'UM 2014-2020', 'MQ4 2020-2026'],
        "EV3": ['2024-2026'],
        "EV4": ['2025-2026'],
        "EV6": ['2021-2026'],
        "EV9": ['2023-2026'],
        "Niro": ['DE 2016-2022', 'SG2 2022-2026'],
        "Stonic": ['2017-2026'],
        "Stinger": ['2017-2023'],
        "Soul": ['AM 2008-2014', 'PS 2014-2019', 'SK3 2019-2026'],
        },
    "Opel": {
        "Corsa": ['D 2006-2014', 'E 2014-2019', 'F 2019-2026'],
        "Astra": ['J 2009-2015', 'K 2015-2021', 'L 2021-2026'],
        "Mokka": ['A 2012-2019', 'B 2020-2026'],
        "Grandland": ['2017-2024', 'Gen II 2024-2026'],
        "Crossland": ['2017-2024 (Frontera)'],
        "Insignia": ['A 2008-2017', 'B 2017-2022'],
        "Adam": ['2012-2019'],
        "Zafira": ['B 2005-2014', 'C 2011-2019', 'Life 2019-2026'],
        "Combo": ['Combo D 2011-2018', 'Combo E 2018-2026'],
        "Frontera": ['2024-2026 (New SUV model)'],
        "Rocks-e": ['2021-2026'],
        },
    "Citroen": {
        "C1": ['Gen I 2005-2014', 'Gen II 2014-2021'],
        "C3": ['Mk2 2009-2016', 'Mk3 2016-2023', 'Mk4 2024-2026'],
        "C4": ['Mk1 2004-2010', 'Mk2 2010-2018', 'Mk3 2020-2026'],
        "C5": ['Mk1 2001-2008', 'Mk2 2008-2017', 'C5 X 2021-2026'],
        "Berlingo": ['Mk2 2008-2018', 'Mk3 2018-2026'],
        "Ami": ['2020-2026'],
        "DS3": ['2009-2016'],
        "Jumpy": ['Mk2 2007-2016', 'Mk3 2016-2026'],
        },
    "Dacia": {
        "Sandero": ['Mk1 2008-2012', 'Mk2 2012-2020', 'Mk3 2020-2026'],
        "Duster": ['HS 2010-2017', 'HM 2017-2024', 'P1310 2024-2026'],
        "Jogger": ['2021-2026'],
        "Spring": ['2021-2026'],
        "Logan": ['L90 2004-2012', 'L52 2012-2020', 'LJI 2020-2026'],
        "Bigster": ['2025-2026'],
        "Lodgy": ['2012-2022'],
        "Dokker": ['2012-2021'],
        },
    "Volvo": {
        "XC40": ['2017-2026'],
        "XC60": ['Gen I 2008-2017', 'Gen II 2017-2026'],
        "XC90": ['Gen I 2002-2014', 'Gen II 2014-2026'],
        "V40": ['2012-2019'],
        "V60": ['Gen I 2010-2018', 'Gen II 2018-2026'],
        "V90": ['2016-2026'],
        "S60": ['Gen II 2010-2018', 'Gen III 2018-2026'],
        "S90": ['2016-2026'],
        "EX30": ['2023-2026'],
        "EX90": ['2024-2026'],
        "C40": ['2021-2026'],
        },
    "Seat": {
        "Ibiza": ['6L 2002-2008', '6J 2008-2017', '6F 2017-2026'],
        "Leon": ['1P 2005-2012', '5F 2012-2020', 'KL 2020-2026'],
        "Arona": ['2017-2026'],
        "Ateca": ['2016-2026'],
        "Tarraco": ['2018-2024'],
        "Alhambra": ['7N 2010-2020'],
        "Mii": ['2011-2021'],
        "Toledo": ['5P 2004-2009', 'KG 2012-2019'],
        },
    "Mini": {
        "Cooper (Hatch)": ['R50/53 2001-2006', 'R56 2006-2013', 'F56 2014-2024', 'F66/J01 2024-2026'],
        "Countryman": ['R60 2010-2017', 'F60 2017-2023', 'U25 2023-2026'],
        "Clubman": ['R55 2007-2014', 'F54 2015-2024'],
        "Paceman": ['R61 2013-2016'],
        "Aceman": ['J05 2024-2026'],
        "Convertible": ['R52 2004-2008', 'R57 2009-2015', 'F57 2016-2024', 'F67 2024-2026'],
        },
    "Land Rover": {
        "Range Rover": ['L322 2001-2012', 'L405 2012-2021', 'L460 2022-2026'],
        "Range Rover Sport": ['L320 2005-2013', 'L494 2013-2022', 'L461 2022-2026'],
        "Range Rover Velar": ['L560 2017-2026'],
        "Evoque": ['L538 2011-2018', 'L551 2019-2026'],
        "Defender": ['L316 1983-2016', 'L663 2020-2026'],
        "Discovery": ['Discovery 4 (L319) 2009-2016', 'Discovery 5 (L462) 2017-2026'],
        "Discovery Sport": ['L550 2014-2026'],
        },
    "Nissan": {
        "Micra": ['K12 2002-2010', 'K13 2010-2017', 'K14 2017-2024'],
        "Juke": ['F15 2010-2019', 'F16 2019-2026'],
        "Qashqai": ['J10 2007-2014', 'J11 2014-2021', 'J12 2021-2026'],
        "X-Trail": ['T31 2007-2013', 'T32 2013-2021', 'T33 2021-2026'],
        "Leaf": ['ZE0 2010-2017', 'ZE1 2017-2026'],
        "Ariya": ['2022-2026'],
        "Navara": ['D40 2004-2015', 'D23 2014-2026'],
        "Note": ['E11 2004-2013', 'E12 2013-2020'],
        "Pulsar": ['C13 2014-2018'],
        },
    "Suzuki": {
        "Swift": ['RS 2004-2010', 'AZG 2010-2017', 'A2L 2017-2024', 'Gen 7 2024-2026'],
        "Vitara": ['Gen 3 2005-2015', 'Gen 4 (LY) 2015-2026'],
        "S-Cross": ['Gen 1 2013-2021', 'Gen 2 2021-2026'],
        "Jimny": ['Gen 3 1998-2018', 'Gen 4 2018-2026'],
        "Ignis": ['MF 2016-2026'],
        "Across": ['2020-2026'],
        "Swace": ['2020-2026'],
        "Baleno": ['WB 2015-2022'],
        },
    "Mazda": {
        "Mazda2": ['DE 2007–2014', 'DJ 2014–2026', 'XP210 2022–2026'],
        "Mazda3": ['BL 2008–2013', 'BM/BN 2013–2018', 'BP 2019–2026'],
        "Mazda6": ['GH 2007–2012', 'GJ/GL 2012–2024'],
        "CX-3": ['DK 2015–2023'],
        "CX-30": ['DM 2019–2026'],
        "CX-5": ['KE 2012–2017', 'KF 2017–2025', 'Gen 3 2025–2026'],
        "CX-60": ['2022–2026'],
        "CX-80": ['2024–2026'],
        "MX-30": ['2020–2026'],
        "MX-5": ['NC 2005–2015', 'ND 2015–2026'],
        },
    "Jeep": {
        "Avenger": ['2023–2026'],
        "Renegade": ['BU 2014–2026'],
        "Compass": ['MP 2016–2026'],
        "Cherokee": ['KK 2008–2013', 'KL 2013–2023'],
        "Grand Cherokee": ['WK 2005–2010', 'WK2 2010–2021', 'WL 2021–2026'],
        "Wrangler": ['JK 2006–2018', 'JL 2018–2026'],
        "Gladiator": ['JT 2019–2026'],
        },
    "Lexus": {
        "UX": ['ZA10 2018–2026'],
        "NX": ['AZ10 2014–2021', 'AZ20 2021–2026'],
        "RX": ['AL10 2008–2015', 'AL20 2015–2022', 'AL30 2022–2026'],
        "RZ": ['XEBM10 2022–2026'],
        "LBX": ['2023–2026'],
        "ES": ['XV60 2012–2018', 'XV70 2018–2026'],
        "LS": ['XF40 2006–2017', 'XF50 2017–2026'],
        "IS": ['XE20 2005–2013', 'XE30 2013–2026'],
        "LC": ['Z100 2017–2026'],
        "CT": ['ZWA10 2011–2022'],
        },
    "Alfa Romeo": {
        "Giulietta": ['Type 940 2010–2020'],
        "Giulia": ['Type 952 2016–2026'],
        "Stelvio": ['Type 949 2017–2026'],
        "Tonale": ['2022–2026'],
        "Junior": ['2024–2026'],
        "4C": ['2013–2020'],
        "8C": ['2007–2010'],
        },
    "Tesla": {
        "Model 3": ['Original 2017–2023', 'Highland 2023–2026'],
        "Model Y": ['2020–2026'],
        "Model S": ['Gen 1 2012–2021', 'Refresh 2021–2026'],
        "Model X": ['2015–2026'],
        "Cybertruck": ['2023–2026'],
        },
    "Honda": {
        "Civic": ['Gen 9 2011–2017', 'Gen 10 2016–2022', 'Gen 11 2021–2026'],
        "Jazz": ['Gen 2 2008–2015', 'Gen 3 2013–2020', 'Gen 4 2020–2026'],
        "HR-V": ['GH 1998–2006', 'RU 2013–2021', 'RV 2021–2026'],
        "CR-V": ['RE 2006–2012', 'RM 2011–2018', 'RW 2017–2023', 'RS 2023–2026'],
        "ZR-V": ['2023–2026'],
        "e": ['2020–2024'],
        "Accord": ['Gen 8 2008–2015', 'Gen 9 2013–2017', 'Gen 10 2017–2022', 'Gen 11 2023–2026'],
        "NSX": ['NC1 2016–2022'],
        },
    "Mitsubishi": {
        "Space Star": ['2012–2026'],
        "ASX": ['GA 2010–2022', 'New Gen 2023–2026'],
        "Eclipse Cross": ['2017–2026'],
        "Outlander": ['CW 2006–2012', 'GF 2012–2021', 'GN 2021–2026'],
        "L200": ['Series 4 2005–2015', 'Series 5 2014–2019', 'Series 6 2019–2024', 'Series 7 2024–2026'],
        "Colt": ['Z30 2004–2013', 'New Gen 2023–2026'],
        "Pajero": ['V80 2006–2021'],
        },
};

// --- Search Widget Logic ---
function populateBrandOptions() {
    const brandSelect = document.getElementById('filterMarka');
    if (!brandSelect || typeof carData === 'undefined') return;
    
    brandSelect.innerHTML = '<option value="">Çdo markë</option>';
    
    Object.keys(carData).forEach(brand => {
        let opt = document.createElement('option');
        opt.value = brand;
        opt.innerHTML = brand;
        brandSelect.appendChild(opt);
    });
}

function updateYearGenerations(preselect) {
    const markaEl  = document.getElementById('filterMarka');
    const modeliEl = document.getElementById('filterModeli');
    const yearSelect = document.getElementById('filterYear');
    if (!yearSelect) return;

    const marka  = markaEl  ? markaEl.value  : '';
    const modeli = modeliEl ? modeliEl.value : '';

    yearSelect.innerHTML = '<option value="">Gjithë vitet</option>';

    if (marka && modeli && generationData[marka] && generationData[marka][modeli]) {
        // Show generation labels for this model
        generationData[marka][modeli].forEach(gen => {
            const opt = document.createElement('option');
            opt.value = gen;
            opt.textContent = gen;
            if (preselect && opt.value === preselect) opt.selected = true;
            yearSelect.appendChild(opt);
        });
    } else {
        // No model selected — show plain years
        for (let y = 2026; y >= 1990; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (preselect && String(y) === String(preselect)) opt.selected = true;
            yearSelect.appendChild(opt);
        }
    }
}

// --- Brand Slider Functionality ---
function scrollBrands_OLD_DELETE(direction) {
    const grid = document.getElementById('brandsGrid');
    if (!grid) return;
    // Increased scroll amount because the boxes are larger now
    const scrollAmount = 550; 
    grid.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

function updateBrandArrows() {
    const grid = document.getElementById('brandsGrid');
    const leftBtn = document.getElementById('scrollLeft');
    const rightBtn = document.getElementById('scrollRight');

    if (!grid || !leftBtn || !rightBtn) return;

    const atStart = grid.scrollLeft <= 5;
    const atEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 5;

    leftBtn.disabled = atStart;
    leftBtn.style.background = atStart ? '#e8e8e8' : '#111';
    leftBtn.style.color = atStart ? '#bbb' : '#fff';
    leftBtn.style.cursor = atStart ? 'default' : 'pointer';
    leftBtn.style.pointerEvents = atStart ? 'none' : 'auto';

    rightBtn.disabled = atEnd;
    rightBtn.style.background = atEnd ? '#e8e8e8' : '#111';
    rightBtn.style.color = atEnd ? '#bbb' : '#fff';
    rightBtn.style.cursor = atEnd ? 'default' : 'pointer';
    rightBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    populateBrandOptions();
    
    const grid = document.getElementById('brandsGrid');
    const leftBtn = document.getElementById('scrollLeft');
    if (grid) {
        grid.addEventListener('scroll', updateBrandArrows);
        // Immediately set left button to disabled state — no flash on refresh
        if (leftBtn) {
            leftBtn.disabled = true;
            leftBtn.style.background = '#e8e8e8';
            leftBtn.style.color = '#bbb';
            leftBtn.style.cursor = 'default';
            leftBtn.style.pointerEvents = 'none';
        }
        setTimeout(updateBrandArrows, 200);
    }
});
// UPDATED: Scroll exactly 5 brands at a time, snapping cleanly
function scrollBrands(direction) {
    const grid = document.getElementById('brandsGrid');
    if (!grid) return;
    const firstItem = grid.querySelector('.brand-item');
    if (!firstItem) {
        grid.scrollBy({ left: direction * 700, behavior: 'smooth' });
        return;
    }
    const style = window.getComputedStyle(grid);
    const gap = parseFloat(style.gap) || 16;
    const itemWidth = firstItem.getBoundingClientRect().width + gap;
    const scrollAmount = itemWidth * 5;
    const current = grid.scrollLeft;
    const target = direction > 0
        ? Math.ceil((current + 1) / scrollAmount) * scrollAmount
        : Math.floor((current - 1) / scrollAmount) * scrollAmount;
    grid.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
}

// =============================================
// VEHICLES PAGE — init (logic lives here, data comes from window.vehiclesPageData set by Jinja)
// =============================================
function toggleAdvanced() {
    const section = document.getElementById('advancedFilters');
    const label   = document.getElementById('btnMoreLabel');
    if (!section) return;
    if (section.style.maxHeight === '0px' || section.style.maxHeight === '') {
        section.style.maxHeight = '400px';
        section.style.opacity   = '1';
        if (label) label.textContent = 'Më pak filtra';
    } else {
        section.style.maxHeight = '0px';
        section.style.opacity   = '0';
        if (label) label.textContent = 'Më shumë filtra';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Only run on the vehicles page (guard: filterMarka must exist)
    const brandSelect = document.getElementById('filterMarka');
    if (!brandSelect) return;

    const data = window.vehiclesPageData || { marka: '', modeli: '', year_range: '' };

    // Populate brand options
    Object.keys(carData).forEach(brand => {
        const opt = document.createElement('option');
        opt.value = brand;
        opt.textContent = brand;
        if (brand === data.marka) opt.selected = true;
        brandSelect.appendChild(opt);
    });

    // If a brand was already selected, populate its models too
    if (data.marka) {
        populateModels('filterMarka', 'filterModeli', data.modeli);
    }

    // Populate year/generation options, then restore selected value
    updateYearGenerations(data.year_range);
});

// About us section on home.html
document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll-in Animation Observer (Desktop & Mobile)
    const section = document.querySelector('.why-us-section');
    const entryObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            section.classList.add('is-visible');
            entryObserver.disconnect(); // Unobserve once animation triggers
        }
    }, { threshold: 0.2 }); // Triggers when 20% of the section is visible
    
    if (section) entryObserver.observe(section);

    // 2. Mobile Swipe Carousel Observer
    if (window.innerWidth <= 768) {
        const grid = document.querySelector('.why-us-grid');
        const cards = document.querySelectorAll('.why-card');
        
        const carouselObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-slide');
                } else {
                    entry.target.classList.remove('active-slide');
                }
            });
        }, {
            root: grid,
            threshold: 0.6 // Triggers when 60% of a specific card is in the center
        });

        cards.forEach(card => carouselObserver.observe(card));

        // Optional: Automatically scroll to the middle (black) card on load
        setTimeout(() => {
            const middleCard = cards[1];
            grid.scrollTo({
                left: middleCard.offsetLeft - (grid.clientWidth / 2) + (middleCard.clientWidth / 2),
                behavior: 'smooth'
            });
        }, 800); // Wait for entry animations to finish before centering
    }
});