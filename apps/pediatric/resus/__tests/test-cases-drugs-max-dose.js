
module.exports = [
    { childWeight: 101, drugName: 'Adrenaline 1:10,000', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 0.01, expectedResult: { totalDose: 1, volume: 10 } },
    { childWeight: 51, drugName: 'Atropine 1:10,000', drugType: 'IV', dosage: 0.02, expectedResult: { totalDose: 1, volume: 10 } },
    { childWeight: 61, drugName: 'Amiodarone ', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 5, expectedResult: { totalDose: 300, volume: 6 } },
    { childWeight: 41, drugName: 'Magnesium Sulfate', drugType: 'מתן בפוש רק בהחייאה IV', dosage: 50, expectedResult: { totalDose: 2000, volume: 4 } },
    { childWeight: 68, drugName: 'Etomidate', drugType: 'IV', dosage: 0.3, expectedResult: { totalDose: 20, volume: 10 } },
    { childWeight: 101, drugName: 'Fentanyl', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 100, volume: 2 } },
    { childWeight: 101, drugName: 'Midazolam', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 10, volume: 10 } },
    { childWeight: 151, drugName: 'Suxamethonium', drugType: 'IV', dosage: 1, expectedResult: { totalDose: 150, volume: 15 } },
    { childWeight: 51, drugName: 'Adrenaline 1:1000', drugType: 'IM', dosage: 0.01, expectedResult: { totalDose: 0.5, volume: 0.5 } },
    { childWeight: 51, drugName: 'Fluid Bolus NACL 0.9%', drugType: 'IV', dosage: 20, expectedResult: { totalDose: 1000, volume: 1000 } },
    { childWeight: 61, drugName: 'Adenosine 1st', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 6, volume: 2 } },
    { childWeight: 61, drugName: 'Adenosine 2nd', drugType: 'IV', dosage: 0.2, expectedResult: { totalDose: 12, volume: 4 } },
    { childWeight: 26, drugName: 'Hydrocortisone', drugType: 'IV', dosage: 4, expectedResult: { totalDose: 100, volume: null } },
    { childWeight: 21, drugName: 'Midazolam', drugType: 'INTRANASAL', dosage: 0.5, expectedResult: { totalDose: 10, volume: 2 } },
    { childWeight: 114, drugName: 'Keppra', drugType: 'IV', dosage: 40, expectedResult: { totalDose: 4500, volume: null } },
    { childWeight: 76, drugName: 'Phenytoin', drugType: 'IV', dosage: 20, expectedResult: { totalDose: 1500, volume: null } },
    { childWeight: 51, drugName: 'Phenobarbital', drugType: 'IV', dosage: 20, expectedResult: { totalDose: 1000, volume: null } },
    { childWeight: 126, drugName: 'Valproic acid', drugType: 'IV', dosage: 40, expectedResult: { totalDose: 5000, volume: null } },
    { childWeight: 101, drugName: 'Midazolam', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 10, volume: 10 } },
    { childWeight: 35, drugName: 'Midazolam', drugType: 'IM', dosage: 0.3, expectedResult: { totalDose: 10, volume: 10 } },
    { childWeight: 21, drugName: 'Naloxone', drugType: 'IV', dosage: 0.1, expectedResult: { totalDose: 2, volume: 5 } },
    { childWeight: 21, drugName: 'Flumazenil', drugType: 'IV', dosage: 0.01, expectedResult: { totalDose: 0.2, volume: 2 } },
    { childWeight: 101, drugName: 'Charcoal', drugType: 'PO', dosage: 1, expectedResult: { totalDose: 100, volume: 500 } },
]
