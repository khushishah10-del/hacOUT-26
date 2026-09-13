/**
 * EcoLoop Mock Data Store
 * Cleanly structured mock data for Phase 1 Frontend Foundation
 */

export const FACTORY_INFO = {
  name: "GreenTech Manufacturing",
  facilityId: "FAC-8820",
  type: "Manufacturing",
  location: "Ahmedabad, Gujarat",
  lastAudit: "March 2026",
  status: "Active Monitoring"
};

export const DASHBOARD_STATS = {
  totalEmissions: {
    value: 111.2,
    display: "111.2",
    unit: "tons CO2e",
    trend: "-8.4%",
    isPositiveTrend: true, // In emissions, a decrease is good!
    period: "vs last month"
  },
  monthlyChange: {
    value: -8.4,
    display: "-8.4%",
    unit: "Change",
    trend: "Improving",
    isPositiveTrend: true,
    period: "30-day rolling"
  },
  production: {
    value: 12500,
    display: "12,500",
    unit: "units",
    trend: "+4.2%",
    isPositiveTrend: true,
    period: "Standard output"
  },
  potentialReduction: {
    value: 28.0,
    display: "28.0",
    unit: "tons CO2",
    trend: "25.2% of total",
    isPositiveTrend: true,
    period: "Actionable target"
  }
};

export const EMISSION_BREAKDOWN = [
  {
    category: "Electricity",
    percentage: 70,
    tons: 77.9,
    color: "#ef4444",
    badgeType: "energy",
    scope: "Scope 2 (Indirect)",
    description: "Grid electricity consumed across HVAC, induction furnaces, and compressed air"
  },
  {
    category: "Waste",
    percentage: 12,
    tons: 12.8,
    color: "#0284c7",
    badgeType: "waste",
    scope: "Scope 3 (Downstream)",
    description: "Industrial polymer scrap, machining metal swarf, paper packaging, and discards"
  },
  {
    category: "Fuel",
    percentage: 10,
    tons: 11.3,
    color: "#f97316",
    badgeType: "fuel",
    scope: "Scope 1 (Direct)",
    description: "Onsite diesel generators and natural gas furnace pre-heaters"
  },
  {
    category: "Raw Materials",
    percentage: 8,
    tons: 9.3,
    color: "#8b5cf6",
    badgeType: "materials",
    scope: "Scope 3 (Upstream)",
    description: "Embodied carbon in secondary alloy billets and structural composite feedstock"
  }
];

export const MONTHLY_EMISSIONS_TREND = [
  { month: "Oct", emissions: 138, target: 130 },
  { month: "Nov", emissions: 132, target: 128 },
  { month: "Dec", emissions: 125, target: 122 },
  { month: "Jan", emissions: 120, target: 118 },
  { month: "Feb", emissions: 116, target: 115 },
  { month: "Mar", emissions: 111, target: 110 }
];

export const EMISSION_HOTSPOT = {
  category: "Electricity",
  percentage: 70,
  tons: 77.9,
  severity: "Primary Emission Hotspot",
  leakPoint: "Thermal curing line blowers & un-sequenced induction compressor banks",
  recommendationSummary: "Consider increasing renewable electricity usage to reduce electricity-related emissions."
};

export const AI_RECOMMENDATION_PREVIEW = {
  title: "Transition to Renewable Electricity & Onsite Solar",
  summary: "Deploy a 120 kWp rooftop solar photovoltaic array and transition base grid supply to an open-access captive renewable Power Purchase Agreement (PPA).",
  potentialReduction: "28.0 tons CO2",
  priority: "High",
  category: "Energy",
  estimatedAnnualSavings: "₹18,50,000",
  implementationTime: "3-6 months"
};

export const ALL_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "Increase Renewable Electricity Usage",
    category: "Energy",
    priority: "High",
    estimatedReduction: "268 tons/year",
    co2Number: 268,
    description: "Execute a corporate Power Purchase Agreement (PPA) for 40% clean power and install a 250kW rooftop solar array over Factory Bay 2.",
    costImpact: "Tariff reduction of ~12% after amortization",
    paybackPeriod: "2.4 years",
    scope: "Scope 2",
    steps: [
      "Conduct structural load inspection of Factory Bay 2 roof",
      "Issue RFP for 250kW commercial solar EPC contract",
      "Enroll in regional green tariff / PPA allocation program"
    ]
  },
  {
    id: "rec-2",
    title: "Use Recycled Raw Materials",
    category: "Materials",
    priority: "Medium",
    estimatedReduction: "142 tons/year",
    co2Number: 142,
    description: "Substitute virgin polypropylene resin with 35% post-industrial recycled (PIR) plastic and secondary aluminum billets for non-loadbearing parts.",
    costImpact: "Estimated 4-6% direct raw material cost savings",
    paybackPeriod: "Immediate",
    scope: "Scope 3",
    steps: [
      "Validate ASTM tensile tolerance of 35% PIR resin samples",
      "Certify secondary aluminum suppliers under ISO 14021",
      "Update product bill-of-materials (BOM) for Line 3"
    ]
  },
  {
    id: "rec-3",
    title: "Boiler Waste Heat Recovery & Economizer",
    category: "Fuel",
    priority: "High",
    estimatedReduction: "95 tons/year",
    co2Number: 95,
    description: "Capture 180°C exhaust flue gases from the natural gas boiler using an economizer loop to preheat feedwater to 85°C.",
    costImpact: "Reduces boiler natural gas fuel intake by 14%",
    paybackPeriod: "1.8 years",
    scope: "Scope 1",
    steps: [
      "Measure stack temperature and flue oxygen levels",
      "Size condensing economizer heat exchanger unit",
      "Schedule installation during scheduled weekend shutdown"
    ]
  },
  {
    id: "rec-4",
    title: "Closed-Loop Packaging & Scrap Swarf Return",
    category: "Waste",
    priority: "Medium",
    estimatedReduction: "54 tons/year",
    co2Number: 54,
    description: "Establish a direct circular take-back loop with steel and aluminum suppliers for press stamping off-cuts and switch to reusable collapsible dunnage.",
    costImpact: "Scrap premium credit + zero packaging disposal fees",
    paybackPeriod: "0.8 years",
    scope: "Scope 3",
    steps: [
      "Place segregated swarf bins at stamping stations",
      "Sign circular scrap return agreement with foundry partner",
      "Deploy RFID-tagged returnable plastic shipping totes"
    ]
  }
];

export const CIRCULAR_ALTERNATIVES = [
  {
    id: "circ-1",
    currentOption: "Virgin Plastic Pellets (PP/PE)",
    circularAlternative: "100% Recycled & Bio-Resin Blend",
    co2Reduction: "85 tons CO2/year",
    costImpact: "-4% Material Cost",
    circularityLevel: "Tier 1 — Direct Loop",
    circularityScore: 84,
    category: "Materials",
    impactNotes: "Prevents petrochemical extraction; 72% lower embodied carbon per kg of polymer."
  },
  {
    id: "circ-2",
    currentOption: "Single-Use Cardboard & Stretch Wrap",
    circularAlternative: "Reusable Collapsible Dunnage Totes",
    co2Reduction: "32 tons CO2/year",
    costImpact: "-22% Annual Packaging Spend",
    circularityLevel: "Closed Loop Supply Chain",
    circularityScore: 92,
    category: "Logistics",
    impactNotes: "Dunnage crates rated for 150+ round-trip cycles between OEM and tier-1 assembly."
  },
  {
    id: "circ-3",
    currentOption: "Conventional Fossil Grid Electricity",
    circularAlternative: "Onsite Rooftop Solar + Green Tariff PPA",
    co2Reduction: "268 tons CO2/year",
    costImpact: "-12% Long-Term Tariff Stabilization",
    circularityLevel: "Energy Circularity",
    circularityScore: 96,
    category: "Energy",
    impactNotes: "Eliminates scope 2 combustion footprint; hedges against peak spot-market volatility."
  },
  {
    id: "circ-4",
    currentOption: "Landfill Waste Disposal",
    circularAlternative: "Byproduct Scrap Recovery & Upcycling",
    co2Reduction: "45 tons CO2/year",
    costImpact: "+$14,500 Byproduct Resale Revenue",
    circularityLevel: "Industrial Symbiosis",
    circularityScore: 78,
    category: "Waste Management",
    impactNotes: "Transforms solid manufacturing discards into feedstock for local asphalt & composite makers."
  }
];

export const INITIAL_EMPTY_FORM_DATA = {
  factoryName: "",
  location: "",
  industryType: "",
  electricityConsumption: "",
  renewableEnergyPercent: "",
  fuelConsumption: "",
  materialType: "",
  materialQuantity: "",
  plasticWaste: "",
  metalWaste: "",
  paperWaste: "",
  otherWaste: "",
  productionUnits: "",
  date: ""
};

export const DEFAULT_FACTORY_FORM_DATA = {
  factoryName: "GreenTech Manufacturing",
  location: "Ahmedabad, Gujarat",
  industryType: "Manufacturing",
  electricityConsumption: "95000",
  renewableEnergyPercent: "20",
  fuelConsumption: "4200",
  materialType: "Recycled Aluminum & Polymer Composite",
  materialQuantity: "18500",
  plasticWaste: "2400",
  metalWaste: "3100",
  paperWaste: "850",
  otherWaste: "450",
  productionUnits: "12500",
  date: "2026-03-15"
};

/**
 * Simulator Calculation Engine
 * Baseline: 111.2 tons CO2e matching GreenTech Manufacturing
 */
export const calculateSimulatedEmissions = (renewablePercent, recycledPercent, wasteRecoveryPercent, customBaseline = null) => {
  const BASELINE_TOTAL = customBaseline?.total || 111.2;
  const BASELINE_ELECTRICITY = customBaseline?.electricity || 77.9; // ~70%
  const BASELINE_MATERIALS = customBaseline?.materials || 9.3;      // ~8%
  const BASELINE_WASTE = customBaseline?.waste || 12.8;             // ~12%
  const BASELINE_FUEL = customBaseline?.fuel || 11.3;               // ~10% (unaffected by these 3 sliders)

  // Reductions from renewable energy (applies to electricity portion)
  const electricitySavings = BASELINE_ELECTRICITY * (renewablePercent / 100) * 0.85;

  // Reductions from recycled materials (applies to raw material embodied emissions)
  const materialSavings = BASELINE_MATERIALS * (recycledPercent / 100) * 0.65;

  // Reductions from waste recovery (applies to waste emissions)
  const wasteSavings = BASELINE_WASTE * (wasteRecoveryPercent / 100) * 0.75;

  const totalSaved = Number((electricitySavings + materialSavings + wasteSavings).toFixed(1));
  const projectedTotal = Number(Math.max(BASELINE_TOTAL - totalSaved, 35.0).toFixed(1));
  const percentageReduced = Number(((totalSaved / BASELINE_TOTAL) * 100).toFixed(1));

  // Estimated annual cost saving (~$155 / ton CO2 avoided)
  const estimatedFinancialSavings = Math.round(totalSaved * 155);

  return {
    baselineTotal: Number(BASELINE_TOTAL.toFixed(1)),
    projectedTotal,
    tonsSaved: totalSaved,
    percentageReduced: Number(percentageReduced),
    financialSavings: estimatedFinancialSavings,
    breakdown: {
      electricity: Number((BASELINE_ELECTRICITY - electricitySavings).toFixed(1)),
      fuel: Number(BASELINE_FUEL.toFixed(1)),
      materials: Number((BASELINE_MATERIALS - materialSavings).toFixed(1)),
      waste: Number((BASELINE_WASTE - wasteSavings).toFixed(1))
    }
  };
};

