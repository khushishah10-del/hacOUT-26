/**
 * EcoLoop Circular Alternative Engine
 * 
 * Generates practical, dynamic circular-economy alternatives based on:
 * 1. The factory's primary emission hotspot (Electricity, Fuel, Material, Waste)
 * 2. Actual submitted material and waste operational data
 * 
 * NOTE: All CO2 reduction and cost values are prototype demo estimates.
 */

export const BASE_HOTSPOT_ALTERNATIVES = {
  Electricity: [
    {
      id: "elec-1",
      title: "Renewable Energy Integration",
      category: "Electricity",
      description: "Increase the share of renewable electricity through rooftop solar, green power procurement, or other renewable sources.",
      circularBenefit: "Reduce dependence on conventional electricity and improve resource efficiency.",
      estimatedCO2Reduction: "10–20%",
      estimatedCost: "Medium",
      priority: "High Suitability",
      icon: "Sun"
    },
    {
      id: "elec-2",
      title: "Energy-Efficient Equipment",
      category: "Electricity",
      description: "Replace or optimize high-energy-consuming equipment and reduce unnecessary energy consumption.",
      circularBenefit: "Prolong equipment lifecycle and minimize electrical energy waste.",
      estimatedCO2Reduction: "8–15%",
      estimatedCost: "Medium",
      priority: "High Suitability",
      icon: "Cpu"
    }
  ],
  Fuel: [
    {
      id: "fuel-1",
      title: "Equipment Electrification",
      category: "Fuel",
      description: "Evaluate replacing selected fuel-powered equipment with efficient electric alternatives.",
      circularBenefit: "Transition fossil-fueled heating to clean, circular electrification.",
      estimatedCO2Reduction: "15–25%",
      estimatedCost: "High",
      priority: "High Suitability",
      icon: "Zap"
    },
    {
      id: "fuel-2",
      title: "Fuel Efficiency Optimization",
      category: "Fuel",
      description: "Improve equipment efficiency, maintenance, operating schedules, and fuel utilization.",
      circularBenefit: "Eliminate thermal losses and maximize circular heat recovery.",
      estimatedCO2Reduction: "8–15%",
      estimatedCost: "Low–Medium",
      priority: "Medium Suitability",
      icon: "Gauge"
    }
  ],
  Material: [
    {
      id: "mat-1",
      title: "Recycled Material Substitution",
      category: "Material",
      description: "Evaluate replacing part of virgin raw materials with suitable recycled materials.",
      circularBenefit: "Displace virgin raw extraction and preserve secondary material loops.",
      estimatedCO2Reduction: "10–20%",
      estimatedCost: "Medium",
      priority: "High Suitability",
      icon: "RefreshCw"
    },
    {
      id: "mat-2",
      title: "Material Optimization",
      category: "Material",
      description: "Reduce raw material consumption through better production planning, design optimization, and scrap reduction.",
      circularBenefit: "Increase material yield and prevent manufacturing trim scrap.",
      estimatedCO2Reduction: "5–15%",
      estimatedCost: "Low–Medium",
      priority: "High Suitability",
      icon: "Scissors"
    }
  ],
  Waste: [
    {
      id: "waste-1",
      title: "Waste Recycling & Reuse",
      category: "Waste",
      description: "Separate recyclable waste streams and reuse suitable production scrap instead of sending it for disposal.",
      circularBenefit: "Reduce disposal and recover useful materials.",
      estimatedCO2Reduction: "15–25%",
      estimatedCost: "Low–Medium",
      priority: "High Suitability",
      icon: "Trash2"
    },
    {
      id: "waste-2",
      title: "Industrial Waste Exchange",
      category: "Waste",
      description: "Identify opportunities where one process's waste material can become another process's useful input.",
      circularBenefit: "Establish industrial symbiosis and closed-loop cross-industry value chains.",
      estimatedCO2Reduction: "10–20%",
      estimatedCost: "Medium",
      priority: "High Suitability",
      icon: "Repeat"
    }
  ]
};

/**
 * Builds tailored waste stream alternatives based on actual factory data
 */
export function getTailoredWasteAlternative(factoryData) {
  if (!factoryData) return null;

  const plastic = Number(factoryData.plasticWaste) || 0;
  const metal = Number(factoryData.metalWaste) || 0;
  const paper = Number(factoryData.paperWaste) || 0;
  const other = Number(factoryData.otherWaste) || 0;
  const total = plastic + metal + paper + other;

  if (total <= 0) return null;

  // Find dominant waste category
  if (plastic >= metal && plastic >= paper && plastic > 0) {
    return {
      id: "waste-tailored-plastic",
      title: "Plastic Waste Reuse",
      category: "Waste",
      description: `Segregate and granulate ${plastic.toLocaleString()} kg of plastic scrap for closed-loop remolding or secondary packaging.`,
      circularBenefit: "Diverts polymer waste from landfills and directly displaces virgin petrochemical resin pellets.",
      estimatedCO2Reduction: "12–22%",
      estimatedCost: "Low–Medium",
      priority: "High Suitability",
      icon: "Box",
      wasteType: "Plastic",
      amountKg: plastic
    };
  }

  if (metal >= plastic && metal >= paper && metal > 0) {
    return {
      id: "waste-tailored-metal",
      title: "Metal Scrap Recovery",
      category: "Waste",
      description: `Channel ${metal.toLocaleString()} kg of metal stamping scrap and shavings directly into secondary foundry closed-loop remelting.`,
      circularBenefit: "Saves up to 95% energy compared to primary smelting of virgin ore and generates scrap buyback revenue.",
      estimatedCO2Reduction: "15–25%",
      estimatedCost: "Low",
      priority: "High Suitability",
      icon: "Layers",
      wasteType: "Metal",
      amountKg: metal
    };
  }

  if (paper >= plastic && paper >= metal && paper > 0) {
    return {
      id: "waste-tailored-paper",
      title: "Paper Recycling",
      category: "Waste",
      description: `Bale and return ${paper.toLocaleString()} kg of paper and cardboard packaging to certified mills for clean repulping.`,
      circularBenefit: "Closes the fiber loop and prevents methane emissions generated from paper landfill breakdown.",
      estimatedCO2Reduction: "10–18%",
      estimatedCost: "Low",
      priority: "High Suitability",
      icon: "FileText",
      wasteType: "Paper",
      amountKg: paper
    };
  }

  return {
    id: "waste-tailored-general",
    title: "Comprehensive Waste Segregation",
    category: "Waste",
    description: `Segregate ${total.toLocaleString()} kg of mixed production scrap into dedicated mono-material streams for secondary recycling.`,
    circularBenefit: "Eliminates disposal tipping fees and converts mixed discard into sorted circular feedstock.",
    estimatedCO2Reduction: "10–20%",
    estimatedCost: "Low",
    priority: "High Suitability",
    icon: "Trash2",
    wasteType: "Mixed",
    amountKg: total
  };
}

/**
 * Computes Resource Opportunity summary based on actual submitted factory inputs
 */
export function getResourceOpportunity(factoryData) {
  if (!factoryData) {
    return {
      plastic: 0,
      metal: 0,
      paper: 0,
      other: 0,
      totalWaste: 0,
      hasOpportunity: false,
      message: "No resource data reported."
    };
  }

  const plastic = Number(factoryData.plasticWaste) || 0;
  const metal = Number(factoryData.metalWaste) || 0;
  const paper = Number(factoryData.paperWaste) || 0;
  const other = Number(factoryData.otherWaste) || 0;
  const totalWaste = plastic + metal + paper + other;
  const materialQuantity = Number(factoryData.materialQuantity) || 0;

  const hasOpportunity = totalWaste > 0 || materialQuantity > 0;

  let dominantStream = "Waste";
  let maxVal = 0;
  if (plastic > maxVal) { maxVal = plastic; dominantStream = "Plastic Scrap"; }
  if (metal > maxVal) { maxVal = metal; dominantStream = "Metal Scrap"; }
  if (paper > maxVal) { maxVal = paper; dominantStream = "Paper / Packaging"; }

  let message = "";
  if (totalWaste > 0) {
    message = `High-value recovery opportunity detected: ${maxVal.toLocaleString()} kg of ${dominantStream} can be redirected from disposal into circular secondary supply chains.`;
  } else if (materialQuantity > 0) {
    message = `Material circularity opportunity: ${materialQuantity.toLocaleString()} units of virgin input can be partially replaced with certified secondary feedstock.`;
  } else {
    message = "No significant waste stream logged yet. Record scrap outputs to discover circular valorization pathways.";
  }

  return {
    plastic,
    metal,
    paper,
    other,
    totalWaste,
    materialQuantity,
    dominantStream,
    hasOpportunity,
    opportunityDetected: totalWaste > 0,
    message
  };
}

/**
 * Main Circular Alternative Engine entry point.
 * Evaluates factoryData, emissionResult, and hotspot to generate tailored circular options.
 * 
 * @param {Object} factoryData - Raw form inputs
 * @param {Object} emissionResult - Calculated emissions
 * @param {Object} hotspot - Hotspot detection result
 * @returns {Object|null}
 */
export function getCircularAlternatives(factoryData, emissionResult, hotspot) {
  if (!emissionResult || !hotspot || hotspot.isZero) {
    return null;
  }

  // Normalize hotspot category
  let key = hotspot.category || "Electricity";
  if (key.toLowerCase().includes("material")) {
    key = "Material";
  } else if (key.toLowerCase().includes("fuel")) {
    key = "Fuel";
  } else if (key.toLowerCase().includes("waste")) {
    key = "Waste";
  } else {
    key = "Electricity";
  }

  // Retrieve base alternatives for this hotspot
  const baseAlts = BASE_HOTSPOT_ALTERNATIVES[key] ? [...BASE_HOTSPOT_ALTERNATIVES[key]] : [...BASE_HOTSPOT_ALTERNATIVES.Electricity];

  // Retrieve tailored waste stream alternative based on real factory inputs
  const tailoredWaste = getTailoredWasteAlternative(factoryData);

  const finalAlternatives = [];

  if (key === "Waste") {
    // If Waste is the hotspot, include the tailored waste stream as the lead card, followed by the base waste alternatives
    if (tailoredWaste) {
      finalAlternatives.push(tailoredWaste);
    }
    baseAlts.forEach((alt) => {
      // Avoid duplicate title if tailored matches
      if (!finalAlternatives.some((a) => a.title.toLowerCase() === alt.title.toLowerCase())) {
        finalAlternatives.push(alt);
      }
    });
  } else {
    // For non-waste hotspots (Electricity, Fuel, Material), add the 2 hotspot-specific circular alternatives
    finalAlternatives.push(...baseAlts);

    // If actual waste was reported, append the tailored waste opportunity card (3rd card)
    if (tailoredWaste && tailoredWaste.amountKg > 0) {
      finalAlternatives.push(tailoredWaste);
    }
  }

  // Compute resource opportunity summary
  const resourceOpportunity = getResourceOpportunity(factoryData);

  return {
    hotspot: hotspot.category,
    hotspotValue: hotspot.value,
    hotspotPercentage: hotspot.percentage,
    isZero: hotspot.isZero,
    alternatives: finalAlternatives,
    resourceOpportunity
  };
}
