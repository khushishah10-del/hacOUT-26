/**
 * EcoLoop Emission Calculator Utility
 * 
 * NOTE: These are DEMO / ESTIMATED emission factors for prototyping in Phase 2.
 * They are not official or guaranteed real-world values.
 * In production, final emission factors will be configured and verified in the backend.
 */

export const DEMO_EMISSION_FACTORS = {
  // Electricity: 0.82 kg CO2e per kWh (Scope 2 Grid Average)
  electricity: 0.82,

  // Fuel: 2.68 kg CO2e per liter (Scope 1 Diesel/Combustible)
  fuel: 2.68,

  // Material: 0.50 kg CO2e per kg of raw material (Scope 3 Upstream Embodied)
  material: 0.50,

  // Waste categories (Scope 3 Downstream Disposal)
  wastePlastic: 2.50, // kg CO2e per kg
  wasteMetal: 1.80,   // kg CO2e per kg
  wastePaper: 1.00,   // kg CO2e per kg
  wasteOther: 1.20    // kg CO2e per kg
};

/**
 * Calculates estimated greenhouse gas emissions based on factory operational inputs.
 * 
 * @param {Object} factoryData - Factory data inputs
 * @returns {Object} Calculated emission totals, category breakdowns, and percentages
 */
export function calculateEmissions(factoryData) {
  if (!factoryData) return null;

  // 1. Numerical extraction with safe zero-fallbacks
  const electricityKwh = Math.max(0, Number(factoryData.electricityConsumption) || 0);
  const fuelLiters = Math.max(0, Number(factoryData.fuelConsumption) || 0);
  const materialQuantity = Math.max(0, Number(factoryData.materialQuantity) || 0);
  const plasticWasteKg = Math.max(0, Number(factoryData.plasticWaste) || 0);
  const metalWasteKg = Math.max(0, Number(factoryData.metalWaste) || 0);
  const paperWasteKg = Math.max(0, Number(factoryData.paperWaste) || 0);
  const otherWasteKg = Math.max(0, Number(factoryData.otherWaste) || 0);

  // 2. Individual Category Calculations in kg CO2e
  const electricityCO2 = electricityKwh * DEMO_EMISSION_FACTORS.electricity;
  const fuelCO2 = fuelLiters * DEMO_EMISSION_FACTORS.fuel;
  const materialCO2 = materialQuantity * DEMO_EMISSION_FACTORS.material;

  // Waste Sub-calculations
  const wastePlasticCO2 = plasticWasteKg * DEMO_EMISSION_FACTORS.wastePlastic;
  const wasteMetalCO2 = metalWasteKg * DEMO_EMISSION_FACTORS.wasteMetal;
  const wastePaperCO2 = paperWasteKg * DEMO_EMISSION_FACTORS.wastePaper;
  const wasteOtherCO2 = otherWasteKg * DEMO_EMISSION_FACTORS.wasteOther;

  const wasteCO2 = wastePlasticCO2 + wasteMetalCO2 + wastePaperCO2 + wasteOtherCO2;

  // 3. Total CO2e
  const totalCO2 = electricityCO2 + fuelCO2 + materialCO2 + wasteCO2;

  // 4. Percentage Calculations
  let electricityPercent = 0;
  let fuelPercent = 0;
  let materialPercent = 0;
  let wastePercent = 0;

  if (totalCO2 > 0) {
    electricityPercent = Number(((electricityCO2 / totalCO2) * 100).toFixed(1));
    fuelPercent = Number(((fuelCO2 / totalCO2) * 100).toFixed(1));
    materialPercent = Number(((materialCO2 / totalCO2) * 100).toFixed(1));
    // Ensure sum matches 100 by calculating remainder or rounding
    wastePercent = Number((100 - (electricityPercent + fuelPercent + materialPercent)).toFixed(1));
  }

  // Convert to metric tons (1 ton = 1,000 kg)
  const toTons = (kg) => Number((kg / 1000).toFixed(2));

  // 5. Category Breakdown array for Recharts & UI tables
  const breakdown = [
    {
      category: "Electricity",
      kg: Math.round(electricityCO2),
      tons: toTons(electricityCO2),
      percentage: electricityPercent,
      color: "#ef4444",
      scope: "Scope 2 (Indirect)",
      description: "Grid electricity consumed across plant equipment, lighting, and HVAC",
      inputQuantity: electricityKwh,
      inputUnit: "kWh",
      factor: DEMO_EMISSION_FACTORS.electricity
    },
    {
      category: "Fuel",
      kg: Math.round(fuelCO2),
      tons: toTons(fuelCO2),
      percentage: fuelPercent,
      color: "#f97316",
      scope: "Scope 1 (Direct)",
      description: "Onsite fuel combustion from boilers, heating, and generators",
      inputQuantity: fuelLiters,
      inputUnit: "Liters",
      factor: DEMO_EMISSION_FACTORS.fuel
    },
    {
      category: "Raw Materials",
      kg: Math.round(materialCO2),
      tons: toTons(materialCO2),
      percentage: materialPercent,
      color: "#8b5cf6",
      scope: "Scope 3 (Upstream)",
      description: "Embodied carbon in raw feedstock used in manufacturing",
      inputQuantity: materialQuantity,
      inputUnit: "kg",
      factor: DEMO_EMISSION_FACTORS.material
    },
    {
      category: "Waste",
      kg: Math.round(wasteCO2),
      tons: toTons(wasteCO2),
      percentage: wastePercent,
      color: "#0284c7",
      scope: "Scope 3 (Downstream)",
      description: "Landfilled and disposed scrap (plastic, metal, paper, other)",
      inputQuantity: plasticWasteKg + metalWasteKg + paperWasteKg + otherWasteKg,
      inputUnit: "kg",
      subBreakdown: {
        plastic: { kg: Math.round(wastePlasticCO2), inputKg: plasticWasteKg, factor: DEMO_EMISSION_FACTORS.wastePlastic },
        metal: { kg: Math.round(wasteMetalCO2), inputKg: metalWasteKg, factor: DEMO_EMISSION_FACTORS.wasteMetal },
        paper: { kg: Math.round(wastePaperCO2), inputKg: paperWasteKg, factor: DEMO_EMISSION_FACTORS.wastePaper },
        other: { kg: Math.round(wasteOtherCO2), inputKg: otherWasteKg, factor: DEMO_EMISSION_FACTORS.wasteOther }
      }
    }
  ];

  // 6. Identify the primary hotspot (largest emission category)
  const largestSource = breakdown.reduce((max, item) => (item.kg > max.kg ? item : max), breakdown[0]);

  return {
    factoryName: factoryData.factoryName || "Industrial Facility",
    location: factoryData.location || "N/A",
    industryType: factoryData.industryType || "Manufacturing",
    date: factoryData.date || new Date().toISOString().split('T')[0],
    productionUnits: Number(factoryData.productionUnits) || 0,
    totalCO2: Math.round(totalCO2),
    totalCO2Tons: toTons(totalCO2),
    electricityCO2: Math.round(electricityCO2),
    fuelCO2: Math.round(fuelCO2),
    materialCO2: Math.round(materialCO2),
    wasteCO2: Math.round(wasteCO2),
    percentages: {
      electricity: electricityPercent,
      fuel: fuelPercent,
      material: materialPercent,
      waste: wastePercent
    },
    breakdown,
    largestSource,
    calculatedAt: new Date().toLocaleString()
  };
}
