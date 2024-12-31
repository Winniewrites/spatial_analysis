// Load the MODIS Land Surface Temperature dataset
var dataset = ee.ImageCollection('MODIS/061/MOD11A1')  // MODIS daily LST product
                  .filter(ee.Filter.date('2020-01-01', '2020-01-31')); // Time period

// Select the daytime surface temperature (LST_Day_1km) band
var temperature = dataset.select('LST_Day_1km')
                          .mean() // Calculate mean temperature over the period
                          .multiply(0.02) // Scale factor for MODIS LST
                          .subtract(273.15); // Convert from Kelvin to Celsius

// Load Kenya boundary from the GEE FeatureCollection
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Clip temperature data to Kenya's boundary
var temperatureKenya = temperature.clip(kenya);

// Visualization parameters for temperature
var temperatureVis = {
  min: 20, // Minimum temperature for visualization
  max: 40, // Maximum temperature for visualization
  palette: ['blue', 'green', 'yellow', 'orange', 'red'] // Color palette
};

// Add the temperature layer to the map with visualization parameters
Map.setCenter(37.9062, 0.0236, 6); // Kenya's approximate center
Map.addLayer(temperatureKenya, temperatureVis, 'Temperature');

// Reclassify the temperature into 7 classes between 15°C and 40°C
var reclassifiedTemperature = temperatureKenya.expression(
  "(b(0) < 15) ? 1 : " +  // Below 15°C
  "(b(0) >= 15 && b(0) < 20) ? 2 : " + // 15–20°C
  "(b(0) >= 20 && b(0) < 25) ? 3 : " + // 20–25°C
  "(b(0) >= 25 && b(0) < 30) ? 4 : " + // 25–30°C
  "(b(0) >= 30 && b(0) < 35) ? 5 : " + // 30–35°C
  "(b(0) >= 35 && b(0) <= 40) ? 6 : " + // 35–40°C
  "7", // Above 40°C
  {'b(0)': temperatureKenya}
);

// Clip the reclassified temperature again to ensure it is limited to Kenya
var reclassifiedTemperatureKenya = reclassifiedTemperature.clip(kenya);

// Visualization parameters for reclassified temperature
var reclassifiedTemperatureVis = {
  min: 1,
  max: 7,
  palette: ['blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'brown'] // 7-class palette
};

// Add the reclassified temperature layer to the map
Map.setCenter(37.9062, 0.0236, 6); // Kenya's approximate center
Map.addLayer(reclassifiedTemperatureKenya, reclassifiedTemperatureVis, 'Reclassified Temperature (7 Classes - Kenya)');

// Optional: Calculate statistics of the reclassified image to verify range
var stats = reclassifiedTemperatureKenya.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 1000,
  maxPixels: 1e13
});
print('Reclassified Temperature Stats (Kenya):', stats);

// Export the reclassified temperature data
Export.image.toDrive({
  image: reclassifiedTemperature,
  description: 'Reclassified_Temperature',
  folder: 'pineapple',
  fileNamePrefix: 'reclassified_temperature',
  region: kenya.geometry(),
  scale: 1000,  // Set resolution
  crs: 'EPSG:4326',
  maxPixels: 1e8
});