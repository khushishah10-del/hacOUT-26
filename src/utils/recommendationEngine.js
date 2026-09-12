/**
 * EcoLoop Recommendation Engine (Rule-Based Mock Version)
 * 
 * Generates dynamic recommendations based on the factory's largest emission hotspot.
 * NOTE: Estimated reductions are prototype demo estimates only.
 */

export const MOCK_HOTSPOT_RECOMMENDATIONS = {
  Electricity: {
    title: "Reduce Electricity-Related Emissions",
    recommendation: "Improve energy efficiency by optimizing high-consumption equipment, reducing unnecessary electricity usage, and increasing renewable energy adoption.",
    reason: "Electricity is currently the largest contributor to the factory's estimated emissions.",
    action: "Conduct an energy audit and identify high-consumption machines for efficiency improvements.",
    priority: "High",
    estimatedReductionPercentage: 15,
    icon: "Zap",
    category: "Electricity"
  },
  Fuel: {
    title: "Reduce Fuel-Related Emissions",
    recommendation: "Reduce fuel consumption by improving equipment efficiency, optimizing operating schedules, and evaluating cleaner fuel or electrification options.",
    reason: "Fuel consumption is currently the largest contributor to the factory's estimated emissions.",
    action: "Review fuel-consuming equipment and identify opportunities for efficiency improvements or cleaner alternatives.",
    priority: "High",
    estimatedReductionPercentage: 20,
    icon: "Flame",
    category: "Fuel"
  },
  Material: {
    title: "Switch to Lower-Carbon Materials",
    recommendation: "Reduce material-related emissions by increasing recycled content, improving material efficiency, and evaluating lower-carbon alternatives.",
    reason: "Material usage is currently the largest contributor to the factory's estimated emissions.",
    action: "Evaluate recycled or lower-carbon material alternatives for the production process.",
    priority: "High",
    estimatedReductionPercentage: 12,
    icon: "Layers",
    category: "Material"
  },
  Waste: {
    title: "Improve Waste Management",
    recommendation: "Reduce waste emissions by increasing recycling, reusing production scrap, and improving waste segregation.",
    reason: "Waste is currently the largest contributor to the factory's estimated emissions.",
    action: "Identify recyclable waste streams and introduce reuse or recycling processes.",
    priority: "High",
    estimatedReductionPercentage: 18,
    icon: "Trash2",
    category: "Waste"
  }
};

/**
 * Supporting secondary recommendations for non-hotspot categories
 */
export const SUPPORTING_RECOMMENDATIONS = {
  Electricity: {
    title: "Energy Efficiency Optimization",
    category: "Electricity",
    description: "Optimize equipment operating hours, reduce idle energy consumption, and install smart load sensors.",
    priority: "Medium",
    estimatedReduction: "~8% (Demo Estimate)",
    icon: "Zap"
  },
  Fuel: {
    title: "Fuel & Heat Recovery Tuning",
    category: "Fuel",
    description: "Inspect boiler insulation, tune burner combustion schedules, and capture stack waste heat.",
    priority: "Medium",
    estimatedReduction: "~10% (Demo Estimate)",
    icon: "Flame"
  },
  Material: {
    title: "Material Yield Optimization",
    category: "Material",
    description: "Reduce raw material cutting scrap, improve stamping nesting yields, and test recycled content feedstock.",
    priority: "Medium",
    estimatedReduction: "~6% (Demo Estimate)",
    icon: "Layers"
  },
  Waste: {
    title: "Production Waste Recycling",
    category: "Waste",
    description: "Increase recycling and reuse of production waste through scrap take-back programs with foundries.",
    priority: "Medium",
    estimatedReduction: "~5% (Demo Estimate)",
    icon: "Trash2"
  }
};

/**
 * Generates the primary recommendation and supporting recommendations
 * based on the detected emission hotspot.
 * 
 * @param {Object} emissionResult - Latest emission results object
 * @param {Object} hotspot - Output from detectHotspot utility
 * @returns {Object|null} Recommendation object or null
 */
export function getRecommendation(emissionResult, hotspot) {
  if (!emissionResult || !hotspot || hotspot.isZero) return null;

  // Normalize category name
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

  const primaryRule = MOCK_HOTSPOT_RECOMMENDATIONS[key] || MOCK_HOTSPOT_RECOMMENDATIONS.Electricity;

  // Build supporting recommendations from the other 3 non-hotspot categories
  const allCategories = ["Electricity", "Fuel", "Material", "Waste"];
  const supportingKeys = allCategories.filter((cat) => cat !== key);
  const supporting = supportingKeys.map((catKey) => SUPPORTING_RECOMMENDATIONS[catKey]);

  return {
    hotspot: hotspot.category,
    hotspotValue: hotspot.value,
    hotspotPercentage: hotspot.percentage,
    title: primaryRule.title,
    recommendation: primaryRule.recommendation,
    reason: primaryRule.reason,
    action: primaryRule.action,
    priority: primaryRule.priority,
    estimatedReductionPercentage: primaryRule.estimatedReductionPercentage,
    estimatedReductionDisplay: `~${primaryRule.estimatedReductionPercentage}% (Demo Estimate)`,
    icon: primaryRule.icon,
    supportingRecommendations: supporting
  };
}
