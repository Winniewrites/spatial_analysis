// Load reclassified layers (example file paths, replace with your actual paths)
var reclassifiedElevation = ee.Image('projects/ee-wonyancha22/assets/reclassified_elevation');
var reclassifiedSoil = ee.Image('projects/ee-wonyancha22/assets/reclassified_soil2');
var reclassifiedPrecipitation = ee.Image('projects/ee-wonyancha22/assets/reclassified_rain2');
var reclassifiedTemperature = ee.Image('projects/ee-wonyancha22/assets/reclassified_temperature2');

// Load Kenya boundary
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Normalize the layers to 0–1 (assuming values range from 1 to max reclassified class, e.g., 5)
function normalize(image, maxClass) {
  return image.subtract(1).divide(maxClass - 1);
}

// Normalize layers
var normElevation = normalize(reclassifiedElevation, 5);
var normSoil = normalize(reclassifiedSoil, 5);
var normPrecipitation = normalize(reclassifiedPrecipitation, 5);
var normTemperature = normalize(reclassifiedTemperature, 5);

// Assign equal weights
var weightElevation = 0.3;
var weightSoil = 0.2;
var weightPrecipitation = 0.2;
var weightTemperature = 0.2;

// Calculate weighted suitability index
var suitabilityIndex = normElevation.multiply(weightElevation)
    .add(normSoil.multiply(weightSoil))
    .add(normPrecipitation.multiply(weightPrecipitation))
    .add(normTemperature.multiply(weightTemperature))

// Clip the suitability map to Kenya's boundary
var clippedSuitability = suitabilityIndex.clip(kenya);

// Visualization parameters
var suitabilityVis = {
  min: 0,
  max: 1,
  palette: ['red', 'yellow', 'green'] // Red for low, Yellow for medium, Green for high suitability
};

// Add the suitability map to the map viewer
Map.centerObject(kenya, 6);
Map.addLayer(clippedSuitability, suitabilityVis, 'Suitability Map');

// Export the suitability map to Google Drive
Export.image.toDrive({
  image: clippedSuitability,
  description: 'noLCSuitability',
  folder: 'noLCSuitability',
  fileNamePrefix: 'Suitability_Map',
  region: kenya.geometry(),
  scale: 250,
  maxPixels: 1e13
});
