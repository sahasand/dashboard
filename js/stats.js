// Statistics Utility Module
// Helper functions for statistical calculations

/**
 * Calculate arithmetic mean
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} - Mean value
 */
function mean(arr) {
  const filtered = arr.filter(val => val !== null && val !== undefined && !isNaN(val));
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, val) => sum + val, 0) / filtered.length;
}

/**
 * Calculate sample standard deviation (n-1)
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} - Standard deviation
 */
function standardDeviation(arr) {
  const filtered = arr.filter(val => val !== null && val !== undefined && !isNaN(val));
  if (filtered.length <= 1) return 0;

  const avg = mean(filtered);
  const squaredDiffs = filtered.map(val => Math.pow(val - avg, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (filtered.length - 1);

  return Math.sqrt(variance);
}

/**
 * Calculate median
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} - Median value
 */
function median(arr) {
  const filtered = arr.filter(val => val !== null && val !== undefined && !isNaN(val));
  if (filtered.length === 0) return 0;

  const sorted = filtered.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Calculate 95% confidence interval for mean
 * @param {Array<number>} arr - Array of numbers
 * @returns {Object} - {mean, lower, upper, se}
 */
function confidenceInterval95(arr) {
  const filtered = arr.filter(val => val !== null && val !== undefined && !isNaN(val));

  if (filtered.length === 0) {
    return { mean: 0, lower: 0, upper: 0, se: 0 };
  }

  const avg = mean(filtered);
  const sd = standardDeviation(filtered);
  const se = sd / Math.sqrt(filtered.length);

  // 95% CI using 1.96 for normal approximation
  const margin = 1.96 * se;

  return {
    mean: parseFloat(avg.toFixed(2)),
    lower: parseFloat((avg - margin).toFixed(2)),
    upper: parseFloat((avg + margin).toFixed(2)),
    se: parseFloat(se.toFixed(2))
  };
}

/**
 * Perform two-sample t-test
 * @param {Array<number>} arr1 - First group
 * @param {Array<number>} arr2 - Second group
 * @returns {Object} - {tStatistic, pValue, meanDiff}
 */
function tTest(arr1, arr2) {
  const filtered1 = arr1.filter(val => val !== null && val !== undefined && !isNaN(val));
  const filtered2 = arr2.filter(val => val !== null && val !== undefined && !isNaN(val));

  if (filtered1.length === 0 || filtered2.length === 0) {
    return { tStatistic: 0, pValue: 1, meanDiff: 0 };
  }

  const mean1 = mean(filtered1);
  const mean2 = mean(filtered2);
  const sd1 = standardDeviation(filtered1);
  const sd2 = standardDeviation(filtered2);
  const n1 = filtered1.length;
  const n2 = filtered2.length;

  const meanDiff = mean1 - mean2;

  // Pooled standard error for two-sample t-test
  const pooledSE = Math.sqrt((sd1 * sd1) / n1 + (sd2 * sd2) / n2);

  // Calculate t-statistic
  const tStatistic = pooledSE === 0 ? 0 : meanDiff / pooledSE;

  // Degrees of freedom (Welch's approximation)
  const df = Math.floor(
    Math.pow(sd1 * sd1 / n1 + sd2 * sd2 / n2, 2) /
    (Math.pow(sd1 * sd1 / n1, 2) / (n1 - 1) + Math.pow(sd2 * sd2 / n2, 2) / (n2 - 1))
  );

  // Simplified p-value approximation
  // For |t| > 2.0, p < 0.05; for |t| > 2.6, p < 0.01
  let pValue;
  const absT = Math.abs(tStatistic);

  if (absT < 1.96) {
    pValue = '>0.05';
  } else if (absT < 2.58) {
    pValue = '<0.05';
  } else {
    pValue = '<0.01';
  }

  return {
    tStatistic: parseFloat(tStatistic.toFixed(3)),
    pValue: pValue,
    meanDiff: parseFloat(meanDiff.toFixed(2)),
    df: df
  };
}

/**
 * Calculate mean difference with 95% confidence interval
 * @param {Array<number>} arr1 - First group (e.g., Treatment)
 * @param {Array<number>} arr2 - Second group (e.g., Placebo)
 * @returns {Object} - {meanDiff, lower, upper, se}
 */
function calculateDifferenceCI(arr1, arr2) {
  const filtered1 = arr1.filter(val => val !== null && val !== undefined && !isNaN(val));
  const filtered2 = arr2.filter(val => val !== null && val !== undefined && !isNaN(val));

  if (filtered1.length === 0 || filtered2.length === 0) {
    return { meanDiff: 0, lower: 0, upper: 0, se: 0 };
  }

  const mean1 = mean(filtered1);
  const mean2 = mean(filtered2);
  const sd1 = standardDeviation(filtered1);
  const sd2 = standardDeviation(filtered2);
  const n1 = filtered1.length;
  const n2 = filtered2.length;

  const meanDiff = mean1 - mean2;

  // Standard error of the difference
  const se1 = sd1 / Math.sqrt(n1);
  const se2 = sd2 / Math.sqrt(n2);
  const pooledSE = Math.sqrt(se1 * se1 + se2 * se2);

  // 95% CI for difference
  const margin = 1.96 * pooledSE;

  return {
    meanDiff: parseFloat(meanDiff.toFixed(2)),
    lower: parseFloat((meanDiff - margin).toFixed(2)),
    upper: parseFloat((meanDiff + margin).toFixed(2)),
    se: parseFloat(pooledSE.toFixed(2))
  };
}

/**
 * Group array of objects by a key
 * @param {Array<Object>} arr - Array of objects
 * @param {string} key - Key to group by
 * @returns {Object} - Object with groups as keys
 */
function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
}

/**
 * Summarize data by group
 * @param {Array<Object>} data - Array of data objects
 * @param {string} groupKey - Key to group by
 * @param {string} valueKey - Key of values to summarize
 * @returns {Object} - Summary statistics by group
 */
function summarizeByGroup(data, groupKey, valueKey) {
  const grouped = groupBy(data, groupKey);
  const summary = {};

  for (const [group, items] of Object.entries(grouped)) {
    const values = items
      .map(item => item[valueKey])
      .filter(val => val !== null && val !== undefined && !isNaN(val));

    const ci = confidenceInterval95(values);
    const sd = standardDeviation(values);
    const med = median(values);

    summary[group] = {
      n: items.length,
      mean: ci.mean,
      median: parseFloat(med.toFixed(2)),
      sd: parseFloat(sd.toFixed(2)),
      se: ci.se,
      ci_lower: ci.lower,
      ci_upper: ci.upper,
      min: values.length > 0 ? parseFloat(Math.min(...values).toFixed(2)) : 0,
      max: values.length > 0 ? parseFloat(Math.max(...values).toFixed(2)) : 0
    };
  }

  return summary;
}
