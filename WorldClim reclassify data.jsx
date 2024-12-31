// Load WorldClim (CHELSA) dataset for precipitation
var worldclim = ee.ImageCollection("WORLDCLIM/V1/MONTHLY")
                  .select('prec'); // Monthly precipitation (mm)

// Calculate mean annual precipitation by summing all months
var annualPrecipitation = worldclim.sum();

// Load Kenya boundary
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Clip precipitation to Kenya
var precipitationKenya = annualPrecipitation.clip(kenya);

// Visualization parameters for precipitation
var precipitationVis = {
  min: 400,
  max: 2000, // Adjust based on Kenya's precipitation range
  palette: ['orange', 'yellow','green', 'cyan', 'blue']
};

// Add annual precipitation to the map
Map.setCenter(37.9062, 0.0236, 6); // Center on Kenya
Map.addLayer(precipitationKenya, precipitationVis, 'WorldClim Precipitation Kenya');

// Check precipitation data statistics
var stats = precipitationKenya.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: kenya.geometry(),
  scale: 1000, // WorldClim resolution
  maxPixels: 1e13
});
print('Annual Precipitation Stats (WorldClim):', stats);

// Reclassify annual precipitation into 5 classes
var reclassifiedPrecipitation = precipitationKenya.expression(
  "(b(0) < 400) ? 1 : " +
  "(b(0) >= 400 && b(0) < 800) ? 2 : " +
  "(b(0) >= 800 && b(0) < 1200) ? 3 : " +
  "(b(0) >= 1200 && b(0) < 1600) ? 4 : "+
  "(b(0) >= 1600 && b(0) < 2000) ? 5 : 6",
  {'b(0)': precipitationKenya}
);

// Visualization parameters for reclassified precipitation
var reclassifiedVis = {
  min: 1,
  max: 5,
  palette: ['orange', 'yellow','green', 'cyan', 'blue']
};

// Clip reclassified precipitation to Kenya
var reclassifiedPrecipitationKenya = reclassifiedPrecipitation.clip(kenya);

// Add reclassified precipitation to the map
Map.addLayer(reclassifiedPrecipitationKenya, reclassifiedVis, 'Reclassified Precipitation Kenya');


// Export the reclassified precipitation data
Export.image.toAsset({
  image: reclassifiedPrecipitation,
  description: 'Reclassified_rain',
  assetId: 'projects/ee-wonyancha22/assets/reclassified_rain',
  scale: 250,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});