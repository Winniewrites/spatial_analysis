// Visualize the soil data
Map.addLayer(soilData, {}, 'Soil Data');
Map.centerObject(soilData);

// Define rasterization parameters
var rasterizedSoil = soilData
  .reduceToImage({
    properties: ['soil_desc'], // Property to rasterize
    reducer: ee.Reducer.first() // Choose reducer (e.g., first, mean)
  });

// Visualize the rasterized soil data
Map.addLayer(rasterizedSoil, {min: 1, max: 5, palette: ['brown', 'orange', 'yellow', 'green']}, 'Rasterized Soil');

// Define reclassification values as a dictionary
var soilReclassification = {
  1: 10, // Reclassify soil type 1 to 10
  2: 20, // Reclassify soil type 2 to 20
  3: 30, // Reclassify soil type 3 to 30
  4: 40, // Reclassify soil type 4 to 40
};

// Apply reclassification
var fromValues = [1, 2, 3, 4];  
var toValues = [10, 20, 30, 40];  

var reclassifiedSoil = rasterizedSoil.remap(fromValues, toValues);

// Visualize the reclassified soil data
Map.addLayer(reclassifiedSoil, {min: 10, max: 40, palette: ['brown', 'orange', 'yellow', 'green', 'blue']}, 'Reclassified Soil');
Map.setCenter(37.9062, 0.0236, 6);  

// Export the reclassified soil data
Export.image.toDrive({
  image: reclassifiedSoil,
  description: 'Reclassified_Soil',
  folder: 'pineapple',
  fileNamePrefix: 'reclassified_soil',
  scale: 20000,  // Set resolution
  crs: 'EPSG:4326',
  maxPixels: 1e8
});