// Load the CHIRPS dataset
var dataset = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
                  .filter(ee.Filter.date('2024-05-01', '2024-05-03'));
var precipitation = dataset.select('precipitation');

// Load Kenya boundary from the GEE FeatureCollection
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Mask precipitation data to Kenya's boundary
var precipitationKenya = precipitation.map(function(image) {
  return image.clip(kenya);
});

// Calculate the mean precipitation over the selected period
var meanPrecipitation = precipitationKenya.mean(); // Aggregating the ImageCollection to a single Image


// Visualization parameters
var precipitationVis = {
  min: 1,
  max: 17,
  palette: ['001137', '0aab1e', 'e7eb05', 'ff4a2d', 'e90000']
};

// Center map on Kenya and display the masked precipitation
Map.setCenter(37.9062, 0.0236, 6); // Kenya's approximate center
Map.addLayer(precipitationKenya.mean(), precipitationVis, 'Precipitation Kenya');

// Check precipitation data range
var stats = meanPrecipitation.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 5000,
  maxPixels: 1e13
});
print('Mean Precipitation Stats:', stats);


// Reclassify the mean precipitation into 5 classes
var reclassifiedPrecipitation = meanPrecipitation.expression(
  "(b(0) < 5) ? 1 : " + 
  "(b(0) >= 5 && b(0) < 10) ? 2 : " + 
  "(b(0) >= 10 && b(0) < 15) ? 3 : " + 
  "(b(0) >= 15 && b(0) < 20) ? 4 : 5",
  {'b(0)': meanPrecipitation}
);

// Clip the reclassified image to Kenya
var reclassifiedPrecipitationKenya = reclassifiedPrecipitation.clip(kenya);

// Adjusted Visualization Parameters for Reclassified Data
var reclassifiedVis = {
  min: 1,
  max: 5,
  palette: ['#D7BF53', 'cyan','red' , 'orange','blue' ]
};

// Add the reclassified precipitation layer to the map
Map.addLayer(reclassifiedPrecipitationKenya, reclassifiedVis, 'Reclassified Precipitation Kenya');

// Export the reclassified precipitation data
Export.image.toDrive({
  image: reclassifiedPrecipitation,
  description: 'Reclassified_Precipitation',
  folder: 'pineapple ',
  fileNamePrefix: 'reclassified_precipitation',
  region: kenya.geometry(),
  scale: 1000,  // Set resolution
  crs: 'EPSG:4326',
  maxPixels: 1e8
});