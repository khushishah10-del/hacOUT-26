import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Factory,
  Zap,
  Flame,
  Layers,
  Scale,
  Trash2,
  Boxes,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { INITIAL_EMPTY_FORM_DATA, DEFAULT_FACTORY_FORM_DATA } from '../data/mockData';
import { calculateEmissions } from '../utils/emissionCalculator';
import {
  getFactories,
  createFactory,
  createFactoryData,
  calculateEmissions as calculateEmissionsAPI
} from '../services/api';

export default function FactoryData() {
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState(INITIAL_EMPTY_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState('');
  const [apiError, setApiError] = useState('');


  // Current submitted factory data persisted in localStorage
  const [submittedData, setSubmittedData] = useState(() => {
    try {
      const saved = localStorage.getItem('ecoloop_factory_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error reading factory data from localStorage:', e);
      return null;
    }
  });

  // Current calculated emission results persisted in localStorage
  const [emissionResults, setEmissionResults] = useState(() => {
    try {
      const saved = localStorage.getItem('ecoloop_emission_results');
      if (saved) return JSON.parse(saved);
      const savedFactory = localStorage.getItem('ecoloop_factory_data');
      if (savedFactory) return calculateEmissions(JSON.parse(savedFactory));
      return null;
    } catch (e) {
      console.error('Error reading emission results from localStorage:', e);
      return null;
    }
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validation function matching all Phase 2 requirements
  const validate = () => {
    const newErrors = {};

    // 1. Factory Name is required
    if (!formData.factoryName || !formData.factoryName.trim()) {
      newErrors.factoryName = 'Factory Name is required.';
    }

    // 2. Location is required
    if (!formData.location || !formData.location.trim()) {
      newErrors.location = 'Location is required.';
    }

    // 3. Industry Type is required
    if (!formData.industryType || !formData.industryType.trim()) {
      newErrors.industryType = 'Industry Type is required.';
    }

    // 4. Electricity must be 0 or greater
    if (formData.electricityConsumption === '' || formData.electricityConsumption === null) {
      newErrors.electricityConsumption = 'Electricity consumption is required.';
    } else if (isNaN(Number(formData.electricityConsumption)) || Number(formData.electricityConsumption) < 0) {
      newErrors.electricityConsumption = 'Electricity must be 0 or greater.';
    }

    // 5. Renewable Energy must be between 0 and 100
    if (formData.renewableEnergyPercent === '' || formData.renewableEnergyPercent === null) {
      newErrors.renewableEnergyPercent = 'Renewable energy percentage is required.';
    } else {
      const reVal = Number(formData.renewableEnergyPercent);
      if (isNaN(reVal) || reVal < 0 || reVal > 100) {
        newErrors.renewableEnergyPercent = 'Renewable Energy must be between 0 and 100.';
      }
    }

    // 6. Fuel must be 0 or greater
    if (formData.fuelConsumption === '' || formData.fuelConsumption === null) {
      newErrors.fuelConsumption = 'Fuel consumption is required.';
    } else if (isNaN(Number(formData.fuelConsumption)) || Number(formData.fuelConsumption) < 0) {
      newErrors.fuelConsumption = 'Fuel must be 0 or greater.';
    }

    // 7. Material Type
    if (!formData.materialType || !formData.materialType.trim()) {
      newErrors.materialType = 'Material Type is required.';
    }

    // 8. Material Quantity must be 0 or greater
    if (formData.materialQuantity === '' || formData.materialQuantity === null) {
      newErrors.materialQuantity = 'Material quantity is required.';
    } else if (isNaN(Number(formData.materialQuantity)) || Number(formData.materialQuantity) < 0) {
      newErrors.materialQuantity = 'Material Quantity must be 0 or greater.';
    }

    // 9. Plastic Waste must be 0 or greater
    if (formData.plasticWaste === '' || formData.plasticWaste === null) {
      newErrors.plasticWaste = 'Plastic waste value is required.';
    } else if (isNaN(Number(formData.plasticWaste)) || Number(formData.plasticWaste) < 0) {
      newErrors.plasticWaste = 'Plastic waste must be 0 or greater.';
    }

    // 10. Metal Waste must be 0 or greater
    if (formData.metalWaste === '' || formData.metalWaste === null) {
      newErrors.metalWaste = 'Metal waste value is required.';
    } else if (isNaN(Number(formData.metalWaste)) || Number(formData.metalWaste) < 0) {
      newErrors.metalWaste = 'Metal waste must be 0 or greater.';
    }

    // 11. Paper Waste must be 0 or greater
    if (formData.paperWaste === '' || formData.paperWaste === null) {
      newErrors.paperWaste = 'Paper waste value is required.';
    } else if (isNaN(Number(formData.paperWaste)) || Number(formData.paperWaste) < 0) {
      newErrors.paperWaste = 'Paper waste must be 0 or greater.';
    }

    // 12. Other Waste must be 0 or greater
    if (formData.otherWaste === '' || formData.otherWaste === null) {
      newErrors.otherWaste = 'Other waste value is required.';
    } else if (isNaN(Number(formData.otherWaste)) || Number(formData.otherWaste) < 0) {
      newErrors.otherWaste = 'Other waste must be 0 or greater.';
    }

    // 13. Production Units must be 0 or greater
    if (formData.productionUnits === '' || formData.productionUnits === null) {
      newErrors.productionUnits = 'Production units is required.';
    } else if (isNaN(Number(formData.productionUnits)) || Number(formData.productionUnits) < 0) {
      newErrors.productionUnits = 'Production Units must be 0 or greater.';
    }

    // 14. Date is required
    if (!formData.date || !formData.date.trim()) {
      newErrors.date = 'Date is required.';
    }

    return newErrors;
  };

  // Analyze Factory submission handler connected to FastAPI backend
  const handleAnalyzeFactory = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage('');
      setApiError('');
      return;
    }

    setErrors({});
    setApiError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      // STEP 2: Create or reuse factory in MySQL
      setSubmittingStep('Verifying factory profile with backend...');
      let factoryId = null;

      const factories = await getFactories();
      const existing = Array.isArray(factories)
        ? factories.find((f) => f.name && f.name.toLowerCase().trim() === formData.factoryName.toLowerCase().trim())
        : null;

      if (existing && existing.id) {
        factoryId = existing.id;
      } else {
        const newFactory = await createFactory({
          name: formData.factoryName.trim(),
          location: formData.location.trim(),
          industry_type: formData.industryType.trim()
        });
        factoryId = newFactory.id;
      }

      // STEP 3: Submit operational factory data to MySQL
      setSubmittingStep('Saving factory operational data to MySQL...');
      const dataPayload = {
        electricity_kwh: Math.max(0, Number(formData.electricityConsumption) || 0),
        renewable_percentage: Math.min(100, Math.max(0, Number(formData.renewableEnergyPercent) || 0)),
        fuel_liters: Math.max(0, Number(formData.fuelConsumption) || 0),
        material_type: formData.materialType?.trim() || null,
        material_quantity: Math.max(0, Number(formData.materialQuantity) || 0),
        plastic_waste_kg: Math.max(0, Number(formData.plasticWaste) || 0),
        metal_waste_kg: Math.max(0, Number(formData.metalWaste) || 0),
        paper_waste_kg: Math.max(0, Number(formData.paperWaste) || 0),
        other_waste_kg: Math.max(0, Number(formData.otherWaste) || 0),
        production_units: Math.max(0, Math.round(Number(formData.productionUnits) || 0)),
        date: formData.date
      };

      const createdDataRecord = await createFactoryData(factoryId, dataPayload);

      // STEP 4 & 5: Trigger backend emission calculation & hotspot detection
      setSubmittingStep('Calculating emissions with EcoLoop backend...');
      const backendResult = await calculateEmissionsAPI(createdDataRecord.id);

      // STEP 6 & 7: Formulate backend source of truth result
      const formattedResult = {
        id: backendResult.id,
        factoryDataId: backendResult.factory_data_id,
        factoryId: factoryId,
        factoryName: formData.factoryName,
        location: formData.location,
        industryType: formData.industryType,
        date: formData.date,
        productionUnits: Number(formData.productionUnits) || 0,
        totalCO2: backendResult.total_co2,
        totalCO2Tons: Number((backendResult.total_co2 / 1000).toFixed(2)),
        electricityCO2: backendResult.electricity_co2,
        fuelCO2: backendResult.fuel_co2,
        materialCO2: backendResult.material_co2,
        wasteCO2: backendResult.waste_co2,
        percentages: {
          electricity: backendResult.percentages.electricity,
          fuel: backendResult.percentages.fuel,
          material: backendResult.percentages.material,
          waste: backendResult.percentages.waste
        },
        hotspot: {
          category: backendResult.hotspot.category,
          value: backendResult.hotspot.value,
          percentage: backendResult.hotspot.percentage,
          isZero: backendResult.total_co2 <= 0 || backendResult.hotspot.category === "No hotspot"
        },
        breakdown: [
          {
            category: "Electricity",
            kg: backendResult.electricity_co2,
            tons: Number((backendResult.electricity_co2 / 1000).toFixed(2)),
            percentage: backendResult.percentages.electricity,
            color: "#ef4444",
            scope: "Scope 2 (Indirect)",
            description: "Grid electricity consumed across plant equipment, lighting, and HVAC",
            inputQuantity: Number(formData.electricityConsumption) || 0,
            inputUnit: "kWh",
            factor: 0.82
          },
          {
            category: "Fuel",
            kg: backendResult.fuel_co2,
            tons: Number((backendResult.fuel_co2 / 1000).toFixed(2)),
            percentage: backendResult.percentages.fuel,
            color: "#f97316",
            scope: "Scope 1 (Direct)",
            description: "Onsite fuel combustion from boilers, heating, and generators",
            inputQuantity: Number(formData.fuelConsumption) || 0,
            inputUnit: "Liters",
            factor: 2.68
          },
          {
            category: "Material",
            kg: backendResult.material_co2,
            tons: Number((backendResult.material_co2 / 1000).toFixed(2)),
            percentage: backendResult.percentages.material,
            color: "#8b5cf6",
            scope: "Scope 3 (Upstream)",
            description: "Embodied carbon in raw feedstock used in manufacturing",
            inputQuantity: Number(formData.materialQuantity) || 0,
            inputUnit: "kg",
            factor: 0.50
          },
          {
            category: "Waste",
            kg: backendResult.waste_co2,
            tons: Number((backendResult.waste_co2 / 1000).toFixed(2)),
            percentage: backendResult.percentages.waste,
            color: "#0284c7",
            scope: "Scope 3 (Downstream)",
            description: "Landfilled and disposed scrap (plastic, metal, paper, other)",
            inputQuantity: (Number(formData.plasticWaste) || 0) + (Number(formData.metalWaste) || 0) + (Number(formData.paperWaste) || 0) + (Number(formData.otherWaste) || 0),
            inputUnit: "kg",
            factor: "1.00–2.50",
            subBreakdown: {
              plastic: { kg: Math.round((Number(formData.plasticWaste) || 0) * 2.5), inputKg: Number(formData.plasticWaste) || 0, factor: 2.5 },
              metal: { kg: Math.round((Number(formData.metalWaste) || 0) * 1.8), inputKg: Number(formData.metalWaste) || 0, factor: 1.8 },
              paper: { kg: Math.round((Number(formData.paperWaste) || 0) * 1.0), inputKg: Number(formData.paperWaste) || 0, factor: 1.0 },
              other: { kg: Math.round((Number(formData.otherWaste) || 0) * 0.9), inputKg: Number(formData.otherWaste) || 0, factor: 0.9 }
            }
          }

        ],
        source: 'backend',

        calculatedAt: backendResult.created_at || new Date().toLocaleString()
      };

      setSubmittedData(formData);
      setEmissionResults(formattedResult);

      try {
        localStorage.setItem('ecoloop_factory_data', JSON.stringify(formData));
        localStorage.setItem('ecoloop_emission_results', JSON.stringify(formattedResult));
        localStorage.setItem('ecoloop_backend_result', JSON.stringify(backendResult));
      } catch (storageErr) {
        console.error('Failed to cache in localStorage:', storageErr);
      }

      setSuccessMessage(`Factory data saved to MySQL database successfully. Backend Estimated Total Emissions: ${backendResult.total_co2.toLocaleString()} kg CO2e (${formattedResult.totalCO2Tons} tons CO2e). Primary Hotspot: ${backendResult.hotspot.category} (${backendResult.hotspot.percentage}%).`);
    } catch (err) {
      console.error('Backend submission error:', err);
      const errMsg = err.message || '';
      if (errMsg.includes('connect') || errMsg.includes('Failed to fetch')) {
        setApiError('Unable to connect to EcoLoop API. Please make sure the backend server is running.');
      } else if (errMsg.includes('data')) {
        setApiError('Unable to save factory data.');
      } else if (errMsg.includes('emission')) {
        setApiError('Unable to calculate emissions.');
      } else {
        setApiError(errMsg || 'An error occurred during backend processing.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingStep('');
    }
  };

  // Reset handler - clears all inputs and errors
  const handleReset = () => {
    setFormData(INITIAL_EMPTY_FORM_DATA);
    setErrors({});
    setSuccessMessage('');
    setApiError('');
  };

  // Helper to load sample data for rapid testing
  const handleLoadSample = () => {
    setFormData(DEFAULT_FACTORY_FORM_DATA);
    setErrors({});
    setSuccessMessage('');
    setApiError('');
  };


  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-intro-title">Factory Operational Data Input</h2>
          <p className="page-intro-desc">
            Submit monthly consumption, raw material intake, scrap generation, and manufacturing output to benchmark plant carbon metrics.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleLoadSample}
          title="Pre-fill form with realistic demo values"
        >
          <ClipboardList size={15} />
          <span>Fill Sample Data</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #6ee7b7',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: '#10b981', color: '#ffffff', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#065f46', fontSize: '0.98rem', fontWeight: 700 }}>
                {successMessage}
              </h4>
              <p style={{ margin: '0.2rem 0 0', color: '#047857', fontSize: '0.82rem' }}>
                Parameters persisted in MySQL database and verified with backend emission calculation engine.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/emission-analysis')}
          >
            <span>Proceed to Emission Analysis</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Backend API Error Banner */}
      {apiError && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            color: '#991b1b',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <AlertCircle size={22} style={{ flexShrink: 0, color: '#dc2626', marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700 }}>Connection / Submission Error</h4>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', lineHeight: 1.4 }}>{apiError}</p>
            <span style={{ fontSize: '0.78rem', color: '#b91c1c', display: 'block', marginTop: '0.35rem', fontWeight: 500 }}>
              Your entered parameters have been retained in the form. Please make sure the backend server is active and try again.
            </span>
          </div>
        </div>
      )}


      {/* Validation Warning Banner if there are errors */}
      {Object.keys(errors).length > 0 && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#b91c1c'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.86rem', fontWeight: 500 }}>
            Please correct the {Object.keys(errors).length} invalid or missing field{Object.keys(errors).length > 1 ? 's' : ''} highlighted below before proceeding.
          </span>
        </div>
      )}

      <form onSubmit={handleAnalyzeFactory} noValidate>
        {/* SECTION 1: FACTORY PROFILE */}
        <div className="form-section">
          <div className="form-section-header">
            <Building2 size={20} className="text-success" />
            <h3 className="form-section-title">Factory Profile</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="factoryName">
                <span>Factory Name <span className="form-required">*</span></span>
              </label>
              <input
                id="factoryName"
                name="factoryName"
                type="text"
                className={`form-control ${errors.factoryName ? 'is-invalid' : ''}`}
                value={formData.factoryName}
                onChange={handleChange}
                placeholder="e.g. ABC Manufacturing"
              />
              {errors.factoryName && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.factoryName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                <span>Location <span className="form-required">*</span></span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Industrial Zone 4, Michigan"
              />
              {errors.location && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.location}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="industryType">
                <span>Industry Type <span className="form-required">*</span></span>
              </label>
              <input
                id="industryType"
                name="industryType"
                type="text"
                className={`form-control ${errors.industryType ? 'is-invalid' : ''}`}
                value={formData.industryType}
                onChange={handleChange}
                placeholder="e.g. Automotive Precision & Stamping"
                list="industry-suggestions"
              />
              <datalist id="industry-suggestions">
                <option value="Automotive Precision & Stamping" />
                <option value="Chemical & Polymer Manufacturing" />
                <option value="Metal Fabrication & Foundry" />
                <option value="Electronics & Semiconductors" />
                <option value="Food & Beverage Processing" />
                <option value="Textiles & Packaging" />
              </datalist>
              {errors.industryType && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.industryType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: ENERGY & FUEL */}
        <div className="form-section">
          <div className="form-section-header">
            <Zap size={20} style={{ color: '#d97706' }} />
            <h3 className="form-section-title">Energy & Fuel Consumption</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="electricityConsumption">
                <span>Electricity Consumption <span className="form-required">*</span></span>
                <span className="form-unit">kWh</span>
              </label>
              <input
                id="electricityConsumption"
                name="electricityConsumption"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.electricityConsumption ? 'is-invalid' : ''}`}
                value={formData.electricityConsumption}
                onChange={handleChange}
                placeholder="e.g. 1250000"
              />
              {errors.electricityConsumption && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.electricityConsumption}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="renewableEnergyPercent">
                <span>Renewable Energy <span className="form-required">*</span></span>
                <span className="form-unit">% (0 - 100)</span>
              </label>
              <input
                id="renewableEnergyPercent"
                name="renewableEnergyPercent"
                type="number"
                min="0"
                max="100"
                step="any"
                className={`form-control ${errors.renewableEnergyPercent ? 'is-invalid' : ''}`}
                value={formData.renewableEnergyPercent}
                onChange={handleChange}
                placeholder="e.g. 15"
              />
              {errors.renewableEnergyPercent && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.renewableEnergyPercent}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fuelConsumption">
                <span>Fuel Consumption <span className="form-required">*</span></span>
                <span className="form-unit">Liters (Diesel/Gas)</span>
              </label>
              <input
                id="fuelConsumption"
                name="fuelConsumption"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.fuelConsumption ? 'is-invalid' : ''}`}
                value={formData.fuelConsumption}
                onChange={handleChange}
                placeholder="e.g. 42000"
              />
              {errors.fuelConsumption && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.fuelConsumption}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: RAW MATERIALS */}
        <div className="form-section">
          <div className="form-section-header">
            <Layers size={20} style={{ color: '#7c3aed' }} />
            <h3 className="form-section-title">Raw Materials</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="materialType">
                <span>Material Type <span className="form-required">*</span></span>
                <span className="form-unit">Feedstock category</span>
              </label>
              <input
                id="materialType"
                name="materialType"
                type="text"
                className={`form-control ${errors.materialType ? 'is-invalid' : ''}`}
                value={formData.materialType}
                onChange={handleChange}
                placeholder="e.g. Steel & Polypropylene"
              />
              {errors.materialType && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.materialType}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="materialQuantity">
                <span>Material Quantity <span className="form-required">*</span></span>
                <span className="form-unit">Quantity (Tons / Units)</span>
              </label>
              <input
                id="materialQuantity"
                name="materialQuantity"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.materialQuantity ? 'is-invalid' : ''}`}
                value={formData.materialQuantity}
                onChange={handleChange}
                placeholder="e.g. 840"
              />
              {errors.materialQuantity && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.materialQuantity}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: WASTE GENERATION */}
        <div className="form-section">
          <div className="form-section-header">
            <Trash2 size={20} style={{ color: '#0284c7' }} />
            <h3 className="form-section-title">Waste Generation</h3>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="plasticWaste">
                <span>Plastic Waste <span className="form-required">*</span></span>
                <span className="form-unit">kg</span>
              </label>
              <input
                id="plasticWaste"
                name="plasticWaste"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.plasticWaste ? 'is-invalid' : ''}`}
                value={formData.plasticWaste}
                onChange={handleChange}
                placeholder="e.g. 35000"
              />
              {errors.plasticWaste && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.plasticWaste}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="metalWaste">
                <span>Metal Waste <span className="form-required">*</span></span>
                <span className="form-unit">kg</span>
              </label>
              <input
                id="metalWaste"
                name="metalWaste"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.metalWaste ? 'is-invalid' : ''}`}
                value={formData.metalWaste}
                onChange={handleChange}
                placeholder="e.g. 28000"
              />
              {errors.metalWaste && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.metalWaste}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="paperWaste">
                <span>Paper Waste <span className="form-required">*</span></span>
                <span className="form-unit">kg</span>
              </label>
              <input
                id="paperWaste"
                name="paperWaste"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.paperWaste ? 'is-invalid' : ''}`}
                value={formData.paperWaste}
                onChange={handleChange}
                placeholder="e.g. 14000"
              />
              {errors.paperWaste && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.paperWaste}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="otherWaste">
                <span>Other Waste <span className="form-required">*</span></span>
                <span className="form-unit">kg</span>
              </label>
              <input
                id="otherWaste"
                name="otherWaste"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.otherWaste ? 'is-invalid' : ''}`}
                value={formData.otherWaste}
                onChange={handleChange}
                placeholder="e.g. 5000"
              />
              {errors.otherWaste && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.otherWaste}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: PRODUCTION & DATE */}
        <div className="form-section">
          <div className="form-section-header">
            <Factory size={20} className="text-success" />
            <h3 className="form-section-title">Production & Reporting Date</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="productionUnits">
                <span>Production Units <span className="form-required">*</span></span>
                <span className="form-unit">Finished output count</span>
              </label>
              <input
                id="productionUnits"
                name="productionUnits"
                type="number"
                min="0"
                step="any"
                className={`form-control ${errors.productionUnits ? 'is-invalid' : ''}`}
                value={formData.productionUnits}
                onChange={handleChange}
                placeholder="e.g. 10000"
              />
              {errors.productionUnits && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.productionUnits}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date">
                <span>Date <span className="form-required">*</span></span>
                <span className="form-unit">Reporting period</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && (
                <span className="form-error">
                  <AlertCircle size={13} />
                  {errors.date}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6: ACTION BUTTONS (Reset & Analyze Factory) */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1.75rem', marginBottom: '2.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              opacity: isSubmitting ? 0.75 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{submittingStep || 'Processing with backend...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze Factory</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={isSubmitting}
            onClick={handleReset}
            style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

      </form>

      {/* CURRENT FACTORY DATA SUMMARY CARD / TABLE */}
      {submittedData && (
        <div className="current-summary-card">
          <div className="card-header" style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
                  <Factory size={20} className="text-success" />
                  <span>Current Factory Data</span>
                </h3>
                <span className="summary-header-badge">
                  <CheckCircle2 size={13} />
                  Stored Locally
                </span>
              </div>
              <p className="card-subtitle" style={{ margin: '0.2rem 0 0' }}>
                Active operational baseline for {submittedData.factoryName || 'Factory'} • Reporting Date: {submittedData.date || 'N/A'}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/emission-analysis')}
            >
              <span>View Emission Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="summary-grid">
            <div className="summary-metric-card">
              <span className="summary-metric-label">Factory & Location</span>
              <span className="summary-metric-value" style={{ fontSize: '1rem' }}>
                {submittedData.factoryName}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {submittedData.location} • {submittedData.industryType}
              </span>
            </div>

            <div className="summary-metric-card">
              <span className="summary-metric-label">Electricity Consumption</span>
              <span className="summary-metric-value">
                {Number(submittedData.electricityConsumption).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kWh</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                {submittedData.renewableEnergyPercent}% Renewable
              </span>
            </div>

            <div className="summary-metric-card">
              <span className="summary-metric-label">Fuel Intake</span>
              <span className="summary-metric-value">
                {Number(submittedData.fuelConsumption).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Liters</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Combustion source
              </span>
            </div>

            <div className="summary-metric-card">
              <span className="summary-metric-label">Total Scrap / Waste</span>
              <span className="summary-metric-value" style={{ color: '#0284c7' }}>
                {(
                  Number(submittedData.plasticWaste || 0) +
                  Number(submittedData.metalWaste || 0) +
                  Number(submittedData.paperWaste || 0) +
                  Number(submittedData.otherWaste || 0)
                ).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kg</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Plastic, Metal, Paper & Other
              </span>
            </div>
          </div>

          {/* Full Detailed Table */}
          <div className="summary-table-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Field Parameter</th>
                  <th>Submitted Value</th>
                  <th>Measurement Unit</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Factory Name</strong></td>
                  <td>{submittedData.factoryName}</td>
                  <td>Text Identifier</td>
                  <td>Profile</td>
                </tr>
                <tr>
                  <td><strong>Location</strong></td>
                  <td>{submittedData.location}</td>
                  <td>Facility Site</td>
                  <td>Profile</td>
                </tr>
                <tr>
                  <td><strong>Industry Type</strong></td>
                  <td>{submittedData.industryType}</td>
                  <td>Sector Classification</td>
                  <td>Profile</td>
                </tr>
                <tr>
                  <td><strong>Electricity Consumption</strong></td>
                  <td><strong>{Number(submittedData.electricityConsumption).toLocaleString()}</strong></td>
                  <td>kWh</td>
                  <td>Energy (Scope 2)</td>
                </tr>
                <tr>
                  <td><strong>Renewable Energy Share</strong></td>
                  <td><strong>{submittedData.renewableEnergyPercent}%</strong></td>
                  <td>Percentage (%)</td>
                  <td>Energy (Clean Offset)</td>
                </tr>
                <tr>
                  <td><strong>Fuel Consumption</strong></td>
                  <td><strong>{Number(submittedData.fuelConsumption).toLocaleString()}</strong></td>
                  <td>Liters</td>
                  <td>Fuel (Scope 1)</td>
                </tr>
                <tr>
                  <td><strong>Material Type</strong></td>
                  <td>{submittedData.materialType}</td>
                  <td>Primary Grade</td>
                  <td>Materials (Scope 3)</td>
                </tr>
                <tr>
                  <td><strong>Material Quantity</strong></td>
                  <td><strong>{Number(submittedData.materialQuantity).toLocaleString()}</strong></td>
                  <td>Units / Tons</td>
                  <td>Materials (Scope 3)</td>
                </tr>
                <tr>
                  <td><strong>Plastic Waste</strong></td>
                  <td><strong>{Number(submittedData.plasticWaste).toLocaleString()}</strong></td>
                  <td>kg</td>
                  <td>Waste (Disposal)</td>
                </tr>
                <tr>
                  <td><strong>Metal Waste</strong></td>
                  <td><strong>{Number(submittedData.metalWaste).toLocaleString()}</strong></td>
                  <td>kg</td>
                  <td>Waste (Disposal)</td>
                </tr>
                <tr>
                  <td><strong>Paper Waste</strong></td>
                  <td><strong>{Number(submittedData.paperWaste).toLocaleString()}</strong></td>
                  <td>kg</td>
                  <td>Waste (Disposal)</td>
                </tr>
                <tr>
                  <td><strong>Other Waste</strong></td>
                  <td><strong>{Number(submittedData.otherWaste).toLocaleString()}</strong></td>
                  <td>kg</td>
                  <td>Waste (Disposal)</td>
                </tr>
                <tr>
                  <td><strong>Production Units</strong></td>
                  <td><strong>{Number(submittedData.productionUnits).toLocaleString()}</strong></td>
                  <td>Units produced</td>
                  <td>Output</td>
                </tr>
                <tr>
                  <td><strong>Reporting Date</strong></td>
                  <td><strong>{submittedData.date}</strong></td>
                  <td>Date (YYYY-MM-DD)</td>
                  <td>Timeline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
