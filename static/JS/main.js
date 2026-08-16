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

// --- Hamburger ---
function toggleMobileNav() {
    const nav = document.querySelector('nav');
    const hamburger = document.getElementById('hamburgerBtn');
    nav.classList.toggle('open');
    hamburger.classList.toggle('open');
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
    "Volkswagen": ["Polo", "Golf", "Jetta", "Passat", "Arteon", "Caddy", "Tiguan", "Touareg", "Touran", "Sharan", "ID.3", "ID.4", "ID.5", "ID.7", "T-Cross", "T-Roc", "Bora", "Taigo", "Tayron", "Multivan", "California", "Crafter", "Transporter", "Amarok", "ID. Buzz" ],
    "BMW": ["Seria 1", "Seria 2", "Seria 3", "Seria 4", "Seria 5", "Seria 6", "Seria 7", "Seria 8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "i3", "i4", "i5", "i7",  "iX1", "iX2", "iX3", "iX", "Z1", "Z3", "Z4", "Z8"],
    "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "G-Class", "V-Class", "CLA", "CLE", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "GT", "SL", "EQA", "EQB", "EQE", "EQS", "EQT", "EQV", "Sprinter", "Vito", "Citan" ],
    "Audi": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "e-tron", "TT", "R8"],
    "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Mondeo", "Explorer", "Mustang", "Mustang Mach-E", "Ranger", "Transit", "S-Max", "Galaxy", "EcoSport", "Edge", "Bronco", "Expedition", "Courier", "Connect", "Custom"],
    "Toyota": ["Yaris", "Auris", "Corolla", "C-HR", "RAV4", "Aygo", "Prius", "Camry", "Land Cruiser", "Hilux", "bZ4X", "Supra", "Proace"],
    "Skoda": ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq", "Elroq", "Scala", "Citigo", "Yeti", "Rapid"],
    "Renault": ["Clio", "Captur", "Megane", "Austral", "Rafale", "Scenic", "Espace", "Twingo", "Zoe", "Kadjar", "Arkana", "Symbioz", "Kangoo", "Talisman", "Trafic"],
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
    "Smart": ["ForTwo", "ForFour", "Roadster"],
    "Mitsubishi": ["Space Star", "ASX", "Eclipse Cross", "Outlander", "L200", "Colt", "Pajero"]
};

function populateModels(brandSelectId, modelSelectId, preselectedModel = "") {
    const brandSelect = document.getElementById(brandSelectId);
    const modelSelect = document.getElementById(modelSelectId);
   
    if (!brandSelect || !modelSelect) return;

    modelSelect.innerHTML = '<option value="">Modeli</option>';
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

    if (modelSelectId === 'filterModeli') updateYearGenerations();

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
        "Crafter": ['2E/2F 2006-2011', 'FL 2011-2017', 'SY/SZ 2017-2026'],
        "Transporter": ['T4 1990-2003', 'T5 2003-2009', 'T5 FL 2009-2016', 'T6 2016-2019', 'T6 FL 2019-2024', 'T7 2024-2026'],
        "Amarok": ['2H 2010-2016', '2H FL 2016-2022', 'NF 2022–2026'],
        "ID. Buzz": ['T5 2003–2015', 'T6 2015–2024', 'T7 2024–2026'],
    },
    "Audi": {
        "A1": ['2010-2018 (8X)', '2018-2026 (GB)'],
        "A2": ['8Z 1999-2005'],
        "A3": ['8L 1996-2003', '8P 2003-2008', '8P FL 2008-2012', '8V 2012-2020', '8Y 2020-2026'],
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
        "e-tron": ['GE 2018-2023', 'Q8 e-tron 2022-2026'],
        "TT": ['8N 1998-2006', '8J 2006-2014', '8S 2014-2023'],
        "R8": ['Type 42 2006-2015', 'Type 4S 2015-2024'],
    },
    "BMW": {
        "Seria 1": ['E87 2004-2013', 'F20 2011-2019', 'F40 2019-2024', 'F70 2024-2026'],
        "Seria 2": ['F22 2014-2021', 'G42 2021-2026', 'Active Tourer: F45 2014-2021', 'U06 2021-2026'],
        "Seria 3": ['E36 1990-2000', 'E46 1998-2006', 'E90 2005-2011', 'F30 2011-2019', 'G20 2019-2026'],
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
        "Sprinter": ['W905 1995-2006', 'W906 2006-2014', 'W906 FL 2014-2019', 'W907 2019-2026'],
        "Vito": ['W638 1996-2003', 'W639 2003-2010', 'W639 FL 2010-2014', 'W447 2014-2020', 'W447 FL 2020-2026'],
        "Citan": ['W415 2012-2016', 'W415 FL 2016-2021', 'W420 2021-2026'],
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
        "S-Max": ['Mk1 2006-2015', 'Mk2 2015-2023'],
        "Galaxy": ['Mk3 2006-2015', 'Mk4 2015-2023'],
        "EcoSport": ['BV226 2003-2012', 'B515 2012-2023'],
        "Edge": ['Mk1 2007-2015', 'Mk2 2015-2024'],
        "Bronco": ['Mk6 2021-2026'],
        "Expedition": ['Mk1 1997-2003', 'Mk2 2003-2007', 'Mk3 2007-2018', 'Mk4 2018-2025', 'Mk5 2025-2026'],
        "Ranger": ['MK1 1998-2006', 'MK2 2006-2009', 'MK2 FL 2009-2011', 'MK3 2011-2022', 'MK4 2022-2026'],
        "Courier": ['Mk1 2014-2023', 'Mk2 2023-2026'],
        "Connect": ['Mk1 2007-2009', 'Mk1 FL 2009-2012', 'Mk2 2012-2019', 'Mk2 FL 2019-2021', 'Mk3 2021-2026'],
        "Custom": ['Mk1 2012-2023', 'Mk2 2023-2026'],
        "Transit": ['Mk3 2000-2006', 'Mk3 FL 2006-2014', 'MK4 2014-2020', '2020-2026'],
        },
    "Toyota": {
        "Auris": ['E150 2006-2012', 'E180 2012-2018', 'E210 2018-2026'],
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
        "Trafic": ['MK2 2001-2014', 'MK3 2014-2021', 'MK3 FL 2021-2026'],
        },
    "Fiat": {
        "500": ['Gen 2 2007-2024', '500e 2020-2026'],
        "500e": ['2020-2026'],
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
        "Cooper": ['R50/53 2001-2006', 'R56 2006-2013', 'F56 2014-2024', 'F66/J01 2024-2026'],
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
    "Smart": {
        "ForTwo": ['W450 1998-2007', 'W451 2007-2014', 'W453 2014-2024'],
        "ForFour": ['W454 2004-2006', 'W453 2014-2024'],
        "Roadster": ['W452 2003-2005'],
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

    yearSelect.innerHTML = '<option value="">Çdo Vit</option>';

    if (marka && modeli) {
        yearSelect.innerHTML = '<option value="">Viti</option>';
        const generations = generationData[marka] && generationData[marka][modeli];

        if (!generations) return;

        generations.forEach(gen => {
            const opt = document.createElement('option');
            opt.value = gen;
            opt.textContent = gen;
            if (preselect && opt.value === preselect) opt.selected = true;
            yearSelect.appendChild(opt);
        });
    }
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
    updateYearGenerations();
   
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
    // Only run on the vehicles page; the home page initializes its own search form.
    const filterForm = document.getElementById('filterForm');
    if (!filterForm) return;

    const brandSelect = document.getElementById('filterMarka');

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

// Block browser zoom gestures and keyboard shortcuts while preserving page scrolling.
['gesturestart', 'gesturechange', 'gestureend', 'dblclick'].forEach(eventName => {
    document.addEventListener(eventName, event => event.preventDefault(), { passive: false });
});

document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '_', '0'].includes(event.key)) {
        event.preventDefault();
    }
});

// About us section on home.html
document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.why-us-section');
    const grid = document.querySelector('.why-us-grid');
    const cards = document.querySelectorAll('.why-card');

    // 1. Instantly center the middle card on mobile before anything else happens
    if (window.innerWidth <= 768 && cards.length >= 3) {
        const middleCard = cards[1];
        // Calculate exact center position and apply instantly
        grid.scrollLeft = middleCard.offsetLeft - (grid.clientWidth / 2) + (middleCard.clientWidth / 2);
    }

    // 2. Scroll-in Animation Observer
    const entryObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            section.classList.add('is-visible');
           
            // Wait for the 1.2s entrance animation + 0.2s delay to finish,
            // then switch to snappy hover/swipe transitions
            setTimeout(() => {
                section.classList.add('animations-done');
            }, 1400);

            entryObserver.disconnect();
        }
    }, { threshold: 0.2 });
   
    if (section) entryObserver.observe(section);

    // 3. Mobile Swipe Carousel Observer
    if (window.innerWidth <= 768) {
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
            threshold: 0.6
        });

        cards.forEach(card => carouselObserver.observe(card));
    }
});


// BLOG POST PAGE

function copyPostLink(btn) {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const icon = btn.querySelector('i');

        icon.className = 'fa-solid fa-check';
        btn.classList.add('btn-copy-success');

        setTimeout(() => {
            icon.className = 'fa-solid fa-link';
            btn.classList.remove('btn-copy-success');
        }, 2000);
    });
}


// ADD CAR PAGE

const fileInput = document.getElementById('photos_input');
const previewContainer = document.getElementById('photo-preview');
let persistentFiles = [];
const MAX_PHOTOS = 6;

function refreshCountMsg() {
    const countMsg = document.getElementById('photo-count-msg');
    const photosLabel = document.getElementById('photos_label');

    if (persistentFiles.length >= MAX_PHOTOS) {
        countMsg.textContent = 'Keni arritur limitin e 6 fotove.';
        countMsg.style.display = 'block';
        photosLabel.classList.add('upload-disabled');
        fileInput.disabled = true;
    } else {
        countMsg.style.display = 'none';
        photosLabel.classList.remove('upload-disabled');
        fileInput.disabled = false;
    }
}

if (fileInput) {
    fileInput.addEventListener('change', function () {
        Array.from(fileInput.files).forEach(file => {
            if (persistentFiles.length >= MAX_PHOTOS) return;
            if (persistentFiles.some(f => f.name === file.name && f.size === file.size)) return;

            persistentFiles.push(file);
            const reader = new FileReader();

            reader.onload = e => {
                const div = document.createElement('div');
                div.className = 'photo-preview-item';

                const img = document.createElement('img');
                img.src = e.target.result;

                const removeBtn = document.createElement('span');
                removeBtn.innerHTML = '&times;';
                removeBtn.className = 'photo-remove-btn';

                removeBtn.onclick = () => {
                    persistentFiles = persistentFiles.filter(f => f !== file);
                    div.remove();
                    refreshCountMsg();
                };

                div.appendChild(img);
                div.appendChild(removeBtn);
                previewContainer.appendChild(div);
                refreshCountMsg();
            };
            reader.readAsDataURL(file);
        });
        fileInput.value = '';
        refreshCountMsg();
    });
}

// Intercept form submit — build FormData manually so persistentFiles are always sent.
const carForm = document.getElementById('carForm');
if (carForm) {
    carForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (persistentFiles.length === 0) {
            const countMsg = document.getElementById('photo-count-msg');
            countMsg.textContent = 'Ju lutem shtoni te pakten nje foto.';
            countMsg.style.display = 'block';
            countMsg.style.color = '#e74c3c';
            countMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const submitBtn = carForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Duke postuar...';
        }

        const fd = new FormData(carForm);
        fd.delete('photos_input');
        persistentFiles.forEach(f => fd.append('photos', f));

        fetch(carForm.action, {
            method: 'POST',
            body: fd,
        }).then(res => {
            if (res.redirected) {
                window.location.href = res.url;
            } else if (res.ok) {
                window.location.href = res.url || '/profile';
            } else {
                res.text().then(html => {
                    document.open(); document.write(html); document.close();
                });
            }
        }).catch(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Posto Mjetin';
            }
            alert('Ndodhi nje gabim. Provoni perseri.');
        });
    });
}

// --- Add-Car: Generation auto-detect from year input ---
function updateGenerazione() {
    const markaEl = document.getElementById('filterMarka');
    const modeliEl = document.getElementById('addModeli');
    const vitiEl = document.getElementById('addViti');
    const genInput = document.getElementById('addGenerazione');
    const genLabel = document.getElementById('genLabel');

    if (!markaEl || !modeliEl || !vitiEl || !genInput || !genLabel) return;

    const marka = markaEl.value;
    const modeli = modeliEl.value;
    const year = parseInt(vitiEl.value);

    genInput.value = '';
    genLabel.textContent = '';
    genLabel.style.color = '';

    if (!marka || !modeli || !year || year < 1990 || year > 2026) return;

    const gens = generationData[marka] && generationData[marka][modeli];
    if (!gens) {
        genLabel.textContent = 'Nuk u gjet gjenerate për këtë model.';
        genLabel.style.color = '#e67e22';
        return;
    }

    let matched = null;
    for (const gen of gens) {
        // Extract years from strings like "Mk7 2012–2020" or "B8 2014-2023"
        const numbers = gen.match(/\d{4}/g);
        if (!numbers || numbers.length < 2) continue;
        const y1 = parseInt(numbers[numbers.length - 2]);
        const y2 = parseInt(numbers[numbers.length - 1]);
        if (year >= y1 && year <= y2) {
            matched = gen;
            break;
        }
    }

    if (matched) {
        genInput.value = matched;
        genLabel.textContent = '✓ Gjenerata: ' + matched;
        genLabel.style.color = '#27ae60';
    } else {
        genLabel.textContent = 'Nuk u gjet gjenerata për vitin ' + year + '.';
        genLabel.style.color = '#e67e22';
    }
}


// PROFILE PAGE

function switchProfileTab(tabId) {
        document.querySelectorAll('.profile-tab-content').forEach(el => {
            el.classList.remove('active-tab');
            el.classList.add('hidden-element');
        });
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
       
        const targetTab = document.getElementById(tabId + '-tab');
        targetTab.classList.remove('hidden-element');
        setTimeout(() => targetTab.classList.add('active-tab'), 10);
       
        event.currentTarget.classList.add('active');
}


// ADMIN PAGE

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(el => {
        el.classList.remove('active-tab');
        el.classList.add('hidden-element');
    });
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
   
    const targetTab = document.getElementById(tabId + '-tab');
    targetTab.classList.remove('hidden-element');
    setTimeout(() => targetTab.classList.add('active-tab'), 10);
   
    event.currentTarget.classList.add('active');
}

function openEditModal(type, id, marka, modeli, viti, cmimi) {
    document.getElementById('editCarModal').style.display = 'flex';
    document.getElementById('editCarForm').action = '/admin/car/edit/' + id;
    document.getElementById('editCarMarka').value = marka;
    document.getElementById('editCarModeli').value = modeli;
    document.getElementById('editCarViti').value = viti !== 'None' ? viti : '';
    document.getElementById('editCarCmimi').value = cmimi !== 'None' ? cmimi : '';
}

function openAddBlogModal() {
    document.getElementById('blogModal').style.display = 'flex';
    document.getElementById('blogModalTitle').innerText = 'Shto Blog';
    document.getElementById('blogForm').action = '/admin/blog/add';
    document.getElementById('blogForm').reset();
    document.getElementById('blogImage').style.display = 'block';
}

function openEditBlogModal(id, title, category, content) {
    document.getElementById('blogModal').style.display = 'flex';
    document.getElementById('blogModalTitle').innerText = 'Edito Blog';
    document.getElementById('blogForm').action = '/admin/blog/edit/' + id;
    document.getElementById('blogTitle').value = title;
    document.getElementById('blogCategory').value = category;
    document.getElementById('blogContent').value = content;
    document.getElementById('blogImage').style.display = 'none';
}

function openEditUserModal(id, first, last, email, isAdmin, isVerified) {
    document.getElementById('editUserModal').style.display = 'flex';
    document.getElementById('editUserForm').action = '/admin/user/edit/' + id;
    document.getElementById('editUserFirst').value = first;
    document.getElementById('editUserLast').value = last;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserAdmin').checked = isAdmin;
    document.getElementById('editUserVerified').checked = isVerified;
}


// VALUATION PAGE

const engineData = {
    "Audi": {
        "A1": ["1.0 TFSI (95hp)", "1.2 TFSI (86hp)", "1.4 TFSI (125hp)", "1.6 TDI (90hp)", "1.6 TDI (116hp)", "2.0 TDI (136hp)", "30 TFSI (116hp)", "35 TFSI (150hp)", "25 TFSI (95hp)"],
        "A3": ["1.6 (102hp)", "1.8T (150hp)", "1.8T (180hp)", "2.0 TDI (140hp)", "2.0 TDI (170hp)", "1.4 TFSI (125hp)", "1.4 TFSI (140hp)", "2.0 TFSI (200hp)", "1.6 TDI (110hp)", "35 TFSI (150hp)", "40 TFSI (190hp)", "30 TDI (116hp)", "35 TDI (150hp)", "S3 (310hp)", "e-tron 45 TFSI e"],
        "A4": ["1.8T (150hp)", "1.8T (163hp)", "2.0 TDI (120hp)", "2.0 TDI (140hp)", "2.0 TDI (170hp)", "2.0 TFSI (200hp)", "2.0 TFSI (211hp)", "3.0 TDI (240hp)", "2.0 TDI (190hp)", "35 TFSI (150hp)", "40 TFSI (190hp)", "40 TDI (190hp)", "45 TFSI (245hp)", "S4 (347hp)"],
        "A5": ["2.0 TDI (143hp)", "2.0 TDI (177hp)", "2.0 TFSI (177hp)", "2.0 TFSI (211hp)", "3.0 TDI (240hp)", "35 TFSI (150hp)", "40 TDI (190hp)", "45 TFSI (245hp)", "S5 (354hp)"],
        "A6": ["2.0 TDI (140hp)", "2.0 TDI (170hp)", "2.7 TDI (180hp)", "3.0 TDI (204hp)", "2.0 TFSI (180hp)", "35 TFSI (150hp)", "40 TDI (204hp)", "45 TFSI (245hp)", "55 TFSI (340hp)", "S6 (450hp)"],
        "Q3": ["2.0 TDI (140hp)", "2.0 TFSI (170hp)", "35 TFSI (150hp)", "35 TDI (150hp)", "45 TFSI (230hp)"],
        "Q5": ["2.0 TDI (143hp)", "2.0 TDI (177hp)", "2.0 TFSI (211hp)", "35 TDI (163hp)", "40 TDI (204hp)", "45 TFSI (265hp)", "55 TFSI e (367hp)"],
        "Q7": ["3.0 TDI (245hp)", "3.0 TDI (272hp)", "55 TFSI (340hp)", "45 TDI (231hp)"],
        "TT": ["1.8T (180hp)", "2.0 TFSI (211hp)", "2.0 TDI (170hp)", "2.0 TFSI (230hp)", "TTS 2.0 TFSI (272hp)", "TTRS 2.5 TFSI (400hp)"],
    },
    "BMW": {
        "Seria 1": ["116d (116hp)", "118d (143hp)", "118d (150hp)", "120d (163hp)", "120d (184hp)", "116i (102hp)", "118i (136hp)", "120i (156hp)", "M135i (265hp)", "M135i xDrive (306hp)"],
        "Seria 3": ["316d (116hp)", "318d (143hp)", "318d (150hp)", "320d (163hp)", "320d (184hp)", "318i (143hp)", "320i (156hp)", "325i (218hp)", "330i (258hp)", "335i (306hp)", "M3 (431hp)", "M3 Competition (510hp)", "330e (292hp)"],
        "Seria 5": ["520d (163hp)", "520d (190hp)", "525d (218hp)", "530d (258hp)", "518d (143hp)", "520i (184hp)", "528i (245hp)", "530i (252hp)", "540i (333hp)", "M5 (600hp)", "530e (252hp)"],
        "X3": ["xDrive18d (150hp)", "xDrive20d (163hp)", "xDrive20d (190hp)", "xDrive25d (231hp)", "xDrive30d (265hp)", "sDrive18i (152hp)", "xDrive20i (184hp)", "xDrive30i (252hp)", "M40i (360hp)", "xDrive30e (292hp)"],
        "X5": ["xDrive25d (231hp)", "xDrive30d (265hp)", "xDrive40d (313hp)", "xDrive30i (252hp)", "xDrive40i (340hp)", "xDrive45e (394hp)", "M50i (530hp)", "M Competition (625hp)"],
    },
    "Mercedes-Benz": {
        "A-Class": ["A 160 (102hp)", "A 180 (122hp)", "A 200 (150hp)", "A 220 (190hp)", "A 180d (116hp)", "A 200d (150hp)", "AMG A 35 (306hp)", "AMG A 45 S (421hp)"],
        "C-Class": ["C 180 (122hp)", "C 200 (163hp)", "C 220d (170hp)", "C 220d (194hp)", "C 200d (150hp)", "C 220 CDI (170hp)", "C 250 CDI (204hp)", "C 300 (258hp)", "AMG C 43 (390hp)", "AMG C 63 (476hp)", "C 300e (320hp)"],
        "E-Class": ["E 200 (163hp)", "E 220d (194hp)", "E 220d (200hp)", "E 200d (150hp)", "E 220 CDI (170hp)", "E 300 (258hp)", "E 350d (258hp)", "AMG E 43 (401hp)", "AMG E 63 S (612hp)", "E 300e (320hp)"],
        "GLC": ["GLC 200 (197hp)", "GLC 220d (194hp)", "GLC 300 (258hp)", "GLC 300d (245hp)", "AMG GLC 43 (390hp)", "GLC 300e (333hp)"],
    },
    "Volkswagen": {
        "Golf": ["1.4 (80hp)", "1.4 TSI (122hp)", "1.4 TSI (125hp)", "1.6 (102hp)", "1.6 TDI (90hp)", "1.6 TDI (105hp)", "1.9 TDI (90hp)", "1.9 TDI (105hp)", "2.0 TDI (136hp)", "2.0 TDI (150hp)", "2.0 TDI (184hp)", "1.5 TSI (130hp)", "1.5 TSI (150hp)", "2.0 TSI (190hp)", "2.0 TSI (245hp)", "GTI 2.0 TSI (300hp)", "R 2.0 TSI (333hp)", "GTE 1.4 TSI e (245hp)", "eGolf (136hp)"],
        "Passat": ["1.6 TDI (105hp)", "2.0 TDI (140hp)", "2.0 TDI (150hp)", "2.0 TDI (170hp)", "2.0 TDI (190hp)", "1.4 TSI (125hp)", "1.8 TSI (160hp)", "2.0 TSI (280hp)", "1.5 TSI (150hp)", "GTE 1.4 TSI e (218hp)"],
        "Tiguan": ["1.4 TSI (122hp)", "1.4 TSI (150hp)", "2.0 TDI (140hp)", "2.0 TDI (150hp)", "2.0 TDI (190hp)", "2.0 TSI (180hp)", "2.0 TSI (220hp)", "1.5 TSI (130hp)", "1.5 TSI (150hp)", "eHybrid (272hp)"],
        "Polo": ["1.2 (70hp)", "1.4 (80hp)", "1.2 TSI (90hp)", "1.4 TSI (122hp)", "1.6 TDI (80hp)", "1.6 TDI (90hp)", "1.0 MPI (65hp)", "1.0 TSI (95hp)", "1.0 TSI (110hp)", "GTI 2.0 TSI (209hp)"],
    },
    "Ford": {
        "Focus": ["1.6 (100hp)", "1.8 TDCi (115hp)", "2.0 TDCi (136hp)", "1.5 TDCi (95hp)", "1.5 TDCi (120hp)", "1.0 EcoBoost (100hp)", "1.0 EcoBoost (125hp)", "1.5 EcoBoost (150hp)", "2.0 EcoBoost (250hp)", "ST 2.0 EcoBoost (280hp)"],
        "Fiesta": ["1.25 (82hp)", "1.4 TDCi (70hp)", "1.6 TDCi (95hp)", "1.0 EcoBoost (100hp)", "1.0 EcoBoost (125hp)", "ST 1.5 EcoBoost (200hp)"],
        "Kuga": ["1.5 EcoBoost (150hp)", "2.0 TDCi (150hp)", "2.0 TDCi (180hp)", "2.5 PHEV (225hp)"],
    },
    "Toyota": {
        "Auris": ["1.4 D-4D (90hp)", "2.0 D-4D (126hp)", "2.2 D-CAT (177hp)", "1.4 VVT-i (97hp)", "1.6 Dual VVT-i (124hp)", "1.8 Dual VVT-i (136hp)"],
        "Corolla": ["1.6 (132hp)", "1.8 (140hp)", "2.0 (180hp)", "1.8 Hybrid (122hp)", "2.0 Hybrid (196hp)", "GR Sport 2.0 Hybrid"],
        "Yaris": ["1.0 (69hp)", "1.33 (99hp)", "1.5 Hybrid (100hp)", "GR (261hp)"],
        "RAV4": ["2.0 (150hp)", "2.2 D-4D (150hp)", "2.5 Hybrid (222hp)", "2.5 PHEV (306hp)"],
    },
    "Skoda": {
        "Octavia": ["1.6 (75hp)", "1.6 MPI (102hp)", "1.8T (150hp)", "1.9 TDI (90hp)", "1.9 TDI (105hp)", "2.0 TDI (140hp)", "2.0 TDI (150hp)", "2.0 TDI (184hp)", "1.4 TSI (140hp)", "1.5 TSI (150hp)", "2.0 TSI (230hp)", "vRS 2.0 TSI (245hp)", "2.0 TDI RS (200hp)", "1.4 TSI e (245hp)"],
        "Fabia": ["1.2 (70hp)", "1.4 (85hp)", "1.6 TDI (90hp)", "1.6 TDI (105hp)", "1.0 MPI (65hp)", "1.0 TSI (95hp)", "1.5 TSI (150hp)"],
        "Superb": ["1.8 TSI (160hp)", "2.0 TDI (140hp)", "2.0 TDI (150hp)", "2.0 TDI (190hp)", "2.0 TSI (220hp)", "1.5 TSI (150hp)", "2.0 TSI (272hp)"],
    },
    "Renault": {
        "Clio": ["1.2 (75hp)", "1.6 (112hp)", "1.5 dCi (75hp)", "1.5 dCi (90hp)", "1.5 dCi (110hp)", "0.9 TCe (90hp)", "1.0 TCe (100hp)", "1.3 TCe (130hp)", "E-Tech Hybrid (140hp)", "RS 2.0 (200hp)"],
        "Megane": ["1.6 (110hp)", "1.5 dCi (90hp)", "1.5 dCi (110hp)", "2.0 dCi (150hp)", "1.3 TCe (140hp)", "1.8 TCe (280hp) RS", "E-Tech 160"],
    },
    "Hyundai": {
        "Tucson": ["1.6 GDI (135hp)", "2.0 MPi (155hp)", "2.0 CRDi (136hp)", "2.0 CRDi (185hp)", "1.6 T-GDI (177hp)", "1.6 T-GDI PHEV (265hp)", "1.6 HEV (230hp)"],
        "i30": ["1.4 (100hp)", "1.6 CRDi (90hp)", "1.6 CRDi (110hp)", "1.0 T-GDI (120hp)", "1.4 T-GDI (140hp)", "1.6 T-GDI (204hp) N", "2.0 T-GDI (280hp) N"],
    },
    "Kia": {
        "Sportage": ["1.6 GDI (135hp)", "2.0 MPi (163hp)", "2.0 CRDi (136hp)", "1.6 T-GDI (177hp)", "1.6 T-GDI HEV (230hp)", "1.6 T-GDI PHEV (265hp)"],
        "Ceed": ["1.4 (100hp)", "1.6 CRDi (90hp)", "1.6 CRDi (136hp)", "1.0 T-GDI (120hp)", "1.4 T-GDI (140hp)", "ProCeed GT 1.6 T-GDI (204hp)"],
    },
    "Opel": {
        "Astra": ["1.4 (90hp)", "1.6 (115hp)", "1.6 CDTI (110hp)", "2.0 CDTI (165hp)", "1.0 (105hp)", "1.2 (110hp)", "1.4 Turbo (150hp)", "1.5 CDTI (122hp)", "OPC 2.0 Turbo (280hp)"],
        "Corsa": ["1.2 (70hp)", "1.4 (100hp)", "1.3 CDTI (75hp)", "1.5 CDTI (100hp)", "1.0 (90hp)", "1.2 (100hp)", "1.2 Turbo (130hp)", "OPC 1.6 Turbo (207hp)"],
    },
    "Fiat": {
        "500": ["1.2 (69hp)", "1.4 (100hp)", "0.9 TwinAir (85hp)", "0.9 TwinAir (105hp)", "1.3 Multijet (95hp)", "Abarth 1.4 Turbo (145hp)", "Abarth 1.4 Turbo (165hp)"],
        "Panda": ["1.2 (69hp)", "0.9 TwinAir (65hp)", "0.9 TwinAir (85hp)", "1.3 Multijet (75hp)", "Hybrid 1.0 (70hp)"],
    },
    "Dacia": {
        "Sandero": ["1.2 (75hp)", "0.9 TCe (90hp)", "1.6 MPI (90hp)", "1.5 dCi (75hp)", "1.5 dCi (90hp)", "TCe 90 (91hp)", "TCe 100 (101hp)"],
        "Duster": ["1.6 SCe (115hp)", "1.3 TCe (130hp)", "1.5 dCi (110hp)", "1.5 Blue dCi (115hp)", "TCe 150 4x4"],
    },
    "Seat": {
        "Leon": ["1.6 (102hp)", "1.8T (150hp)", "1.9 TDI (105hp)", "2.0 TDI (140hp)", "2.0 TDI (150hp)", "1.4 TSI (125hp)", "1.5 TSI (130hr)", "1.5 TSI (150hp)", "2.0 TSI (190hp)", "FR 2.0 TSI (300hp)", "Cupra 2.0 TSI (310hp)"],
        "Ibiza": ["1.2 (70hp)", "1.4 (85hp)", "1.6 TDI (90hp)", "1.0 MPI (80hp)", "1.0 TSI (95hp)", "1.0 TSI (115hp)", "FR 1.5 TSI (150hp)"],
    },
    "Peugeot": {
        "308": ["1.6 (120hp)", "1.6 THP (156hp)", "1.4 HDi (70hp)", "1.6 HDi (90hp)", "1.6 HDi (112hp)", "1.2 PureTech (110hp)", "1.2 PureTech (130hp)", "1.5 BlueHDi (130hp)", "2.0 BlueHDi (150hp)", "GT 1.6 PHEV (225hp)"],
        "2008": ["1.2 PureTech (100hp)", "1.2 PureTech (130hp)", "1.5 BlueHDi (110hp)", "EV (136hp)", "EV (156hp)"],
    },
    "Citroen": {
        "C3": ["1.2 (82hp)", "1.4 VTi (90hp)", "1.6 HDi (90hp)", "1.2 PureTech (83hp)", "1.2 PureTech (110hp)"],
        "C4": ["1.6 VTi (120hp)", "1.6 HDi (92hp)", "2.0 HDi (150hp)", "1.2 PureTech (130hp)", "1.5 BlueHDi (130hp)", "ë-C4 EV (136hp)"],
    },
    "Mazda": {
        "Mazda3": ["1.6 (105hp)", "2.0 (150hp)", "1.6 MZR-CD (105hp)", "2.2 MZR-CD (150hp)", "2.0 Skyactiv-G (120hp)", "2.0 Skyactiv-G (165hp)", "1.8 Skyactiv-D (116hp)", "2.0 e-Skyactiv X (186hp)"],
        "CX-5": ["2.0 Skyactiv-G (160hp)", "2.0 Skyactiv-G (165hp)", "2.2 Skyactiv-D (150hp)", "2.2 Skyactiv-D (175hp)", "2.5 Skyactiv-G (194hp)"],
    },
    "Volvo": {
        "XC60": ["D3 (150hp)", "D4 (181hp)", "D5 (235hp)", "T5 (250hp)", "T6 (320hp)", "B4 (197hp)", "B5 (250hp)", "B6 (300hp)", "T6 PHEV (340hp)", "T8 PHEV (400hp)"],
        "XC40": ["T3 (163hp)", "T4 (211hp)", "T5 (247hp)", "B3 (163hp)", "B4 (197hp)", "EV (231hp)", "EV (408hp)"],
    },
    "Land Rover": {
        "Range Rover": ["3.0 SDV6 (275hp)", "4.4 SDV8 (339hp)", "3.0 D300 (300hp)", "4.4 P530 (530hp)", "3.0 P400 PHEV (440hp)"],
        "Range Rover Sport": ["3.0 SDV6 (249hp)", "3.0 TDV6 (306hp)", "3.0 D300 (300hp)", "4.4 P530 (530hp)", "SVR 5.0 (575hp)"],
        "Defender": ["2.0 P200 (200hp)", "2.0 P300 (300hp)", "3.0 P400 (400hp)", "3.0 D250 (250hp)", "3.0 D300 (300hp)"],
    },
    "Jeep": {
        "Grand Cherokee": ["3.0 CRD (250hp)", "3.6 Pentastar (286hp)", "5.7 HEMI (360hp)", "3.0 V6 EcoDiesel (264hp)", "4xe PHEV (375hp)"],
        "Renegade": ["1.0 GSE T3 (120hp)", "1.3 GSE T4 (150hp)", "1.3 GSE T4 (180hp)", "1.6 E-Torq (110hp)", "2.0 MultiJet (120hp)", "4xe PHEV (240hp)"],
    },
    "Tesla": {
        "Model 3": ["Standard Range (283hp)", "Long Range AWD (480hp)", "Performance (460hp)"],
        "Model Y": ["RWD (299hp)", "Long Range AWD (514hp)", "Performance (514hp)"],
        "Model S": ["Long Range (670hp)", "Plaid (1020hp)"],
    },
    "Honda": {
        "Civic": ["1.4 (90hp)", "1.6 (125hp)", "2.2 CDTi (140hp)", "1.0 VTEC Turbo (129hp)", "1.5 VTEC Turbo (182hp)", "e:HEV 2.0 Hybrid (184hp)", "Type R 2.0 VTEC Turbo (329hp)"],
        "CR-V": ["1.6 i-DTEC (120hp)", "2.0 i-VTEC (155hp)", "1.5 VTEC Turbo (193hp)", "e:HEV 2.0 Hybrid (184hp)", "e:PHEV (325hp)"],
    },
    "Mitsubishi": {
        "Outlander": ["2.0 (150hp)", "2.2 DID (150hp)", "2.4 PHEV (224hp)", "2.5 (165hp)"],
        "Eclipse Cross": ["1.5 Turbo (163hp)", "2.4 PHEV (188hp)"],
    },
    "Nissan": {
        "Qashqai": ["1.6 (115hp)", "2.0 (141hp)", "1.5 dCi (110hp)", "1.5 dCi (130hp)", "1.2 DIG-T (115hp)", "1.3 DIG-T (140hp)", "1.3 DIG-T 160hp", "e-POWER (190hp)"],
        "X-Trail": ["1.6 dCi (130hp)", "2.0 (150hp)", "2.5 (170hp)", "1.5 e-POWER (213hp)"],
    },
    "Suzuki": {
        "Vitara": ["1.4 BoosterJet (140hp)", "1.6 DDiS (120hp)", "1.0 BoosterJet (112hp)", "1.4 Hybrid (129hp)"],
        "Swift": ["1.2 (94hp)", "1.0 BoosterJet (111hp)", "1.2 Hybrid (83hp)", "Sport 1.4 Turbo (129hp)"],
    },
    "Mini": {
        "Cooper": ["One 1.2 (102hp)", "Cooper 1.5 (136hp)", "Cooper S 2.0 (192hp)", "Cooper SD 2.0 (150hp)", "John Cooper Works 2.0 (231hp)"],
        "Countryman": ["Cooper 1.5 (136hp)", "Cooper S 2.0 (192hp)", "Cooper D 2.0 (116hp)", "Cooper SD 2.0 (190hp)", "JCW 2.0 (306hp)", "Cooper SE (313hp)"],
    },
    "Alfa Romeo": {
        "Giulia": ["2.0 Turbo (200hp)", "2.0 Turbo (280hp)", "2.2 JTD (160hp)", "2.2 JTD (190hp)", "Quadrifoglio 2.9 V6 (510hp)"],
        "Stelvio": ["2.0 Turbo (200hp)", "2.0 Turbo (280hp)", "2.2 JTD (160hp)", "2.2 JTD (190hp)", "Quadrifoglio 2.9 V6 (520hp)"],
        "Giulietta": ["1.4 MA (78hp)", "1.4 TB (120hp)", "1.4 TB (170hp)", "1.6 JTDm (105hp)", "2.0 JTDm (140hp)", "1.75 TB (240hp)"],
    },
    "Lexus": {
        "NX": ["NX 200t 2.0T (238hp)", "NX 300h Hybrid (197hp)", "NX 350 (275hp)", "NX 450h+ PHEV (309hp)"],
        "RX": ["RX 300 2.0T (238hp)", "RX 350 (275hp)", "RX 450h Hybrid (308hp)", "RX 500h F Sport (371hp)"],
    },
    "BYD": {
        "Atto 3": ["EV (204hp)", "EV (286hp)"],
        "Seal": ["RWD EV (313hp)", "AWD EV (523hp)"],
        "Han": ["EV RWD (469hp)", "EV AWD (523hp)"],
    },
};

// Exterior colors with paint type
const exteriorColors = [
    { label: "E Bardhë Perla", val: "white-pearl", type: "pearl" },
    { label: "E Zezë Perla", val: "black-pearl", type: "pearl" },
    { label: "Argjendtë Metalike", val: "silver-metallic", type: "metallic" },
    { label: "Gri Metalike", val: "grey-metallic", type: "metallic" },
    { label: "E Zezë Metalike", val: "black-metallic", type: "metallic" },
    { label: "E Bardhë Metalike", val: "white-metallic", type: "metallic" },
    { label: "Blu Metalike", val: "blue-metallic", type: "metallic" },
    { label: "E Kuqe Metalike", val: "red-metallic", type: "metallic" },
    { label: "Kafe Metalike", val: "brown-metallic", type: "metallic" },
    { label: "Jeshile Metalike", val: "green-metallic", type: "metallic" },
    { label: "Portokalli Metalike", val: "orange-metallic", type: "metallic" },
    { label: "E Verdhë Metalike", val: "yellow-metallic", type: "metallic" },
    { label: "E Bardhë Solid", val: "white-solid", type: "solid" },
    { label: "E Zezë Solid", val: "black-solid", type: "solid" },
    { label: "Gri Solid", val: "grey-solid", type: "solid" },
    { label: "Blu Solid", val: "blue-solid", type: "solid" },
    { label: "E Kuqe Solid", val: "red-solid", type: "solid" },
    { label: "Jeshile Solid", val: "green-solid", type: "solid" },
    { label: "Portokalli Solid", val: "orange-solid", type: "solid" },
    { label: "E Verdhë Solid", val: "yellow-solid", type: "solid" },
    { label: "Tjetër", val: "other-solid", type: "solid" },
];

// Interior colors
const interiorColors = [
    { label: "Kanjak (Cognac)", val: "cognac" },
    { label: "E Zezë", val: "black" },
    { label: "E Bardhë / Krem", val: "white" },
    { label: "Bezhë", val: "beige" },
    { label: "E Kuqe", val: "red" },
    { label: "Blu", val: "blue" },
    { label: "Jeshile", val: "green" },
    { label: "Gri", val: "grey" },
];

// Common options list
const commonOptions = [
    { name: "Navigacion", weight: 1.5 },
    { name: "Kamera Prapa", weight: 1.0 },
    { name: "Sensors Parkim", weight: 0.8 },
    { name: "Sedilje të Ngrohura", weight: 1.0 },
    { name: "Sedilje Elektrike", weight: 1.5 },
    { name: "Sedilje Masazh", weight: 2.0 },
    { name: "Çati Panoramike", weight: 2.0 },
    { name: "Xhama Elektrike", weight: 0.5 },
    { name: "Pasqyra Elektrike", weight: 0.5 },
    { name: "Bluetooth / Carplay / Android Auto", weight: 0.8 },
    { name: "Cruise Control", weight: 0.8 },
    { name: "Adaptive Cruise Control", weight: 2.0 },
    { name: "Lane Assist", weight: 1.5 },
    { name: "Çelës pa dorë (Keyless)", weight: 1.5 },
    { name: "Nis pa çelës (Start/Stop buton)", weight: 0.8 },
    { name: "Drita LED / Xenon", weight: 1.5 },
    { name: "Rrathë Aliazh", weight: 1.0 },
    { name: "Rrathë Sport / 19+ Inç", weight: 2.0 },
    { name: "Sistem Zëri Premium", weight: 1.5 },
    { name: "Head-Up Display", weight: 2.0 },
    { name: "360° Kamera", weight: 2.0 },
    { name: "Matrix / Laser Lights", weight: 2.5 },
    { name: "Mbushje Wireless", weight: 0.8 },
    { name: "Trunk Automatik", weight: 1.0 },
    { name: "Tavan Diell / Luk", weight: 1.5 },
    { name: "4x4 / AWD", weight: 2.0 },
    { name: "Sport Pakage / AMG / M-Sport / S-Line", weight: 3.0 },
    { name: "Night Pakage", weight: 1.5 },
    { name: "Garanci Aktive", weight: 3.0 },
    { name: "Service Book Komplet", weight: 2.0 },
];

// Base price ranges by brand tier (EUR).
// In production, this would be fetched from the DB (latest 50 listings per model).
// For now these are indicative fallback ranges.
const basePriceRanges = {
    tier1: { min: 25000, max: 80000, avg: 45000 }, // Tesla, BMW, Mercedes, Audi, Lexus, Land Rover, Volvo
    tier2: { min: 12000, max: 40000, avg: 22000 }, // VW, Toyota, Honda, Skoda, Mazda, Ford, Alfa
    tier3: { min: 6000, max: 25000, avg: 14000 },  // Renault, Hyundai, Kia, Seat, Opel, Citroen, Peugeot, Dacia, Fiat, Skoda, Suzuki, Mitsubishi, Nissan
    tier4: { min: 3000, max: 15000, avg: 8000 },   // Mini, Smart, BYD, Jeep entry
};
const brandTier = {
    "Tesla": "tier1", "BMW": "tier1", "Mercedes-Benz": "tier1", "Audi": "tier1",
    "Lexus": "tier1", "Land Rover": "tier1", "Volvo": "tier1",
    "Volkswagen": "tier2", "Toyota": "tier2", "Honda": "tier2", "Mazda": "tier2",
    "Ford": "tier2", "Alfa Romeo": "tier2", "Jeep": "tier2",
    "Skoda": "tier3", "Renault": "tier3", "Hyundai": "tier3", "Kia": "tier3",
    "Seat": "tier3", "Opel": "tier3", "Citroen": "tier3", "Peugeot": "tier3",
    "Dacia": "tier3", "Fiat": "tier3", "Suzuki": "tier3", "Mitsubishi": "tier3",
    "Nissan": "tier3", "Mini": "tier3", "Smart": "tier4", "BYD": "tier3",
};

// Engine displacement scoring (rough cc extraction)
function getEngineScore(engineLabel, year) {
    if (!engineLabel) return 0;
    const hp = parseInt((engineLabel.match(/\((\d+)hp\)/) || [])[1] || 0);
    const older = year < 2010;
    if (!hp) return 0;
    if (older) {
        // older cars: lower hp = less deduction (big engines cost more to run)
        if (hp > 200) return -3;
        if (hp > 150) return -1;
        return 1;
    } else {
        // newer cars: more hp = more value
        if (hp >= 300) return 5;
        if (hp >= 220) return 3;
        if (hp >= 150) return 1;
        return 0;
    }
}

// Exterior color multiplier
function getExtColorScore(val) {
    const colorMap = {
        "white-pearl": 5, "black-pearl": 5,
        "silver-metallic": 3, "grey-metallic": 3, "black-metallic": 3,
        "white-metallic": 3, "blue-metallic": 3, "red-metallic": 3,
        "brown-metallic": 2, "green-metallic": 2, "orange-metallic": 2, "yellow-metallic": 2,
        "white-solid": 1, "black-solid": 1,
        "grey-solid": 0, "blue-solid": 0, "red-solid": 0,
        "green-solid": -1, "orange-solid": -1, "yellow-solid": -1, "other-solid": -2,
    };
    return colorMap[val] || 0;
}

// Interior color multiplier
function getIntColorScore(val) {
    const map = { "cognac": 5, "black": 2, "white": 2, "beige": 2, "red": 0, "blue": 0, "green": 0, "grey": 0 };
    return map[val] || 0;
}

// Get toggle value
function getToggleVal(fieldName) {
    const group = document.querySelector(`.val-toggle-group[data-field="${fieldName}"]`);
    if (!group) return null;
    const active = group.querySelector('.val-toggle.active');
    return active ? active.dataset.val : null;
}

// Get checked checkboxes
function getChecked(namePattern) {
    return Array.from(document.querySelectorAll(`input[name^="${namePattern}"]:checked`)).map(i => i.name);
}

// Get counter value
function getCounterVal(damageType) {
    const el = document.querySelector(`.val-panel-counter[data-damage="${damageType}"] .counter-val`);
    return el ? parseInt(el.textContent) || 0 : 0;
}

// Change counter
function changeCounter(btn, delta) {
    const counter = btn.parentElement;
    const valEl = counter.querySelector('.counter-val');
    let v = parseInt(valEl.textContent) + delta;
    if (v < 0) v = 0;
    valEl.textContent = v;
}

// Populate brands in valuation
function valInitBrands() {
    const sel = document.getElementById('val-marka');
    if (!sel) return;
    Object.keys(carData).sort().forEach(brand => {
        const opt = document.createElement('option');
        opt.value = brand;
        opt.textContent = brand;
        sel.appendChild(opt);
    });
}

function valPopulateModels() {
    const brand = document.getElementById('val-marka').value;
    const modelSel = document.getElementById('val-modeli');
    modelSel.innerHTML = '<option value="">Zgjidh Modelin</option>';
    document.getElementById('val-engine').innerHTML = '<option value="">Zgjidh motorin</option>';
    document.getElementById('val-engine-hint').style.display = 'block';
    if (brand && carData[brand]) {
        carData[brand].forEach(m => {
            const o = document.createElement('option');
            o.value = m; o.textContent = m;
            modelSel.appendChild(o);
        });
    }
    valPopulateColors();
}

function valPopulateEngines() {
    const brand = document.getElementById('val-marka').value;
    const model = document.getElementById('val-modeli').value;
    const year = parseInt(document.getElementById('val-viti').value);
    const engSel = document.getElementById('val-engine');
    const hint = document.getElementById('val-engine-hint');
    engSel.innerHTML = '<option value="">Zgjidh motorin</option>';

    if (brand && model && engineData[brand] && engineData[brand][model]) {
        hint.style.display = 'none';
        engineData[brand][model].forEach(e => {
            const o = document.createElement('option');
            o.value = e; o.textContent = e;
            engSel.appendChild(o);
        });
    } else if (brand && model) {
        hint.style.display = 'block';
        hint.textContent = 'Motoret për këtë model nuk janë shtuar akoma.';
    } else {
        hint.style.display = 'block';
        hint.textContent = 'Zgjidh markën, modelin dhe vitin fillimisht.';
    }
}

function valPopulateColors() {
    const extSel = document.getElementById('val-ext-color');
    const intSel = document.getElementById('val-int-color');
    if (!extSel || !intSel) return;

    extSel.innerHTML = '<option value="">Zgjidh ngjyrën</option>';
    exteriorColors.forEach(c => {
        const o = document.createElement('option');
        o.value = c.val; o.textContent = c.label;
        extSel.appendChild(o);
    });

    intSel.innerHTML = '<option value="">Zgjidh ngjyrën</option>';
    interiorColors.forEach(c => {
        const o = document.createElement('option');
        o.value = c.val; o.textContent = c.label;
        intSel.appendChild(o);
    });

    const optGrid = document.getElementById('val-options-grid');
    if (optGrid) {
        optGrid.innerHTML = '';
        commonOptions.forEach((opt, i) => {
            const lbl = document.createElement('label');
            lbl.className = 'val-check';
            lbl.innerHTML = `<input type="checkbox" name="opt-${i}" data-weight="${opt.weight}"> ${opt.name}`;
            optGrid.appendChild(lbl);
        });
    }
}

// Stepper
let currentValStep = 1;
const totalValSteps = 5;

function valNavigate(dir) {
    if (dir === 1 && !valValidateStep(currentValStep)) return;
    const steps = document.querySelectorAll('.val-step');
    steps[currentValStep - 1].classList.remove('active');
    currentValStep = Math.max(1, Math.min(totalValSteps, currentValStep + dir));
    steps[currentValStep - 1].classList.add('active');
    updateValProgress();
    window.scrollTo({ top: document.querySelector('.val-progress-bar-container').offsetTop - 80, behavior: 'smooth' });
}

function updateValProgress() {
    const pct = ((currentValStep - 1) / (totalValSteps - 1)) * 100;
    document.getElementById('valProgressFill').style.width = pct + '%';
    document.querySelectorAll('.val-dot').forEach(dot => {
        const s = parseInt(dot.dataset.step);
        dot.classList.toggle('active', s <= currentValStep);
        dot.classList.toggle('done', s < currentValStep);
    });
    document.getElementById('valBtnBack').style.display = currentValStep > 1 ? 'flex' : 'none';
    document.getElementById('valBtnNext').style.display = currentValStep < totalValSteps ? 'flex' : 'none';
    document.getElementById('valBtnSubmit').style.display = currentValStep === totalValSteps ? 'flex' : 'none';
}

function valValidateStep(step) {
    if (step === 1) {
        const marka = document.getElementById('val-marka').value;
        const modeli = document.getElementById('val-modeli').value;
        const viti = document.getElementById('val-viti').value;
        const engine = document.getElementById('val-engine').value;
        if (!marka || !modeli || !viti || !engine) {
            alert('Ju lutem plotëso të gjitha fushat e kërkuara.');
            return false;
        }
    }
    if (step === 2) {
        if (!document.getElementById('val-ext-color').value || !document.getElementById('val-int-color').value) {
            alert('Ju lutem zgjidh ngjyrën e jashtme dhe të brendshme.');
            return false;
        }
    }
    if (step === 3) {
        const status = document.querySelector('input[name="status"]:checked');
        const km = document.getElementById('val-km').value;
        if (!status || !km) {
            alert('Ju lutem plotëso statusin dhe kilometrat.');
            return false;
        }
    }
    return true;
}

// Toggle groups
document.addEventListener('DOMContentLoaded', function () {
    valInitBrands();
    updateValProgress();

    document.querySelectorAll('.val-toggle-group').forEach(group => {
        group.querySelectorAll('.val-toggle').forEach(btn => {
            btn.addEventListener('click', function () {
                group.querySelectorAll('.val-toggle').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const field = group.dataset.field;
                const val = this.dataset.val;
                // toggle sub-options
                const subMap = {
                    'leaks': 'leaks-sub', 'warning-lights': 'warning-lights-sub',
                    'broken-parts': 'broken-parts-sub', 'interior-damage': 'interior-damage-sub',
                    'bad-bodywork': 'bad-bodywork-sub', 'body-damage': 'body-damage-sub',
                    'rust': 'rust-sub', 'damaged-windows': 'damaged-windows-sub',
                    'wheels': 'wheels-sub', 'mods': 'mods-sub',
                };
                if (subMap[field]) {
                    const sub = document.getElementById(subMap[field]);
                    if (sub) sub.classList.toggle('hidden', val === 'no');
                }
            });
        });
    });
});

// Main calculation
async function calculateValuation() {
    if (!valValidateStep(currentValStep)) return;

    const brand  = document.getElementById('val-marka').value;
    const model  = document.getElementById('val-modeli').value;
    const year   = parseInt(document.getElementById('val-viti').value);
    const engine = document.getElementById('val-engine').value;

    // Derive generation from year (reuse generationData from main.js)
    let generazione = '';
    if (generationData[brand] && generationData[brand][model]) {
        const gens = generationData[brand][model];
        for (const gen of gens) {
            const match = gen.match(/(\d{4})[–\-](\d{4})/);
            if (match) {
                const gy1 = parseInt(match[1]);
                const gy2 = parseInt(match[2]);
                if (year >= gy1 && year <= gy2) { generazione = gen; break; }
            }
        }
    }

    // Show loading state
    document.getElementById('valBtnSubmit').innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Duke ngarkuar...';
    document.getElementById('valBtnSubmit').disabled = true;

    // Fetch real prices from DB
    let priceData;
    try {
        const params = new URLSearchParams({ marka: brand, modeli: model });
        if (generazione) params.append('generazione', generazione);
        const res = await fetch(`/api/valuation-prices?${params}`);
        priceData = await res.json();
    } catch (e) {
        alert('Gabim gjatë marrjes së të dhënave. Provoni përsëri.');
        document.getElementById('valBtnSubmit').innerHTML =
            '<i class="fa-solid fa-calculator"></i> Vlerëso Mjetin';
        document.getElementById('valBtnSubmit').disabled = false;
        return;
    }

    // Reset button
    document.getElementById('valBtnSubmit').innerHTML =
        '<i class="fa-solid fa-calculator"></i> Vlerëso Mjetin';
    document.getElementById('valBtnSubmit').disabled = false;

    // Hide form, show result area
    document.querySelector('.valuation-wrapper form').style.display = 'none';
    document.querySelector('.val-progress-bar-container').style.display = 'none';

    // No data found
    if (!priceData.found) {
        document.getElementById('val-no-data-label').textContent =
            `${brand} ${model} ${year}`;
        document.getElementById('val-no-data').classList.remove('hidden');
        window.scrollTo({ top: document.getElementById('val-no-data').offsetTop - 100, behavior: 'smooth' });
        return;
    }

    // We have data — apply all modifiers to the average
    const baseAvg  = priceData.avg;
    const baseLow  = priceData.low;
    const baseHigh = priceData.high;
    const count    = priceData.count;

    let totalModifier = 0;
    const factors = [];

    // Engine score
    const engScore = getEngineScore(engine, year);
    if (engScore !== 0) {
        totalModifier += engScore;
        factors.push({ label: `Motor: ${engine}`, val: engScore > 0 ? `+${engScore}%` : `${engScore}%`, positive: engScore > 0 });
    }

    // Exterior color
    const extColor = document.getElementById('val-ext-color').value;
    const extScore = getExtColorScore(extColor);
    const extLabel = exteriorColors.find(c => c.val === extColor)?.label || extColor;
    if (extScore !== 0) {
        totalModifier += extScore;
        factors.push({ label: `Ngjyra jashtme: ${extLabel}`, val: extScore > 0 ? `+${extScore}%` : `${extScore}%`, positive: extScore > 0 });
    }

    // Interior color
    const intColor = document.getElementById('val-int-color').value;
    const intScore = getIntColorScore(intColor);
    const intLabel = interiorColors.find(c => c.val === intColor)?.label || intColor;
    if (intScore !== 0) {
        totalModifier += intScore;
        factors.push({ label: `Ngjyra brenda: ${intLabel}`, val: intScore > 0 ? `+${intScore}%` : `${intScore}%`, positive: intScore > 0 });
    }

    // Options
    let optionScore = 0;
    document.querySelectorAll('#val-options-grid input:checked').forEach(inp => {
        optionScore += parseFloat(inp.dataset.weight || 0);
    });
    if (optionScore > 0) {
        totalModifier += optionScore;
        factors.push({ label: 'Opsionet', val: `+${optionScore.toFixed(1)}%`, positive: true });
    }

    // Status
    const status = document.querySelector('input[name="status"]:checked')?.value;
    if (status === 'accident') {
        totalModifier -= 50;
        factors.push({ label: 'Aksident', val: '-50%', positive: false });
    } else if (status === 'parts') {
        totalModifier -= 75;
        factors.push({ label: 'Vetëm Pjesë', val: '-75%', positive: false });
    }

    // Kilometers vs fetched average km (we use 120k as a general proxy since DB avg isn't fetched)
    const km = parseInt(document.getElementById('val-km').value) || 100000;
    const avgKm = 120000;
    const kmDiff = avgKm - km;
    if (kmDiff > 0) {
        const kmBonus = Math.floor(kmDiff / 10000) * 2.5;
        if (kmBonus > 0) { totalModifier += kmBonus; factors.push({ label: `Km nën mesatare (${km.toLocaleString()} km)`, val: `+${kmBonus.toFixed(1)}%`, positive: true }); }
    } else if (kmDiff < 0) {
        const kmPenalty = Math.floor(Math.abs(kmDiff) / 10000) * 2.5;
        if (kmPenalty > 0) { totalModifier -= kmPenalty; factors.push({ label: `Km mbi mesatare (${km.toLocaleString()} km)`, val: `-${kmPenalty.toFixed(1)}%`, positive: false }); }
    }

    // Major accident
    if (getToggleVal('major-accident') === 'yes') { totalModifier -= 50; factors.push({ label: 'Aksident i Rëndë', val: '-50%', positive: false }); }
    // Frame damage
    if (getToggleVal('frame-damage') === 'yes') { totalModifier -= 50; factors.push({ label: 'Dëmtim Shasisë', val: '-50%', positive: false }); }
    // Flood
    const flood = getToggleVal('flood-damage');
    if (flood === 'yes') { totalModifier -= 15; factors.push({ label: 'Përmbytje', val: '-15%', positive: false }); }
    else { totalModifier += 2.5; factors.push({ label: 'Pa Përmbytje', val: '+2.5%', positive: true }); }
    // Smoked
    const smoked = getToggleVal('smoked');
    if (smoked === 'yes') { totalModifier -= 1.5; factors.push({ label: 'Duhanpirje', val: '-1.5%', positive: false }); }
    else { totalModifier += 1.5; factors.push({ label: 'Pa Duhanpirje', val: '+1.5%', positive: true }); }
    // Broken parts
    if (getToggleVal('broken-parts') === 'no') { totalModifier += 2; factors.push({ label: 'Pa Pjesë të Thyera', val: '+2%', positive: true }); }
    else { const c = getChecked('bp-').length; const p = c * 1.5; totalModifier -= p; factors.push({ label: `Pjesë të Thyera (${c})`, val: `-${p.toFixed(1)}%`, positive: false }); }
    // Interior damage
    if (document.querySelector('input[name="id-rips"]:checked')) { totalModifier -= 5; factors.push({ label: 'Grisje Brendshme', val: '-5%', positive: false }); }
    if (document.querySelector('input[name="id-stains"]:checked')) { totalModifier -= 2; factors.push({ label: 'Njolla Brendshme', val: '-2%', positive: false }); }
    // Warning lights
    const wlMap = { 'wl-check-engine': -8, 'wl-oil': -3.5, 'wl-battery': -3, 'wl-airbag': -5, 'wl-abs': -5, 'wl-traction': -5, 'wl-dpf': -4, 'wl-other': -2.5 };
    Object.entries(wlMap).forEach(([name, penalty]) => {
        if (document.querySelector(`input[name="${name}"]:checked`)) {
            totalModifier += penalty;
            factors.push({ label: `Dritë: ${name.replace('wl-','').toUpperCase()}`, val: `${penalty}%`, positive: false });
        }
    });
    // Mechanical
    if (getToggleVal('engine-issues') === 'yes') { totalModifier -= 8; factors.push({ label: 'Probleme Motori', val: '-8%', positive: false }); }
    if (getToggleVal('trans-issues') === 'yes') { totalModifier -= 5; factors.push({ label: 'Probleme Kambio', val: '-5%', positive: false }); }
    if (getToggleVal('ac-issues') === 'yes') { totalModifier -= 2; factors.push({ label: 'Probleme AC', val: '-2%', positive: false }); }
    // Keys
    if (getToggleVal('keys') === '1') { totalModifier -= 1; factors.push({ label: 'Vetëm 1 Çelës', val: '-1%', positive: false }); }
    else { totalModifier += 1; factors.push({ label: '2+ Çelësa', val: '+1%', positive: true }); }
    // Body damage
    const damagePenalties = { dents: 0.75, scratches: 0.5, scuffs: 0.5, chipped: 0.35, faded: 0.25, missing: 1.0 };
    let bodyPenalty = 0;
    Object.entries(damagePenalties).forEach(([type, pct]) => { const c = getCounterVal(type); if (c > 0) bodyPenalty += pct * c; });
    if (bodyPenalty > 0) { totalModifier -= bodyPenalty; factors.push({ label: 'Dëmtime Karoserize', val: `-${bodyPenalty.toFixed(1)}%`, positive: false }); }
    // Rust
    const rust = getToggleVal('rust');
    if (rust === 'no') { totalModifier += 2; factors.push({ label: 'Pa Ndryshk', val: '+2%', positive: true }); }
    else { const rl = document.querySelector('input[name="rust-level"]:checked')?.value; const rm = { little: -1, average: -2, plenty: -4 }; if (rl) { totalModifier += rm[rl]; factors.push({ label: `Ndryshk (${rl})`, val: `${rm[rl]}%`, positive: false }); } }
    // Windows
    if (document.querySelector('input[name="win-front"]:checked')) { totalModifier -= 4; factors.push({ label: 'Xham Para i Dëmtuar', val: '-4%', positive: false }); }
    if (document.querySelector('input[name="win-back"]:checked')) { totalModifier -= 2.5; factors.push({ label: 'Xham Prapa i Dëmtuar', val: '-2.5%', positive: false }); }
    ['win-door1','win-door2','win-door3','win-door4'].forEach(n => { if (document.querySelector(`input[name="${n}"]:checked`)) { totalModifier -= 1.5; factors.push({ label: 'Xham Portiere i Dëmtuar', val: '-1.5%', positive: false }); } });
    // Fire
    if (getToggleVal('fire-damage') === 'yes') { totalModifier -= 50; factors.push({ label: 'Dëmtim nga Zjarri', val: '-50%', positive: false }); }
    // Tires
    const tires = getToggleVal('tires');
    if (tires === 'no') { totalModifier += 1.5; factors.push({ label: 'Goma Mirë', val: '+1.5%', positive: true }); }
    else if (tires === '2') { totalModifier -= 1.5; factors.push({ label: '2 Goma për Ndërruar', val: '-1.5%', positive: false }); }
    else if (tires === '4') { totalModifier -= 3; factors.push({ label: '4 Goma për Ndërruar', val: '-3%', positive: false }); }
    // Wheels
    const wheels = getToggleVal('wheels');
    if (wheels === 'no') { totalModifier += 1; factors.push({ label: 'Rrathë OK', val: '+1%', positive: true }); }
    else { const wd = document.querySelector('input[name="wheel-damage"]:checked')?.value; if (wd === 'dent') { totalModifier -= 4; factors.push({ label: 'Gungë në Rrath', val: '-4%', positive: false }); } else { totalModifier -= 2; factors.push({ label: 'Gërvishje/Ndryshk Rrathë', val: '-2%', positive: false }); } }
    // Mods
    const modScores = { 'mod-suspension': 1, 'mod-engine': -2, 'mod-trans': -2, 'mod-turbo': -2, 'mod-other-mech': -1, 'mod-vinyl': 0, 'mod-bodypart': 1.5, 'mod-tint': 1, 'mod-spoiler': 1, 'mod-wing': 2, 'mod-accessories': 1 };
    Object.entries(modScores).forEach(([name, score]) => {
        if (score !== 0 && document.querySelector(`input[name="${name}"]:checked`)) {
            totalModifier += score;
            factors.push({ label: `Mod: ${name.replace('mod-','').replace(/-/g,' ')}`, val: score > 0 ? `+${score}%` : `${score}%`, positive: score > 0 });
        }
    });

    // Apply modifier to the fetched average
    const modPct = Math.max(-90, totalModifier) / 100;
    const finalAvg  = Math.max(300, Math.round(baseAvg  * (1 + modPct)));
    const finalLow  = Math.max(300, Math.round(baseLow  * (1 + modPct)));
    const finalHigh = Math.max(300, Math.round(baseHigh * (1 + modPct)));

    // Populate result
    document.getElementById('val-result-car-label').textContent = `${brand} ${model} ${year} — ${engine}`;
    document.getElementById('val-price-low').textContent  = '€' + finalLow.toLocaleString('de-DE');
    document.getElementById('val-price-high').textContent = '€' + finalHigh.toLocaleString('de-DE');
    document.getElementById('val-price-avg').textContent  = '€' + finalAvg.toLocaleString('de-DE');
    document.getElementById('val-disclaimer-count').textContent = count + ' lista';

    // Low data warning
    const warningEl = document.getElementById('val-data-warning');
    if (priceData.warning) {
        document.getElementById('val-data-count').textContent = count;
        warningEl.classList.remove('hidden');
    } else {
        warningEl.classList.add('hidden');
    }

    // Factors list
    document.getElementById('val-factors').innerHTML =
        `<p class="val-factors-title">Faktorët e Vlerësimit</p>` +
        factors.map(f =>
            `<div class="val-factor-item ${f.positive ? 'positive' : 'negative'}">
                <span>${f.label}</span><span>${f.val}</span>
            </div>`
        ).join('');

    document.getElementById('val-result').classList.remove('hidden');
    window.scrollTo({ top: document.getElementById('val-result').offsetTop - 100, behavior: 'smooth' });
}

function restartValuation() {
    document.getElementById('val-result').classList.add('hidden');
    document.querySelector('.valuation-wrapper form').style.display = 'block';
    document.querySelector('.val-progress-bar-container').style.display = 'block';
    currentValStep = 1;
    document.querySelectorAll('.val-step').forEach((s, i) => s.classList.toggle('active', i === 0));
    updateValProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}



// VEHICLE DETAILS PAGE

document.addEventListener("DOMContentLoaded", function () {
    const mainImg    = document.getElementById("main-img");
    const thumbTrack = document.getElementById("thumb-track");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightbox   = document.getElementById("lightbox");

    if (!mainImg) return; // Exit if not on vehicle details page

    const thumbnails = document.querySelectorAll(".thumb-img");
    const imageUrls  = Array.from(thumbnails).map((img) => img.src);
    let currentIndex = 0;

    // Expose currentIndex for inline onclick="openLightbox(currentIndex)"
    Object.defineProperty(window, "currentIndex", {
        get: () => currentIndex,
    });

    window.setMain = function (idx) {
        currentIndex = idx;
        mainImg.src = imageUrls[idx];

        thumbnails.forEach((t, i) => {
            t.classList.toggle("active", i === idx);
            if (i === idx) {
                t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
        });
    };

    window.shiftMain = function (dir) {
        if (!imageUrls.length) return;
        window.setMain((currentIndex + dir + imageUrls.length) % imageUrls.length);
    };

    window.scrollThumbs = function (dir) {
        if (!thumbTrack) return;
        thumbTrack.scrollBy({ left: dir * thumbTrack.clientWidth * 0.8, behavior: "smooth" });
    };

    // --- Lightbox ---
    window.openLightbox = function (idx) {
        currentIndex = idx;
        lightboxImg.src = imageUrls[idx];
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden";
    };

    window.closeLightbox = function () {
        lightbox.style.display = "none";
        document.body.style.overflow = "";
    };

    window.lightboxShift = function (dir) {
        if (!imageUrls.length) return;
        currentIndex = (currentIndex + dir + imageUrls.length) % imageUrls.length;
        lightboxImg.src = imageUrls[currentIndex];
    };

    // Close on background click
    if (lightbox) {
        lightbox.addEventListener("click", function (e) {
            if (e.target === this) window.closeLightbox();
        });
    }

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
        if (lightbox && lightbox.style.display === "flex") {
            if (e.key === "ArrowLeft")  window.lightboxShift(-1);
            if (e.key === "ArrowRight") window.lightboxShift(1);
            if (e.key === "Escape")     window.closeLightbox();
        }
    });

    // Touch swipe for lightbox on mobile
    if (lightbox) {
        let touchStartX = null;

        lightbox.addEventListener("touchstart", function (e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        lightbox.addEventListener("touchend", function (e) {
            if (touchStartX === null) return;
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) window.lightboxShift(diff > 0 ? 1 : -1);
            touchStartX = null;
        }, { passive: true });
    }
});

