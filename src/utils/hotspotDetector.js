/**
 * EcoLoop Hotspot Detection Utility
 * 
 * Dynamically compares emission categories to identify the primary emission hotspot,
 * ranks top contributors from highest to lowest, and provides contextual insights.
 */

export function detectHotspot(emissionResults) {
  if (!emissionResults) return null;

  const totalCO2 = Number(emissionResults.totalCO2) || 0;
  const electricityCO2 = Number(emissionResults.electricityCO2) || 0;
  const fuelCO2 = Number(emissionResults.fuelCO2) || 0;
  const materialCO2 = Number(emissionResults.materialCO2) || 0;
  const wasteCO2 = Number(emissionResults.wasteCO2) || 0;

  const percentages = emissionResults.percentages || {};

  // Safe zero-emissions handling
  if (totalCO2 <= 0) {
    return {
      category: "None",
      value: 0,
      percentage: 0,
      scope: "N/A",
      icon: "ShieldAlert",
      color: "#94a3b8",
      reason: "No emissions have been calculated yet.",
      whatThisMeans: "The submitted inputs report zero operational consumption, resulting in 0 kg CO2e emissions across all manufacturing boundaries.",
      topContributors: [
        { category: "Electricity", value: 0, percentage: 0, scope: "Scope 2", icon: "Zap", color: "#ef4444" },
        { category: "Fuel", value: 0, percentage: 0, scope: "Scope 1", icon: "Flame", color: "#f97316" },
        { category: "Material", value: 0, percentage: 0, scope: "Scope 3", icon: "Layers", color: "#8b5cf6" },
        { category: "Waste", value: 0, percentage: 0, scope: "Scope 3", icon: "Trash2", color: "#0284c7" }
      ],
      isZero: true
    };
  }

  // Define categories with dynamic calculation of values & percentages
  const categories = [
    {
      category: "Electricity",
      value: electricityCO2,
      percentage: percentages.electricity !== undefined ? Number(percentages.electricity) : Number(((electricityCO2 / totalCO2) * 100).toFixed(1)),
      scope: "Scope 2 (Indirect)",
      icon: "Zap",
      color: "#ef4444",
      actionText: "transitioning to on-site solar, renewable power purchase agreements (PPAs), and motor drive variable frequency controllers"
    },
    {
      category: "Fuel",
      value: fuelCO2,
      percentage: percentages.fuel !== undefined ? Number(percentages.fuel) : Number(((fuelCO2 / totalCO2) * 100).toFixed(1)),
      scope: "Scope 1 (Direct)",
      icon: "Flame",
      color: "#f97316",
      actionText: "recovering boiler waste heat, optimizing burner fuel-air ratios, and electrifying high-temperature processes"
    },
    {
      category: "Material",
      value: materialCO2,
      percentage: percentages.material !== undefined ? Number(percentages.material) : Number(((materialCO2 / totalCO2) * 100).toFixed(1)),
      scope: "Scope 3 (Upstream)",
      icon: "Layers",
      color: "#8b5cf6",
      actionText: "substituting virgin raw feedstock with post-industrial recycled resins and secondary alloy scrap"
    },
    {
      category: "Waste",
      value: wasteCO2,
      percentage: percentages.waste !== undefined ? Number(percentages.waste) : Number(((wasteCO2 / totalCO2) * 100).toFixed(1)),
      scope: "Scope 3 (Downstream)",
      icon: "Trash2",
      color: "#0284c7",
      actionText: "diverting discards from landfills via closed-loop scrap return, byproduct upcycling, and packaging reuse"
    }
  ];

  // Sort categories from highest emission value to lowest emission value (Requirement 7)
  const topContributors = [...categories].sort((a, b) => b.value - a.value);

  // Highest contributor is the main hotspot
  const primary = topContributors[0];

  return {
    category: primary.category,
    value: primary.value,
    percentage: primary.percentage,
    scope: primary.scope,
    icon: primary.icon,
    color: primary.color,
    reason: `${primary.category} is currently the largest contributor to the factory's estimated emissions.`,
    whatThisMeans: `The analysis shows that ${primary.category.toLowerCase()} is currently the largest source of estimated emissions (${primary.percentage}% of total). Reducing ${primary.category.toLowerCase()}-related emissions may provide the greatest potential impact, such as by ${primary.actionText}.`,
    topContributors,
    isZero: false
  };
}
