// Main Application Module
// Orchestrates the entire clinical trial dashboard - data loading, chart rendering, UI management

// ============================================================================
// GLOBAL STATE MANAGEMENT
// ============================================================================

/**
 * Application state
 * @type {Object}
 */
let appState = {
  clinicalData: null,
  imagingData: null,
  survivalData: null,
  advancedData: null,
  currentStudy: 1,
  isLoading: false,
  hasError: false,
  errorMessage: ''
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the dashboard when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Clinical Trial Dashboard initializing...');

  // Set up event listeners
  initializeEventListeners();

  // Initialize home page animations
  initializeHomePage();

  // Auto-load data on page load for immediate visualization
  loadDataAndRenderDashboard();

  console.log('Dashboard initialized successfully');
});

/**
 * Set up all event listeners for interactive elements
 */
function initializeEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', handleTabSwitch);
  });
  console.log('Tab button listeners attached');

  // Load Data Button
  const loadDataBtn = document.getElementById('load-data-btn');
  if (loadDataBtn) {
    loadDataBtn.addEventListener('click', loadDataAndRenderDashboard);
    console.log('Load Data button listener attached');
  }

  // Adverse Events Filter Button (placeholder for future enhancement)
  const aeFilterBtn = document.getElementById('ae-filter-btn');
  if (aeFilterBtn) {
    aeFilterBtn.addEventListener('click', handleAEFilter);
    console.log('AE Filter button listener attached');
  }

  // Adverse Events Export Button
  const aeExportBtn = document.getElementById('ae-export-btn');
  if (aeExportBtn) {
    aeExportBtn.addEventListener('click', handleAEExport);
    console.log('AE Export button listener attached');
  }

  // Chart Info Buttons (tooltips/modal - placeholder)
  const chartInfoButtons = document.querySelectorAll('.chart-info-btn');
  chartInfoButtons.forEach(btn => {
    btn.addEventListener('click', handleChartInfo);
  });

  // Window resize handler for responsive charts
  window.addEventListener('resize', debounce(handleWindowResize, 300));
  console.log('Window resize listener attached');
}

// ============================================================================
// DATA LOADING & RENDERING
// ============================================================================

/**
 * Main function to load data and render entire dashboard
 * Handles loading state, error handling, and successful rendering
 */
async function loadDataAndRenderDashboard() {
  // Prevent multiple simultaneous loads
  if (appState.isLoading) {
    console.log('Data loading already in progress, ignoring request');
    return;
  }

  try {
    // Show loading overlay
    showLoading();
    appState.isLoading = true;
    appState.hasError = false;
    appState.errorMessage = '';

    console.log('Starting data load...');

    // Load all four studies' data
    const [clinicalData, imagingData, survivalData, advancedData] = await Promise.all([
      loadClinicalData(),
      loadImagingData(),
      loadSurvivalData(),
      loadAdvancedAnalyticsData()
    ]);

    // Validate data
    if (!clinicalData || clinicalData.length === 0) {
      throw new Error('No clinical data loaded');
    }

    if (!imagingData || imagingData.length === 0) {
      throw new Error('No imaging data loaded');
    }

    if (!survivalData || survivalData.length === 0) {
      throw new Error('No survival data loaded');
    }

    if (!advancedData || !advancedData.patients || advancedData.patients.length === 0) {
      throw new Error('No advanced analytics data loaded');
    }

    console.log(`Successfully loaded ${clinicalData.length} clinical trial records`);
    console.log(`Successfully loaded ${imagingData.length} imaging study records`);
    console.log(`Successfully loaded ${survivalData.length} survival study records`);
    console.log(`Successfully loaded ${advancedData.patients.length} advanced analytics patient records`);

    // Store data in application state
    appState.clinicalData = clinicalData;
    appState.imagingData = imagingData;
    appState.survivalData = survivalData;
    appState.advancedData = advancedData;

    // Render the current study (defaults to study 1)
    if (appState.currentStudy === 1) {
      renderClinicalStudy(clinicalData);
    } else if (appState.currentStudy === 2) {
      renderImagingStudy(imagingData);
    } else if (appState.currentStudy === 3) {
      renderSurvivalStudy(survivalData);
    } else if (appState.currentStudy === 4) {
      renderAdvancedAnalyticsStudy(advancedData);
    }

    // Update footer with study information
    updateFooter(clinicalData);

    // Success notification
    console.log('Dashboard rendered successfully');
    showSuccessMessage(`Successfully loaded both studies`);

  } catch (error) {
    // Handle errors gracefully
    console.error('Error loading data:', error);
    appState.hasError = true;
    appState.errorMessage = error.message;
    showError(`Failed to load data: ${error.message}`);
  } finally {
    // Always hide loading overlay
    hideLoading();
    appState.isLoading = false;
  }
}

/**
 * Render clinical trial study (Study 1)
 * @param {Array<Object>} data - Clinical trial data
 */
function renderClinicalStudy(data) {
  console.log('Rendering clinical trial study...');

  try {
    // Remove placeholders first
    const study1Container = document.getElementById('study-1');
    if (study1Container) {
      const placeholders = study1Container.querySelectorAll('.chart-placeholder');
      placeholders.forEach(p => p.remove());
    }

    // 1. Update Summary Statistics (KPI Cards)
    console.log('Updating summary statistics...');
    updateSummaryStats(data);

    // 2. Render Treatment Comparison Chart
    console.log('Creating treatment comparison chart...');
    createTreatmentComparisonChart(data, 'treatment-chart');

    // 3. Render Trajectory Plot
    console.log('Creating trajectory plot...');
    createTrajectoryPlot(data, 'trajectory-chart');

    // 4. Render Forest Plot
    console.log('Creating forest plot...');
    createForestPlot(data, 'forest-plot');

    // 5. Render Waterfall Plot
    console.log('Creating waterfall plot...');
    createWaterfallPlot(data, 'waterfall-chart');

    // 6. Render Adverse Events Chart
    console.log('Creating adverse events chart...');
    createAdverseEventsChart(data, 'adverse-events-chart');

    // 7. Render Responder Donut Chart
    console.log('Creating responder donut chart...');
    createResponderDonutChart('responder-donut-chart', data);

    // 8. Render NNT Icon Array
    console.log('Creating NNT icon array...');
    createNNTIconArray('nnt-icon-array', data);

    // 9. Update NNT KPI Card
    console.log('Updating NNT KPI card...');
    updateNNTCard(data);

    console.log('Clinical trial study rendered successfully');

  } catch (error) {
    console.error('Error rendering clinical study:', error);
    throw new Error(`Clinical study rendering failed: ${error.message}`);
  }
}

/**
 * Update the NNT KPI card with calculated values
 * @param {Array<Object>} data - Clinical trial data
 */
function updateNNTCard(data) {
  // Filter by treatment group
  const treatmentData = data.filter(d => d.treatment_group === 'Treatment');
  const placeboData = data.filter(d => d.treatment_group === 'Placebo');

  // Count responders (>=20% reduction at week 12)
  const treatmentResponders = treatmentData.filter(d => d.pct_change_week12 <= -20).length;
  const placeboResponders = placeboData.filter(d => d.pct_change_week12 <= -20).length;

  // Calculate response rates
  const treatmentRate = treatmentResponders / treatmentData.length;
  const placeboRate = placeboResponders / placeboData.length;

  // Calculate ARR and NNT
  const ARR = treatmentRate - placeboRate;
  const NNT = ARR > 0 ? Math.ceil(1 / ARR) : Infinity;

  // Update the NNT KPI card
  const nntCard = document.getElementById('stat-nnt');
  if (nntCard) {
    const valueEl = nntCard.querySelector('.kpi-value');
    const trendEl = nntCard.querySelector('.kpi-trend');

    if (valueEl) {
      valueEl.textContent = NNT === Infinity ? 'N/A' : NNT;
      if (NNT !== Infinity && NNT <= 5) {
        valueEl.style.color = '#00C853'; // Green for very good NNT
      } else if (NNT !== Infinity && NNT <= 10) {
        valueEl.style.color = '#FFA726'; // Orange for moderate NNT
      }
    }

    if (trendEl) {
      trendEl.textContent = `ARR: ${(ARR * 100).toFixed(1)}%`;
    }
  }

  console.log(`NNT calculated: ${NNT}, ARR: ${(ARR * 100).toFixed(1)}%`);
}

/**
 * Renders the redesigned Diagnostic Imaging Study (Study 2)
 * @param {Array} data - Array of imaging study patient data
 */
function renderImagingStudy(data) {
    console.log('Rendering Advanced Diagnostic Imaging Study with', data.length, 'patients');

    // Clear any placeholder content
    const study2Container = document.getElementById('study-2');
    if (study2Container) {
        const placeholders = study2Container.querySelectorAll('.chart-placeholder');
        placeholders.forEach(p => p.remove());
    }

    // Create diagnostic gauges
    createDiagnosticGauges('diagnostic-gauges', data, 0.5);

    // Create ROC and PR curves
    createROCCurve('roc-curve', data);
    createPRCurve('pr-curve', data);

    // Create score distribution
    createScoreDistribution('score-distribution', data, 0.5);

    // Create calibration plot
    createCalibrationPlot('calibration-plot', data);

    // Create interactive threshold explorer
    createThresholdExplorer('threshold-explorer', data);

    // Create decision curve analysis
    createDecisionCurve('decision-curve', data);
}

/**
 * Render oncology survival study (Study 3)
 * @param {Array<Object>} data - Survival study data
 */
function renderSurvivalStudy(data) {
  console.log('Rendering oncology survival study...');

  try {
    // Remove placeholders first
    const study3Container = document.getElementById('study-3');
    if (study3Container) {
      const placeholders = study3Container.querySelectorAll('.chart-placeholder');
      placeholders.forEach(p => p.remove());
    }

    // 1. Create Demographics Cards
    console.log('Creating survival demographics cards...');
    createSurvivalDemographicsCards(data);

    // 2. Update RMST Card
    console.log('Calculating RMST values...');
    updateRMSTCard(data, 24);

    // 3. Render Kaplan-Meier Curve
    console.log('Creating Kaplan-Meier survival curves...');
    createKaplanMeierCurve(data, 'km-curve');

    // 4. Render Survival Summary
    console.log('Creating survival summary chart...');
    createSurvivalSummaryChart(data, 'survival-summary');

    // 5. Render Hazard Ratio Forest Plot
    console.log('Creating hazard ratio forest plot...');
    createHRForestPlot(data, 'hr-forest-plot');

    // 6. Render Events Summary
    console.log('Creating events summary chart...');
    createEventsSummaryChart(data, 'events-summary');

    // 7. Render Swimmer Plot
    console.log('Creating survival swimmer plot...');
    createSurvivalSwimmerPlot(data, 'survival-swimmer-plot');

    // 8. Render Cumulative Events Chart
    console.log('Creating cumulative events chart...');
    createCumulativeEventsChart(data, 'cumulative-events-chart');

    console.log('Oncology survival study rendered successfully');

  } catch (error) {
    console.error('Error rendering survival study:', error);
    throw new Error(`Survival study rendering failed: ${error.message}`);
  }
}

/**
 * Renders the Advanced Analytics Showcase (Study 4)
 * @param {Object} data - Advanced analytics data with patients, biomarkers, ae_cooccurrence
 */
function renderAdvancedAnalyticsStudy(data) {
  console.log('Rendering Advanced Analytics Study with', data.patients.length, 'patients');

  try {
    // Remove placeholders first
    const study4Container = document.getElementById('study-4');
    if (study4Container) {
      const placeholders = study4Container.querySelectorAll('.chart-placeholder');
      placeholders.forEach(p => p.remove());
    }

    // Create KPI cards
    createAdvancedKPICards(data);

    // Create all visualizations
    createSwimmerPlot('swimmer-plot', data);
    createAdvancedWaterfallPlot('advanced-waterfall', data);
    createSankeyDiagram('sankey-diagram', data);
    createVolcanoPlot('volcano-plot', data);
    createRidgelinePlot('ridgeline-plot', data);
    createChordDiagram('chord-diagram', data);

    console.log('Advanced Analytics study rendered successfully');

  } catch (error) {
    console.error('Error rendering Advanced Analytics study:', error);
    throw new Error(`Advanced Analytics study rendering failed: ${error.message}`);
  }
}

/**
 * Creates KPI cards for Advanced Analytics dashboard
 * @param {Object} data - Advanced analytics data
 */
function createAdvancedKPICards(data) {
  const container = document.getElementById('advanced-demographics');
  if (!container) return;

  const patients = data.patients;
  const totalPatients = patients.length;

  // Calculate response rate (CR + PR)
  const responders = patients.filter(p => p.response_category === 'CR' || p.response_category === 'PR').length;
  const responseRate = ((responders / totalPatients) * 100).toFixed(1);

  // Calculate median treatment duration
  const durations = patients.map(p => p.treatment_end_day - p.treatment_start_day);
  const sortedDurations = durations.sort((a, b) => a - b);
  const medianDuration = sortedDurations[Math.floor(sortedDurations.length / 2)];

  // Count significant biomarkers
  const significantBiomarkers = data.biomarkers.filter(b => b.significant).length;

  // Calculate safety signal (Grade 3+ AEs)
  let grade3Plus = 0;
  patients.forEach(p => {
    if (p.adverse_events) {
      grade3Plus += p.adverse_events.filter(ae => ae.grade >= 3).length;
    }
  });

  container.innerHTML = `
    <article class="kpi-card">
      <div class="kpi-icon" aria-hidden="true">👥</div>
      <div class="kpi-content">
        <h3 class="kpi-label">ENROLLED PATIENTS</h3>
        <p class="kpi-value">${totalPatients}</p>
        <span class="kpi-trend">Phase II Oncology Trial</span>
      </div>
    </article>
    <article class="kpi-card">
      <div class="kpi-icon" aria-hidden="true">🎯</div>
      <div class="kpi-content">
        <h3 class="kpi-label">OBJECTIVE RESPONSE</h3>
        <p class="kpi-value" style="color: #00C853">${responseRate}%</p>
        <span class="kpi-trend">${responders} of ${totalPatients} patients (CR+PR)</span>
      </div>
    </article>
    <article class="kpi-card">
      <div class="kpi-icon" aria-hidden="true">🧬</div>
      <div class="kpi-content">
        <h3 class="kpi-label">BIOMARKER SIGNALS</h3>
        <p class="kpi-value" style="color: #00D9FF">${significantBiomarkers}</p>
        <span class="kpi-trend">Significant markers identified</span>
      </div>
    </article>
    <article class="kpi-card">
      <div class="kpi-icon" aria-hidden="true">⏱️</div>
      <div class="kpi-content">
        <h3 class="kpi-label">MEDIAN TREATMENT</h3>
        <p class="kpi-value">${medianDuration}</p>
        <span class="kpi-trend">Days on treatment</span>
      </div>
    </article>
  `;
}

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Show loading overlay with spinner
 */
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.hidden = false;
    overlay.setAttribute('aria-busy', 'true');
    console.log('Loading overlay shown');
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.hidden = true;
    overlay.setAttribute('aria-busy', 'false');
    console.log('Loading overlay hidden');
  }
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
  // Create error notification if not exists
  let errorNotification = document.getElementById('error-notification');

  if (!errorNotification) {
    errorNotification = document.createElement('div');
    errorNotification.id = 'error-notification';
    errorNotification.className = 'notification error-notification';
    errorNotification.setAttribute('role', 'alert');
    errorNotification.setAttribute('aria-live', 'assertive');
    document.body.appendChild(errorNotification);
  }

  // Set error message with icon
  errorNotification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">⚠️</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">&times;</button>
    </div>
  `;

  // Add inline styles (since notification styles may not be in CSS)
  Object.assign(errorNotification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    padding: '16px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: '10000',
    maxWidth: '400px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5'
  });

  // Show notification
  errorNotification.style.display = 'block';

  // Close button handler
  const closeBtn = errorNotification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      errorNotification.style.display = 'none';
    };
    closeBtn.style.cssText = 'background: none; border: none; color: white; font-size: 20px; cursor: pointer; margin-left: 10px;';
  }

  // Auto-hide after 8 seconds
  setTimeout(() => {
    if (errorNotification) {
      errorNotification.style.display = 'none';
    }
  }, 8000);

  console.error('Error displayed to user:', message);
}

/**
 * Display success message to user
 * @param {string} message - Success message to display
 */
function showSuccessMessage(message) {
  // Create success notification if not exists
  let successNotification = document.getElementById('success-notification');

  if (!successNotification) {
    successNotification = document.createElement('div');
    successNotification.id = 'success-notification';
    successNotification.className = 'notification success-notification';
    successNotification.setAttribute('role', 'status');
    successNotification.setAttribute('aria-live', 'polite');
    document.body.appendChild(successNotification);
  }

  // Set success message with icon
  successNotification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">✓</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">&times;</button>
    </div>
  `;

  // Add inline styles
  Object.assign(successNotification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    padding: '16px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: '10000',
    maxWidth: '400px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5'
  });

  // Show notification
  successNotification.style.display = 'block';

  // Close button handler
  const closeBtn = successNotification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      successNotification.style.display = 'none';
    };
    closeBtn.style.cssText = 'background: none; border: none; color: white; font-size: 20px; cursor: pointer; margin-left: 10px;';
  }

  // Auto-hide after 4 seconds
  setTimeout(() => {
    if (successNotification) {
      successNotification.style.display = 'none';
    }
  }, 4000);

  console.log('Success message displayed:', message);
}

/**
 * Remove placeholder content from chart containers
 */
function removePlaceholders() {
  const placeholders = document.querySelectorAll('.chart-placeholder');
  placeholders.forEach(placeholder => {
    placeholder.remove();
  });
  console.log(`Removed ${placeholders.length} chart placeholders`);
}

/**
 * Update footer with study information
 * @param {Array<Object>} data - Clinical trial data (unused but available for dynamic info)
 */
function updateFooter(data) {
  // Static study information
  const studyInfo = {
    protocolId: 'STUDY-2024-001',
    phase: 'Phase III',
    status: 'Completed',
    dataLockDate: '2024-12-15'
  };

  // Update Protocol ID
  const protocolEl = document.getElementById('protocol-id');
  if (protocolEl) {
    protocolEl.textContent = studyInfo.protocolId;
  }

  // Update Phase
  const phaseEl = document.getElementById('trial-phase');
  if (phaseEl) {
    phaseEl.textContent = studyInfo.phase;
  }

  // Update Status
  const statusEl = document.getElementById('trial-status');
  if (statusEl) {
    statusEl.textContent = studyInfo.status;
    // Add status badge styling
    statusEl.style.cssText = 'color: #28a745; font-weight: 600;';
  }

  // Update Data Lock Date
  const dataLockEl = document.getElementById('data-lock-date');
  if (dataLockEl) {
    dataLockEl.textContent = studyInfo.dataLockDate;
  }

  console.log('Footer updated with study information');
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle tab switching between studies
 * @param {Event} event - Click event
 */
function handleTabSwitch(event) {
  const button = event.currentTarget;
  const studyId = button.dataset.study;

  console.log(`Switching to study ${studyId}`);

  // Update button states
  const allTabButtons = document.querySelectorAll('.tab-btn');
  allTabButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  button.classList.add('active');
  button.setAttribute('aria-selected', 'true');

  // Hide all study content
  const allStudyContent = document.querySelectorAll('.study-content');
  allStudyContent.forEach(content => {
    content.classList.remove('active');
  });

  // Show selected study content
  if (studyId === 'home') {
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
      homeContent.classList.add('active');
    }
    // Re-initialize home page animations
    setTimeout(initializeHomePage, 100);
    appState.currentStudy = 'home';
  } else {
    const studyNumber = parseInt(studyId);
    const selectedStudy = document.getElementById(`study-${studyNumber}`);
    if (selectedStudy) {
      selectedStudy.classList.add('active');
    }

    // Update current study in state
    appState.currentStudy = studyNumber;

    // Render the appropriate study if data is loaded
    if (studyNumber === 1 && appState.clinicalData) {
      renderClinicalStudy(appState.clinicalData);
    } else if (studyNumber === 2 && appState.imagingData) {
      renderImagingStudy(appState.imagingData);
    } else if (studyNumber === 3 && appState.survivalData) {
      renderSurvivalStudy(appState.survivalData);
    } else if (studyNumber === 4 && appState.advancedData) {
      renderAdvancedAnalyticsStudy(appState.advancedData);
    }
  }
}

/**
 * Handle Adverse Events filter button click
 * Placeholder for future filtering functionality
 */
function handleAEFilter() {
  console.log('AE Filter button clicked (placeholder)');

  // Future implementation: Show filter modal/panel
  alert('Adverse Events filtering coming soon!\n\nFilters will include:\n• Severity level\n• Treatment group\n• Study site\n• Date range');
}

/**
 * Handle Adverse Events export button click
 * Exports AE data to CSV format
 */
function handleAEExport() {
  console.log('AE Export button clicked');

  if (!appState.clinicalData || appState.clinicalData.length === 0) {
    showError('No data available to export. Please load data first.');
    return;
  }

  try {
    // Filter data to AE-relevant columns
    const aeData = appState.clinicalData.map(row => ({
      Patient_ID: row.Patient_ID || 'N/A',
      Treatment: row.Treatment || 'N/A',
      Site: row.Site || 'N/A',
      Adverse_Events: row.Adverse_Events || 'No',
      Study_Completion: row.Study_Completion || 'No'
    }));

    // Convert to CSV
    const csvContent = convertToCSV(aeData);

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `adverse_events_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccessMessage(`Exported ${aeData.length} records to CSV`);
    console.log(`Exported ${aeData.length} AE records`);

  } catch (error) {
    console.error('Error exporting data:', error);
    showError(`Export failed: ${error.message}`);
  }
}

/**
 * Handle chart info button click
 * Shows information about the specific chart
 * @param {Event} event - Click event
 */
function handleChartInfo(event) {
  const button = event.currentTarget;
  const chartCard = button.closest('.chart-card');
  const chartTitle = chartCard ? chartCard.querySelector('.chart-title').textContent : 'Chart';

  console.log(`Chart info clicked for: ${chartTitle}`);

  // Chart descriptions
  const chartDescriptions = {
    'Treatment Comparison': 'Displays mean change from baseline to Week 12 for each treatment group with 95% confidence intervals. Error bars represent statistical uncertainty.',
    'Patient Trajectory Over Time': 'Shows the mean outcome trajectory across all study visits (Baseline, Week 4, Week 8, Week 12) with 95% confidence bands for each treatment group.',
    'Subgroup Analysis (Forest Plot)': 'Compares treatment effect across different subgroups (sex, age, site, baseline severity). The vertical line at 0 represents no difference between groups.',
    'Individual Patient Response (Waterfall)': 'Displays percent change from baseline for each individual patient, sorted by response magnitude. The dashed line indicates the 20% responder threshold.',
    'Adverse Events Profile': 'Compares the incidence of adverse events and study completion rates between treatment groups.'
  };

  const description = chartDescriptions[chartTitle] || 'Chart visualization for clinical trial data analysis.';

  // Show alert (in production, this would be a modal)
  alert(`${chartTitle}\n\n${description}`);
}

/**
 * Handle window resize event
 * Triggers Plotly resize for all charts
 */
function handleWindowResize() {
  console.log('Window resized - updating chart layouts');

  const chartIds = [
    'treatment-chart',
    'trajectory-chart',
    'forest-plot',
    'waterfall-chart',
    'adverse-events-chart'
  ];

  chartIds.forEach(chartId => {
    const chartDiv = document.getElementById(chartId);
    if (chartDiv && window.Plotly) {
      Plotly.Plots.resize(chartDiv);
    }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert array of objects to CSV string
 * @param {Array<Object>} data - Array of data objects
 * @returns {string} - CSV formatted string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create header row
  const csvRows = [headers.join(',')];

  // Create data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas by wrapping in quotes
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// HOME PAGE ANIMATIONS
// ============================================================================

/**
 * Animated counter for stats
 * @param {HTMLElement} element - Element to animate
 * @param {number} target - Target number to count to
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

/**
 * Initialize home page animations
 */
function initializeHomePage() {
  const statNumbers = document.querySelectorAll('.stat-number');

  // Reset counter values
  statNumbers.forEach(num => {
    num.textContent = '0';
  });

  // Use Intersection Observer to trigger animation when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

// ============================================================================
// CONSOLE BANNER
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║       CLINICAL TRIAL RESULTS DASHBOARD                        ║
║       Production-Ready Biostatistics Visualization            ║
║                                                                ║
║       Version: 1.0.0                                          ║
║       Data: Clinical Trial Sample Data                        ║
║       Visualizations: Plotly.js                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Export state for debugging (accessible in console)
if (typeof window !== 'undefined') {
  window.dashboardState = appState;
  console.log('Dashboard state available at: window.dashboardState');
}
