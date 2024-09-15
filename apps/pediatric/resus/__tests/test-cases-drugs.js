
module.exports = [
    { childWeight: 5, drugName: 'Adrenaline 1:10,000', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 0.01, expectedResult: { totalDose: 0.05, volume: 0.5 } },
    { childWeight: 5, drugName: 'Atropine 1:10,000', drugType: 'IV', dosage: 0.02, expectedResult: { totalDose: 0.1, volume: 1 } },
    { childWeight: 5, drugName: 'Amiodarone', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 5, expectedResult: { totalDose: 25, volume: 0.5 } },
    { childWeight: 5, drugName: 'Lidocaine', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 1, expectedResult: { totalDose: 5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Magnesium Sulfate', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 50, expectedResult: { totalDose: 250, volume: 0.5 } },
    { childWeight: 5, drugName: 'Calcium gluconate', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 100, expectedResult: { totalDose: 500, volume: 5 } },
    { childWeight: 5, drugName: 'Sodium Bicarbonate', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 1, expectedResult: { totalDose: 5, volume: 5 } },
    { childWeight: 5, drugName: 'Dextrose 10%', drugType: 'IV', dosage: 0.2, expectedResult: { totalDose: 1, volume: 10 } },
    { childWeight: 5, drugName: 'Dextrose 25%', drugType: 'IV', dosage: 0.2, expectedResult: { totalDose: 1, volume: 4 } },
    { childWeight: 5, drugName: 'Ketamin 1mg/Kg', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Ketamin 1.5mg/Kg', drugType: 'IV', dosage: 1.5, expectedResult: { totalDose: 7.5, volume: 0.75 } },
    { childWeight: 5, drugName: 'Propofol', drugType: 'IV ', dosage: 1, expectedResult: { totalDose: 5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Etomidate ', drugType: 'IV', dosage: 0.3, expectedResult: { totalDose: 1.5, volume: 0.75 } },
    { childWeight: 5, drugName: 'Fentanyl', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 5, volume: 0.1 } },
    { childWeight: 5, drugName: 'Midazolam', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 0.5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Suxamethonium', drugType: 'IV ', dosage: 1, expectedResult: { totalDose: 5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Rocuronium', drugType: 'IV ', dosage: 1, expectedResult: { totalDose: 5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Adrenaline 1:1000', drugType: 'IM', dosage: 0.01, expectedResult: { totalDose: 0.05, volume: 0.05 } },
    { childWeight: 5, drugName: 'Fluid Bolus NACL 0.9%', drugType: 'IV', dosage: 20, expectedResult: { totalDose: null, volume: 100 } },
    { childWeight: 5, drugName: 'Adenosine 1st', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 0.5, volume: 0.17 } },
    { childWeight: 5, drugName: 'Adenosine 2nd', drugType: 'IV', dosage: 0.2, expectedResult: { totalDose: 1, volume: 0.33 } },
    { childWeight: 5, drugName: 'Hydrocortisone', drugType: 'IV', dosage: 4, expectedResult: { totalDose: 20, volume: null } },
    { childWeight: 5, drugName: 'Midazolam', drugType: 'INTRANASAL', dosage: 0.5, expectedResult: { totalDose: 2.5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Keppra', drugType: 'IV', dosage: 40, expectedResult: { totalDose: 200, volume: null } },
    { childWeight: 5, drugName: 'Phenytoin', drugType: 'IV', dosage: 20, expectedResult: { totalDose: 100, volume: null } },
    { childWeight: 5, drugName: 'Phenobarbital', drugType: 'IV', dosage: 20, expectedResult: { totalDose: 100, volume: null } },
    { childWeight: 5, drugName: 'Valproic acid', drugType: 'IV ', dosage: 40, expectedResult: { totalDose: 200, volume: null } },
    { childWeight: 5, drugName: 'Midazolam', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 0.5, volume: 0.5 } },
    { childWeight: 5, drugName: 'Midazolam', drugType: 'IM', dosage: 0.3, expectedResult: { totalDose: 1.5, volume: 1.5 } },
    { childWeight: 5, drugName: 'Manitol', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 5, volume: 25 } },
    { childWeight: 5, drugName: 'NACL 3% ', drugType: 'IV', dosage: 5, expectedResult: { totalDose: null, volume: 25 } },
    { childWeight: 5, drugName: 'Naloxone ', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 0.5, volume: 1.25 } },
    { childWeight: 5, drugName: 'Flumazenil', drugType: 'IV', dosage: 0.01, expectedResult: { totalDose: 0.05, volume: 0.5 } },
    { childWeight: 5, drugName: 'Sugammadex', drugType: 'IV', dosage: 16, expectedResult: { totalDose: 80, volume: 0.8 } },
    { childWeight: 5, drugName: 'Charcoal ', drugType: 'PO', dosage: 1, expectedResult: { totalDose: 5, volume: 25 } },
    { childWeight: 25, drugName: 'Adrenaline 1:10,000 ', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 0.01, expectedResult: { totalDose: 0.25, volume: 2.5 } },
    { childWeight: 25, drugName: 'Atropine 1:10,000', drugType: 'IV', dosage: 0.02, expectedResult: { totalDose: 0.5, volume: 5 } },
    { childWeight: 25, drugName: 'Amiodarone ', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 5, expectedResult: { totalDose: 125, volume: 2.5 } },
    { childWeight: 25, drugName: 'Lidocaine', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 1, expectedResult: { totalDose: 25, volume: 2.5 } },
    { childWeight: 25, drugName: 'Magnesium Sulfate', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 50, expectedResult: { totalDose: 1250, volume: 2.5 } },
    { childWeight: 25, drugName: 'Calcium gluconate ', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 100, expectedResult: { totalDose: 2500, volume: 25 } },
    { childWeight: 25, drugName: 'Sodium Bicarbonate', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 1, expectedResult: { totalDose: 25, volume: 25 } },
    { childWeight: 25, drugName: 'Dextrose 10%', drugType: 'IV', dosage: 0.2, expectedResult: { totalDose: 5, volume: 50 } },
    { childWeight: 25, drugName: 'Dextrose 25%', drugType: 'IV', dosage: 0.2, expectedResult: { totalDose: 5, volume: 20 } },
    { childWeight: 25, drugName: 'Ketamin 1mg/Kg', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 25, volume: 2.5 } },
    { childWeight: 25, drugName: 'Ketamin 1.5mg/Kg', drugType: 'IV', dosage: 1.5, expectedResult: { totalDose: 37.5, volume: 3.75 } },
    { childWeight: 25, drugName: 'Propofol', drugType: 'IV ', dosage: 1, expectedResult: { totalDose: 25, volume: 2.5 } },
    { childWeight: 25, drugName: 'Etomidate ', drugType: 'IV', dosage: 0.3, expectedResult: { totalDose: 7.5, volume: 3.75 } },
    { childWeight: 25, drugName: 'Fentanyl', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 25, volume: 0.5 } },
    { childWeight: 25, drugName: 'Midazolam', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 2.5, volume: 2.5 } },
    { childWeight: 25, drugName: 'Suxamethonium', drugType: 'IV ', dosage: 1, expectedResult: { totalDose: 25, volume: 2.5 } },
    { childWeight: 25, drugName: 'Rocuronium', drugType: 'IV ', dosage: 1, expectedResult: { totalDose: 25, volume: 2.5 } },
    { childWeight: 25, drugName: 'Adrenaline 1:1000', drugType: 'IM', dosage: 0.01, expectedResult: { totalDose: 0.25, volume: 0.25 } },
    { childWeight: 25, drugName: 'Fluid Bolus NACL 0.9%', drugType: 'IV', dosage: 20, expectedResult: { totalDose: null, volume: 500 } },
    { childWeight: 25, drugName: 'Adenosine 1st', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 2.5, volume: 0.83 } },
    { childWeight: 25, drugName: 'Adenosine 2nd', drugType: 'IV', dosage: 0.2, expectedResult: { totalDose: 5, volume: 1.67 } },
    { childWeight: 25, drugName: 'Hydrocortisone', drugType: 'IV', dosage: 4, expectedResult: { totalDose: 100, volume: null } },
    { childWeight: 25, drugName: 'Midazolam', drugType: 'INTRANASAL', dosage: 0.5, expectedResult: { totalDose: 10, volume: 2 } },
    { childWeight: 25, drugName: 'Keppra', drugType: 'IV', dosage: 40, expectedResult: { totalDose: 1000, volume: null } },
    { childWeight: 25, drugName: 'Phenytoin', drugType: 'IV', dosage: 20, expectedResult: { totalDose: 500, volume: null } },
    { childWeight: 25, drugName: 'Phenobarbital', drugType: 'IV', dosage: 20, expectedResult: { totalDose: 500, volume: null } },
    { childWeight: 25, drugName: 'Valproic acid', drugType: 'IV ', dosage: 40, expectedResult: { totalDose: 1000, volume: null } },
    { childWeight: 25, drugName: 'Midazolam', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 2.5, volume: 2.5 } },
    { childWeight: 25, drugName: 'Midazolam', drugType: 'IM', dosage: 0.3, expectedResult: { totalDose: 7.5, volume: 7.5 } },
    { childWeight: 25, drugName: 'Manitol', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 25, volume: 125 } },
    { childWeight: 25, drugName: 'NACL 3% ', drugType: 'IV', dosage: 5, expectedResult: { totalDose: null, volume: 125 } },
    { childWeight: 25, drugName: 'Naloxone ', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 2, volume: 5 } },
    { childWeight: 25, drugName: 'Flumazenil', drugType: 'IV', dosage: 0.01, expectedResult: { totalDose: 0.2, volume: 2 } },
    { childWeight: 25, drugName: 'Sugammadex', drugType: 'IV', dosage: 16, expectedResult: { totalDose: 400, volume: 4 } },
    { childWeight: 25, drugName: 'Charcoal ', drugType: 'PO', dosage: 1, expectedResult: { totalDose: 25, volume: 125 } },
]
