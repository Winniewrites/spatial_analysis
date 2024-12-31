// Load reclassified layers (example file paths, replace with your actual paths)
var reclassifiedElevation = ee.Image('projects/ee-wonyancha22/assets/reclassified_elevation');
var reclassifiedSoil = ee.Image('projects/ee-wonyancha22/assets/reclassified_soil2');
var reclassifiedPrecipitation = ee.Image('projects/ee-wonyancha22/assets/reclassified_rain2');
var reclassifiedTemperature = ee.Image('projects/ee-wonyancha22/assets/reclassified_temperature2');
var reclassifiedLandCover = ee.Image('projects/ee-wonyancha22/assets/Reclassified_LandCover');


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
var normLandCover = normalize(reclassifiedLandCover, 5); // Adjust max class based on land cover reclassification

// Assign equal weights
var weightElevation = 0.2;
var weightSoil = 0.2;
var weightPrecipitation = 0.2;
var weightTemperature = 0.2;
var weightLandCover = 0.2;

// Calculate weighted suitability index
var suitabilityIndex = normElevation.multiply(weightElevation)
    .add(normSoil.multiply(weightSoil))
    .add(normPrecipitation.multiply(weightPrecipitation))
    .add(normTemperature.multiply(weightTemperature))
    .add(normLandCover.multiply(weightLandCover));

// Clip the suitability map to Kenya's boundary
var clippedSuitability = suitabilityIndex.clip(kenya);

// Define thresholds for the 4 classes
var reclassifiedSuitability = clippedSuitability.expression(
  "(b(0) >= 0 && b(0) < 0.25) ? 1 : " +  // Low suitability (0.00–0.24)
  "(b(0) >= 0.25 && b(0) < 0.5) ? 2 : " + // Medium Low suitability (0.25–0.49)
  "(b(0) >= 0.5 && b(0) < 0.75) ? 3 : " + // Medium High suitability (0.50–0.74)
  "4",                                    // High suitability (0.75–1.00)
  {'b(0)': clippedSuitability}
);

// Define visualization parameters for the reclassified suitability map
var suitabilityVis = {
  min: 1,
  max: 4,
  palette: [ 'green', 'yellow','red', 'orange'], // Colors for Low to High suitability
  opacity: 0.8
};


// Add the suitability map to the map viewer
Map.centerObject(kenya, 6);
Map.addLayer(clippedSuitability, suitabilityVis, 'Suitability Map');

// Export the suitability map to Google Drive
Export.image.toDrive({
  image: clippedSuitability,
  description: 'SuitabilityIndex4',
  folder: 'Suitability4',
  fileNamePrefix: 'Suitability_Map',
  region: kenya.geometry(),
  scale: 250,
  maxPixels: 1e13
});
