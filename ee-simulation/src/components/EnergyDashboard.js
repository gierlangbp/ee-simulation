import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Format number with comma as decimal separator and point as thousands separator
const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null) return '-';
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d+$)/, ",");
};

const EnergyDashboard = () => {
  // Input state
  const [building, setBuilding] = useState({
    length: 40,
    width: 20,
    floors: 10,
    floorHeight: 3.5,
    wwr: 30,
    roofType: 'datar',
    roofSlope: 30,
    monthlyBill: 150000000,
    coolingSystem: 'AC Central'
  });

  // Rates state
  const [rates, setRates] = useState({
    electricityTariff: 1587.92,
    emissionFactor: 0.87
  });

  // Intervention state
  const [interventions, setInterventions] = useState({
    solarGlass: false,
    reflectiveRoof: false,
    coolingSystem: '',
    exhaustFanSensors: false,
    ledLights: false,
    lightingControl: '',
    pumpSystem: '',
    waterHeater: false,
    bms: false,
    ems: false
  });

  // Custom investments state
  const [customInvestments, setCustomInvestments] = useState({
    solarGlass: 1310400000,
    reflectiveRoof: 136000000,
    coolingAirChiller: 6500000000,
    coolingWaterChiller: 8500000000,
    coolingVRF: 8000000000,
    coolingPackage: 16000000000,
    coolingSplitUnits: 18000000000,
    exhaustFanSensors: 60000000,
    ledLights: 216000000,
    lightingSeparate: 200000000,
    lightingCentralized: 540000000,
    pumpNew: 648000000,
    pumpExisting: 1300000000,
    waterHeater: 364000000,
    bms: 855000000,
    ems: 165000000
  });

  // Calculated values state
  const [calculated, setCalculated] = useState({
    buildingArea: 0,
    roofArea: 0,
    windowArea: 0,
    annualEnergy: 0,
    energySavings: 0,
    co2Reduction: 0,
    costSavings: 0,
    totalInvestment: 0,
    paybackPeriod: 0,
    deviceSavings: {
      cooling: 0,
      lighting: 0,
      ventilation: 0,
      office: 0,
      pumps: 0,
      hotWater: 0,
      others: 0
    }
  });

  // Energy distribution by device type (percentages)
  const deviceDistribution = {
    cooling: 0.69,
    lighting: 0.04,
    ventilation: 0.05,
    office: 0.07,
    pumps: 0.10,
    hotWater: 0.03,
    others: 0.02
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuilding(prev => ({
      ...prev,
      [name]: name === 'roofType' ? value : parseFloat(value) || 0
    }));
  };

  // Handle rates changes
  const handleRatesChange = (e) => {
    const { name, value } = e.target;
    setRates(prev => ({
      ...prev,
      [name]: parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0
    }));
  };

  // Handle intervention changes
  const handleInterventionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInterventions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle custom investment changes
  const handleInvestmentChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
    setCustomInvestments(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // Update calculated values when inputs change
  useEffect(() => {
    // Calculate building area
    const buildingArea = building.length * building.width * building.floors;
    
    // Calculate roof area
    let roofArea = building.length * building.width;
    if (building.roofType === 'pelana' || building.roofType === 'perisai') {
      const slopeRadians = (building.roofSlope * Math.PI) / 180;
      roofArea = roofArea / Math.cos(slopeRadians);
    }
    
    // Calculate window area
    const wallArea = 2 * (building.length + building.width) * building.floorHeight * building.floors;
    const windowArea = wallArea * (building.wwr / 100);
    
    // Calculate annual energy consumption in MWh
    const annualEnergy = ((building.monthlyBill / rates.electricityTariff) * 12) / 1000;

    // Set default investments based on calculations
    const solarGlassInvestment = windowArea * 0.5 * 650000;
    const reflectiveRoofInvestment = (roofArea / 20) * 1700000;
    
    // Update custom investments
    setCustomInvestments(prev => ({
      ...prev,
      solarGlass: solarGlassInvestment,
      reflectiveRoof: reflectiveRoofInvestment
    }));
    
    // Calculate savings for each intervention
    let totalSavingsPercent = 0;
    
    // Calculate energy savings for each intervention
    let savingsBySolarGlass = interventions.solarGlass ? 
      (interventions.coolingSystem || building.coolingSystem === 'AC Split' ? 2 : 8) : 0;
    
    let savingsByReflectiveRoof = 0;
    if (interventions.reflectiveRoof) {
      if (interventions.solarGlass) {
        savingsByReflectiveRoof = 2;
      } else if (interventions.coolingSystem) {
        savingsByReflectiveRoof = 1;
      } else {
        savingsByReflectiveRoof = 4;
      }
    }
    
    let savingsByCoolingSystem = 0;
    if (interventions.coolingSystem) {
      switch (interventions.coolingSystem) {
        case 'airChiller':
          savingsByCoolingSystem = 28;
          break;
        case 'waterChiller':
          savingsByCoolingSystem = 32;
          break;
        case 'vrfSystem':
          savingsByCoolingSystem = 33;
          break;
        case 'packageUnits':
          savingsByCoolingSystem = 28;
          break;
        case 'splitUnits':
          savingsByCoolingSystem = 30;
          break;
        default:
          savingsByCoolingSystem = 0;
      }
      
      // Apply reduction if other interventions are selected
      if (interventions.solarGlass) savingsByCoolingSystem -= 2;
      if (interventions.reflectiveRoof) savingsByCoolingSystem -= 2;
    }
    
    // Calculate BMS savings with conditions
    let savingsByBMS = interventions.bms ? 19 : 0;
    if (interventions.bms && interventions.coolingSystem) {
      savingsByBMS = 5; // Changed from 10% to 5%
    }
    
    // Exhaust fan sensors
    let savingsByExhaustFan = (!interventions.bms && interventions.exhaustFanSensors) ? 1 : 0;
    
    // LED lights - now with additional condition for BMS or lighting control
    let savingsByLED = interventions.ledLights ? 
      (interventions.bms || interventions.lightingControl ? 1 : 4) : 0;
    
    // Lighting control
    let savingsByLightingControl = 0;
    if (!interventions.bms && interventions.lightingControl) {
      savingsByLightingControl = interventions.lightingControl === 'separate' ? 2 : 3;
    }
    
    // Pump system - now with values for when BMS is selected
    let savingsByPumpSystem = 0;
    if (interventions.pumpSystem) {
      if (interventions.bms) {
        // New values when BMS is selected
        savingsByPumpSystem = interventions.pumpSystem === 'new' ? 1 : 2;
      } else {
        // Original values
        savingsByPumpSystem = interventions.pumpSystem === 'new' ? 2 : 4;
      }
    }
    
    // Water heater - now can have 0.1% effect even with BMS
    let savingsByWaterHeater = interventions.waterHeater ? 
      (interventions.bms ? 0.1 : 0.4) : 0;
    
    // Energy monitoring system
    let savingsByEMS = (!interventions.bms && interventions.ems) ? 4 : 0;
    
    // Sum up all savings percentages
    totalSavingsPercent = savingsBySolarGlass + 
                          savingsByReflectiveRoof + 
                          savingsByCoolingSystem + 
                          savingsByExhaustFan + 
                          savingsByLED + 
                          savingsByLightingControl + 
                          savingsByPumpSystem + 
                          savingsByWaterHeater + 
                          savingsByBMS + 
                          savingsByEMS;
    
    // Calculate energy savings in MWh/year
    const energySavings = annualEnergy * (totalSavingsPercent / 100);
    
    // Calculate CO2 reduction in tons CO2e/year
    const co2Reduction = energySavings * rates.emissionFactor;
    
    // Calculate cost savings in IDR/year
    const costSavings = energySavings * 1000 * rates.electricityTariff;
    
    // Calculate total investment
    let totalInvestment = 0;
    if (interventions.solarGlass) totalInvestment += customInvestments.solarGlass;
    if (interventions.reflectiveRoof) totalInvestment += customInvestments.reflectiveRoof;
    
    if (interventions.coolingSystem) {
      switch (interventions.coolingSystem) {
        case 'airChiller':
          totalInvestment += customInvestments.coolingAirChiller;
          break;
        case 'waterChiller':
          totalInvestment += customInvestments.coolingWaterChiller;
          break;
        case 'vrfSystem':
          totalInvestment += customInvestments.coolingVRF;
          break;
        case 'packageUnits':
          totalInvestment += customInvestments.coolingPackage;
          break;
        case 'splitUnits':
          totalInvestment += customInvestments.coolingSplitUnits;
          break;
      }
    }
    
    if (interventions.exhaustFanSensors && !interventions.bms) {
      totalInvestment += customInvestments.exhaustFanSensors;
    }
    
    if (interventions.ledLights) {
      totalInvestment += customInvestments.ledLights;
    }
    
    if (interventions.lightingControl && !interventions.bms) {
      totalInvestment += interventions.lightingControl === 'separate' ? 
        customInvestments.lightingSeparate : customInvestments.lightingCentralized;
    }
    
    if (interventions.pumpSystem && !interventions.bms) {
      totalInvestment += interventions.pumpSystem === 'new' ? 
        customInvestments.pumpNew : customInvestments.pumpExisting;
    }
    
    if (interventions.waterHeater && !interventions.bms) {
      totalInvestment += customInvestments.waterHeater;
    }
    
    if (interventions.bms) {
      totalInvestment += customInvestments.bms;
    }
    
    if (interventions.ems && !interventions.bms) {
      totalInvestment += customInvestments.ems;
    }
    
    // Calculate payback period
    const paybackPeriod = costSavings > 0 ? totalInvestment / costSavings : 0;
    
    // Calculate savings by device type
    const deviceSavings = {
      cooling: 0,
      lighting: 0,
      ventilation: 0,
      office: 0,
      pumps: 0,
      hotWater: 0,
      others: 0
    };
    
    // Attribution of savings to device types - clear implementation according to requirements
    // Reset all device savings first to ensure clean calculation
    Object.keys(deviceSavings).forEach(key => deviceSavings[key] = 0);
    
    // "Pendinginan" energy reduction results from kaca solar, cat reflektif, and sistem pendingin
    if (interventions.solarGlass || interventions.reflectiveRoof || interventions.coolingSystem) {
      deviceSavings.cooling += (savingsBySolarGlass + savingsByReflectiveRoof + savingsByCoolingSystem) / 100 * annualEnergy;
    }
    
    // "Ventilasi" energy reduction results from sensor pada unit exhaust fan
    if (interventions.exhaustFanSensors) {
      deviceSavings.ventilation += savingsByExhaustFan / 100 * annualEnergy;
    }
    
    // "Pencahayaan" energy reduction results from mengganti lampu and sistem kendali pencahayaan
    if (interventions.ledLights || interventions.lightingControl) {
      deviceSavings.lighting += (savingsByLED + savingsByLightingControl) / 100 * annualEnergy;
    }
    
    // "Pompa air" energy reduction results from sistem pompa air
    if (interventions.pumpSystem) {
      deviceSavings.pumps += savingsByPumpSystem / 100 * annualEnergy;
    }
    
    // "Air Panas" energy reduction results from mengganti pemanas air
    if (interventions.waterHeater) {
      deviceSavings.hotWater += savingsByWaterHeater / 100 * annualEnergy;
    }
    
    // "Perangkat kantor" and "Lainnya" would not result in reductions from any specific intervention
    // deviceSavings.office remains 0
    // deviceSavings.others remains 0
    
    // BMS and EMS savings distribution - Energy reduction from BMS will be equally distributed to 
    // "Pendinginan", "Pencahayaan", "Ventilasi", "Pompa Air", and "Air Panas"
    if (interventions.bms || interventions.ems) {
      const bmsEmsSavingsRatio = (savingsByBMS + savingsByEMS) / 100;
      
      // Only distribute to these 5 categories (excluding office and others)
      const categoriesToDistribute = ["cooling", "lighting", "ventilation", "pumps", "hotWater"];
      const totalDistributionWeight = categoriesToDistribute.reduce((sum, category) => 
        sum + deviceDistribution[category], 0);
      
      // Distribute BMS/EMS savings proportionally based on the original energy distribution
      categoriesToDistribute.forEach(category => {
        deviceSavings[category] += bmsEmsSavingsRatio * 
          (deviceDistribution[category] / totalDistributionWeight) * annualEnergy;
      });
    }
    
    // Update calculated state
    setCalculated({
      buildingArea,
      roofArea,
      windowArea,
      annualEnergy,
      energySavings,
      co2Reduction,
      costSavings,
      totalInvestment,
      paybackPeriod,
      deviceSavings,
      totalSavingsPercent
    });
    
  }, [building, rates, interventions, customInvestments]);
  
  // Prepare chart data
  const chartData = [
    {
      name: 'Pendinginan',
      KonsumsiEnergi: calculated.annualEnergy * deviceDistribution.cooling,
      ProyeksiReduksi: calculated.deviceSavings.cooling > 0 ? 
        calculated.annualEnergy * deviceDistribution.cooling - calculated.deviceSavings.cooling : 
        calculated.annualEnergy * deviceDistribution.cooling,
      HasReduction: calculated.deviceSavings.cooling > 0
    },
    {
      name: 'Pencahayaan',
      KonsumsiEnergi: calculated.annualEnergy * deviceDistribution.lighting,
      ProyeksiReduksi: calculated.deviceSavings.lighting > 0 ? 
        calculated.annualEnergy * deviceDistribution.lighting - calculated.deviceSavings.lighting : 
        calculated.annualEnergy * deviceDistribution.lighting,
      HasReduction: calculated.deviceSavings.lighting > 0
    },
    {
      name: 'Ventilasi',
      KonsumsiEnergi: calculated.annualEnergy * deviceDistribution.ventilation,
      ProyeksiReduksi: calculated.deviceSavings.ventilation > 0 ? 
        calculated.annualEnergy * deviceDistribution.ventilation - calculated.deviceSavings.ventilation : 
        calculated.annualEnergy * deviceDistribution.ventilation,
      HasReduction: calculated.deviceSavings.ventilation > 0
    },
    {
      name: 'Perangkat Kantor',
      KonsumsiEnergi: calculated.annualEnergy * deviceDistribution.office,
      ProyeksiReduksi: calculated.deviceSavings.office > 0 ? 
        calculated.annualEnergy * deviceDistribution.office - calculated.deviceSavings.office : 
        calculated.annualEnergy * deviceDistribution.office,
      HasReduction: calculated.deviceSavings.office > 0
    },
    {
      name: 'Pompa Air',
      KonsumsiEnergi: calculated.annualEnergy * deviceDistribution.pumps,
      ProyeksiReduksi: calculated.deviceSavings.pumps > 0 ? 
        calculated.annualEnergy * deviceDistribution.pumps - calculated.deviceSavings.pumps : 
        calculated.annualEnergy * deviceDistribution.pumps,
      HasReduction: calculated.deviceSavings.pumps > 0
    },
    {
      name: 'Air Panas',
      KonsumsiEnergi: calculated.annualEnergy * deviceDistribution.hotWater,
      ProyeksiReduksi: calculated.deviceSavings.hotWater > 0 ? 
        calculated.annualEnergy * deviceDistribution.hotWater - calculated.deviceSavings.hotWater : 
        calculated.annualEnergy * deviceDistribution.hotWater,
      HasReduction: calculated.deviceSavings.hotWater > 0
    },
    {
      name: 'Lainnya',
      KonsumsiEnergi: calculated.annualEnergy * deviceDistribution.others,
      ProyeksiReduksi: calculated.deviceSavings.others > 0 ? 
        calculated.annualEnergy * deviceDistribution.others - calculated.deviceSavings.others : 
        calculated.annualEnergy * deviceDistribution.others,
      HasReduction: calculated.deviceSavings.others > 0
    }
  ];

  return (
    <div className="container mx-auto p-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">Dashboard Simulasi Efisiensi Energi Bangunan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Input Data Bangunan</h2>
          
          <div className="mb-4">
            <label className="block mb-1">Dimensi Bangunan (m)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Panjang</label>
                <input
                  type="number"
                  name="length"
                  value={building.length}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="text-sm">Lebar</label>
                <input
                  type="number"
                  name="width"
                  value={building.width}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Jumlah Lantai</label>
            <input
              type="number"
              name="floors"
              value={building.floors}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              {building.floors < 8 ? 'Tingkat rendah' : 'Tingkat tinggi'}
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Tinggi Floor-to-floor (m)</label>
            <input
              type="number"
              name="floorHeight"
              value={building.floorHeight}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              step="0.1"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Window to Wall Ratio (%)</label>
            <input
              type="number"
              name="wwr"
              value={building.wwr}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              min="0"
              max="100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Jenis Atap</label>
            <select
              name="roofType"
              value={building.roofType}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            >
              <option value="datar">Atap Datar</option>
              <option value="pelana">Atap Pelana</option>
              <option value="perisai">Atap Perisai</option>
            </select>
            
            {(building.roofType === 'pelana' || building.roofType === 'perisai') && (
              <div className="mt-2">
                <label className="block mb-1">Kemiringan Atap (derajat)</label>
                <input
                  type="number"
                  name="roofSlope"
                  value={building.roofSlope}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  min="0"
                  max="60"
                />
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Tagihan Listrik Bulanan (Rp)</label>
            <input
              type="number"
              name="monthlyBill"
              value={building.monthlyBill}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              min="0"
              step="1000000"
            />
            <p className="text-sm text-gray-600 mt-1">
              Format: {formatNumber(building.monthlyBill, 0)} Rp
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Jenis Sistem Pendingin Dominan</label>
            <select
              name="coolingSystem"
              value={building.coolingSystem}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            >
              <option value="AC Split">AC Split</option>
              <option value="AC Central">AC Central</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Tarif Listrik (Rp/kWh)</label>
            <input
              type="number"
              name="electricityTariff"
              value={rates.electricityTariff}
              onChange={(e) => setRates(prev => ({...prev, electricityTariff: parseFloat(e.target.value) || 0}))}
              className="w-full border rounded p-2"
              step="0.01"
            />
            <p className="text-sm text-gray-600 mt-1">
              Format: {formatNumber(rates.electricityTariff, 2)} Rp/kWh
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Faktor Emisi Grid (kgCO₂e/kWh)</label>
            <input
              type="number"
              name="emissionFactor"
              value={rates.emissionFactor}
              onChange={(e) => setRates(prev => ({...prev, emissionFactor: parseFloat(e.target.value) || 0}))}
              className="w-full border rounded p-2"
              step="0.01"
            />
            <p className="text-sm text-gray-600 mt-1">
              Format: {formatNumber(rates.emissionFactor, 2)} kgCO₂e/kWh
            </p>
          </div>
        </div>
        
        {/* Calculated Values & Interventions */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Hasil Perhitungan</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Luas Bangunan</p>
              <p className="text-lg font-medium text-blue-700">{formatNumber(calculated.buildingArea, 2)} m²</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Luas Atap</p>
              <p className="text-lg font-medium text-blue-700">{formatNumber(calculated.roofArea, 2)} m²</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Luas Jendela</p>
              <p className="text-lg font-medium text-blue-700">{formatNumber(calculated.windowArea, 2)} m²</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Konsumsi Energi Tahunan</p>
              <p className="text-lg font-medium text-blue-700">{formatNumber(calculated.annualEnergy, 2)} MWh</p>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold mb-4 mt-6">Pilihan Intervensi</h2>
          
          <div className="mb-5">
            <p className="font-medium mb-2 bg-slate-600 text-white p-2 rounded">Building Envelope</p>
            
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 w-12 text-center">Pilih</th>
                  <th className="border p-2 text-left">Intervensi</th>
                  <th className="border p-2 w-32 text-center">Reduksi</th>
                  <th className="border p-2 w-40 text-center">Investasi (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      name="solarGlass"
                      checked={interventions.solarGlass}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2">
                    Memasang kaca solar pada kaca jendela (50% jendela)
                  </td>
                  <td className="border p-2 text-center">
                    {interventions.coolingSystem || building.coolingSystem === 'AC Split' ? '2%' : '8%'}
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="solarGlass"
                      value={formatNumber(customInvestments.solarGlass, 0)}
                      onChange={handleInvestmentChange}
                      className="w-full border rounded p-1 text-right"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      name="reflectiveRoof"
                      checked={interventions.reflectiveRoof}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2">
                    Cat reflektif pada atap
                  </td>
                  <td className="border p-2 text-center">
                    {interventions.solarGlass ? '2%' : 
                     interventions.coolingSystem ? '1%' : '4%'}
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="reflectiveRoof"
                      value={formatNumber(customInvestments.reflectiveRoof, 0)}
                      onChange={handleInvestmentChange}
                      className="w-full border rounded p-1 text-right"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mb-5">
            <p className="font-medium mb-2 bg-slate-600 text-white p-2 rounded">Cooling System</p>
            
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 w-12 text-center">Pilih</th>
                  <th className="border p-2 text-left">Intervensi</th>
                  <th className="border p-2 w-32 text-center">Reduksi</th>
                  <th className="border p-2 w-40 text-center">Investasi (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {building.coolingSystem === 'AC Central' ? (
                  // Options for AC Central
                  <>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="airChiller"
                          checked={interventions.coolingSystem === 'airChiller'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace old chiller with central air-cooled chiller
                      </td>
                      <td className="border p-2 text-center">
                        {28 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingAirChiller"
                          value={formatNumber(customInvestments.coolingAirChiller, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="waterChiller"
                          checked={interventions.coolingSystem === 'waterChiller'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace old chiller with central water-cooled chiller
                      </td>
                      <td className="border p-2 text-center">
                        {32 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingWaterChiller"
                          value={formatNumber(customInvestments.coolingWaterChiller, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="vrfSystem"
                          checked={interventions.coolingSystem === 'vrfSystem'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace old chiller with VRF system
                      </td>
                      <td className="border p-2 text-center">
                        {33 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingVRF"
                          value={formatNumber(customInvestments.coolingVRF, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="packageUnits"
                          checked={interventions.coolingSystem === 'packageUnits'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace old chiller with cold air package units
                      </td>
                      <td className="border p-2 text-center">
                        {28 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingPackage"
                          value={formatNumber(customInvestments.coolingPackage, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="splitUnits"
                          checked={interventions.coolingSystem === 'splitUnits'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace old chiller with new energy efficient mini split units
                      </td>
                      <td className="border p-2 text-center">
                        {30 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingSplitUnits"
                          value={formatNumber(customInvestments.coolingSplitUnits, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                  </>
                ) : (
                  // Options for AC Split
                  <>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="airChiller"
                          checked={interventions.coolingSystem === 'airChiller'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace all mini split units with central air-cooled chiller
                      </td>
                      <td className="border p-2 text-center">
                        {28 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingAirChiller"
                          value={formatNumber(customInvestments.coolingAirChiller, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="waterChiller"
                          checked={interventions.coolingSystem === 'waterChiller'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace all mini split units with central water-cooled chiller
                      </td>
                      <td className="border p-2 text-center">
                        {32 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingWaterChiller"
                          value={formatNumber(customInvestments.coolingWaterChiller, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="vrfSystem"
                          checked={interventions.coolingSystem === 'vrfSystem'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace mini split units with VRF system
                      </td>
                      <td className="border p-2 text-center">
                        {33 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingVRF"
                          value={formatNumber(customInvestments.coolingVRF, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="packageUnits"
                          checked={interventions.coolingSystem === 'packageUnits'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace all mini split units with cold air package units
                      </td>
                      <td className="border p-2 text-center">
                        {28 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingPackage"
                          value={formatNumber(customInvestments.coolingPackage, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 text-center">
                        <input
                          type="radio"
                          name="coolingSystem"
                          value="splitUnits"
                          checked={interventions.coolingSystem === 'splitUnits'}
                          onChange={handleInterventionChange}
                        />
                      </td>
                      <td className="border p-2">
                        Replace old mini split units with new energy efficient mini split
                      </td>
                      <td className="border p-2 text-center">
                        {30 - (interventions.solarGlass ? 2 : 0) - (interventions.reflectiveRoof ? 2 : 0)}%
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          name="coolingSplitUnits"
                          value={formatNumber(customInvestments.coolingSplitUnits, 0)}
                          onChange={handleInvestmentChange}
                          className="w-full border rounded p-1 text-right"
                        />
                      </td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="radio"
                      name="coolingSystem"
                      value=""
                      checked={interventions.coolingSystem === ''}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2" colSpan="3">
                    Tidak ada
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mb-4">
            <p className="font-medium mb-2 bg-slate-600 text-white p-2 rounded">Air Handling System</p>
            
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="exhaustFanSensors"
                checked={interventions.exhaustFanSensors}
                onChange={handleInterventionChange}
                disabled={interventions.bms}
                className={`mr-2 ${interventions.bms ? 'opacity-50' : ''}`}
              />
              <span className={interventions.bms ? 'opacity-50' : ''}>
                Memasang sensor pada unit exhaust fan yang ada
              </span>
            </label>
            <div className="flex justify-between text-sm pl-6">
              <span>Penurunan energi: {interventions.bms ? '0%' : '1%'}</span>
              <div className="flex items-center">
                <span className="mr-1">Rp</span>
                <input
                  type="text"
                  name="exhaustFanSensors"
                  value={formatNumber(customInvestments.exhaustFanSensors, 0)}
                  onChange={handleInvestmentChange}
                  className="w-32 border rounded p-1 text-right"
                  disabled={interventions.bms}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* More Interventions & Results */}
        <div className="bg-white p-4 rounded shadow">
          <div className="mb-4">
            <p className="font-medium mb-2 bg-slate-600 text-white p-2 rounded">Lighting System</p>
            
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="ledLights"
                checked={interventions.ledLights}
                onChange={handleInterventionChange}
                className="mr-2"
              />
              <span>Mengganti lampu CFL dengan LED</span>
            </label>
            <div className="flex justify-between text-sm pl-6">
              <span>
                Penurunan energi: {(interventions.bms || interventions.lightingControl) ? '1%' : '4%'}
              </span>
              <div className="flex items-center">
                <span className="mr-1">Rp</span>
                <input
                  type="text"
                  name="ledLights"
                  value={formatNumber(customInvestments.ledLights, 0)}
                  onChange={handleInvestmentChange}
                  className="w-32 border rounded p-1 text-right"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="font-medium mb-2 pl-4">Sistem kendali pencahayaan</p>
            
            <label className="flex items-center mb-2 pl-6">
              <input
                type="radio"
                name="lightingControl"
                value="separate"
                checked={interventions.lightingControl === 'separate'}
                onChange={handleInterventionChange}
                disabled={interventions.bms}
                className={`mr-2 ${interventions.bms ? 'opacity-50' : ''}`}
              />
              <span className={interventions.bms ? 'opacity-50' : ''}>
                Sistem kendali pencahayaan terpisah
              </span>
            </label>
            <div className="flex justify-between text-sm pl-10">
              <span>Penurunan energi: {interventions.bms ? '0%' : '2%'}</span>
              <div className="flex items-center">
                <span className="mr-1">Rp</span>
                <input
                  type="text"
                  name="lightingSeparate"
                  value={formatNumber(customInvestments.lightingSeparate, 0)}
                  onChange={handleInvestmentChange}
                  className="w-32 border rounded p-1 text-right"
                  disabled={interventions.bms}
                />
              </div>
            </div>
            
            <label className="flex items-center mb-2 pl-6">
              <input
                type="radio"
                name="lightingControl"
                value="centralized"
                checked={interventions.lightingControl === 'centralized'}
                onChange={handleInterventionChange}
                disabled={interventions.bms}
                className={`mr-2 ${interventions.bms ? 'opacity-50' : ''}`}
              />
              <span className={interventions.bms ? 'opacity-50' : ''}>
                Sistem kendali pencahayaan terpusat
              </span>
            </label>
            <div className="flex justify-between text-sm pl-10">
              <span>Penurunan energi: {interventions.bms ? '0%' : '3%'}</span>
              <div className="flex items-center">
                <span className="mr-1">Rp</span>
                <input
                  type="text"
                  name="lightingCentralized"
                  value={formatNumber(customInvestments.lightingCentralized, 0)}
                  onChange={handleInvestmentChange}
                  className="w-32 border rounded p-1 text-right"
                  disabled={interventions.bms}
                />
              </div>
            </div>
            
            <label className="flex items-center mb-2 pl-6">
              <input
                type="radio"
                name="lightingControl"
                value=""
                checked={interventions.lightingControl === ''}
                onChange={handleInterventionChange}
                className="mr-2"
              />
              <span>Tidak ada</span>
            </label>
          </div>
          
          <div className="mb-5">
            <p className="font-medium mb-2 bg-slate-600 text-white p-2 rounded">Water System</p>
            
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 w-12 text-center">Pilih</th>
                  <th className="border p-2 text-left">Intervensi</th>
                  <th className="border p-2 w-32 text-center">Reduksi</th>
                  <th className="border p-2 w-40 text-center">Investasi (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="radio"
                      name="pumpSystem"
                      value="new"
                      checked={interventions.pumpSystem === 'new'}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2">
                    Mengganti pompa air lama dengan pompa air baru yang dilengkapi frequency drive control
                  </td>
                  <td className="border p-2 text-center">
                    {interventions.bms ? '1%' : '2%'}
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="pumpNew"
                      value={formatNumber(customInvestments.pumpNew, 0)}
                      onChange={handleInvestmentChange}
                      className="w-full border rounded p-1 text-right"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="radio"
                      name="pumpSystem"
                      value="existing"
                      checked={interventions.pumpSystem === 'existing'}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2">
                    Memasang frequency drive control pada pompa yang sudah ada
                  </td>
                  <td className="border p-2 text-center">
                    {interventions.bms ? '2%' : '4%'}
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="pumpExisting"
                      value={formatNumber(customInvestments.pumpExisting, 0)}
                      onChange={handleInvestmentChange}
                      className="w-full border rounded p-1 text-right"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="radio"
                      name="pumpSystem"
                      value=""
                      checked={interventions.pumpSystem === ''}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2" colSpan="3">
                    Tidak ada perubahan pada sistem pompa air
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      name="waterHeater"
                      checked={interventions.waterHeater}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2">
                    Mengganti pemanas air yang lama dengan pemanas air on-demand
                  </td>
                  <td className="border p-2 text-center">
                    {interventions.bms ? '0,1%' : '0,4%'}
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="waterHeater"
                      value={formatNumber(customInvestments.waterHeater, 0)}
                      onChange={handleInvestmentChange}
                      className="w-full border rounded p-1 text-right"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mb-5">
            <p className="font-medium mb-2 bg-slate-600 text-white p-2 rounded">Building Management and Energy Monitoring System</p>
            
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 w-12 text-center">Pilih</th>
                  <th className="border p-2 text-left">Intervensi</th>
                  <th className="border p-2 w-32 text-center">Reduksi</th>
                  <th className="border p-2 w-40 text-center">Investasi (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      name="bms"
                      checked={interventions.bms}
                      onChange={handleInterventionChange}
                    />
                  </td>
                  <td className="border p-2">
                    Memasang Building Management System (BMS)
                  </td>
                  <td className="border p-2 text-center">
                    {interventions.coolingSystem ? '5%' : '19%'}
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="bms"
                      value={formatNumber(customInvestments.bms, 0)}
                      onChange={handleInvestmentChange}
                      className="w-full border rounded p-1 text-right"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      name="ems"
                      checked={interventions.ems}
                      onChange={handleInterventionChange}
                      disabled={interventions.bms}
                      className={interventions.bms ? 'opacity-50' : ''}
                    />
                  </td>
                  <td className={interventions.bms ? 'border p-2 opacity-50' : 'border p-2'}>
                    Memasang Energy Monitoring System
                  </td>
                  <td className={interventions.bms ? 'border p-2 text-center opacity-50' : 'border p-2 text-center'}>
                    {interventions.bms ? '0%' : '4%'}
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="ems"
                      value={formatNumber(customInvestments.ems, 0)}
                      onChange={handleInvestmentChange}
                      className="w-full border rounded p-1 text-right"
                      disabled={interventions.bms}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h2 className="text-lg font-semibold mt-6 mb-4">Hasil</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-center mb-4 text-blue-800">Hasil Analisis Energi</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Total Penurunan Energi</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(calculated.totalSavingsPercent, 1)}%</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Energy Savings</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(calculated.energySavings, 2)}</p>
                <p className="text-xs text-gray-500">MWh/tahun</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">CO₂ Reduction</p>
                <p className="text-xl font-bold text-green-700">{formatNumber(calculated.co2Reduction, 2)}</p>
                <p className="text-xs text-gray-500">ton CO₂e/tahun</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Cost Savings</p>
                <p className="text-xl font-bold text-green-700">Rp {formatNumber(calculated.costSavings, 0)}</p>
                <p className="text-xs text-gray-500">per tahun</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Investment</p>
                <p className="text-xl font-bold text-blue-700">Rp {formatNumber(calculated.totalInvestment, 0)}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Payback Period</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(calculated.paybackPeriod, 1)}</p>
                <p className="text-xs text-gray-500">tahun</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visualization Section */}
      <div className="mt-8 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Visualisasi Konsumsi Energi Per Jenis Perangkat</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
          <p className="font-semibold mb-2">Sumber Penghematan Energi:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">Pendinginan:</span> Kaca solar, cat reflektif, dan sistem pendingin</li>
            <li><span className="font-medium">Pencahayaan:</span> Mengganti lampu LED dan sistem kendali pencahayaan</li>
            <li><span className="font-medium">Ventilasi:</span> Sensor pada unit exhaust fan</li>
            <li><span className="font-medium">Pompa Air:</span> Sistem pompa air</li>
            <li><span className="font-medium">Air Panas:</span> Mengganti pemanas air</li>
            <li><span className="font-medium">BMS/EMS:</span> Penghematan terdistribusi ke Pendinginan, Pencahayaan, Ventilasi, Pompa Air, dan Air Panas</li>
          </ul>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'MWh/tahun', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === "KonsumsiEnergi") {
                    return [`${formatNumber(value, 2)} MWh`, "Konsumsi Energi"];
                  } else {
                    // Only show reduction info if there's actually a reduction
                    if (props.payload.HasReduction) {
                      const savings = props.payload.KonsumsiEnergi - props.payload.ProyeksiReduksi;
                      const percentage = (savings / props.payload.KonsumsiEnergi * 100).toFixed(1);
                      return [`${formatNumber(value, 2)} MWh (${percentage}% penghematan)`, "Proyeksi Reduksi Energi"];
                    }
                    return ["Tidak ada penghematan", "Proyeksi Reduksi Energi"];
                  }
                }}
              />
              <Legend />
              <Bar dataKey="KonsumsiEnergi" stackId="a" fill="#3B82F6" name="Konsumsi Energi" />
              <Bar 
                dataKey="ProyeksiReduksi" 
                stackId="a" 
                fill="#10B981" 
                name="Proyeksi Reduksi Energi"
                // Only show the green bar if there's actually a reduction
                isAnimationActive={true}
                shape={(props) => {
                  const { x, y, width, height, fill, payload } = props;
                  return payload.HasReduction ? (
                    <rect x={x} y={y} width={width} height={height} fill={fill} />
                  ) : null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EnergyDashboard;