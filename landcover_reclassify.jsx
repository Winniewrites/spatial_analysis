// Load Kenya boundary
var kenya = ee.FeatureCollection('FAO/GAUL/2015/level0')
                .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

// Clip the original land cover to Kenya for visualization
var originalLandCover = landCover.clip(kenya);

// Visualization for the original land cover
var originalVis = {
  min: 1,
  max: 10,
  palette: ['#009500', '#00ad00', '#00dc00', '#a0522d', '#ffff00', 
            '#ff00ff', '#ff82ff', '#00eded', '#0000ff', '#f3f391'] // Colors for original classes
};

// Add the original land cover to the map
Map.centerObject(kenya, 6);
Map.addLayer(originalLandCover, originalVis, 'Original Landcover');

// Reclassify the land cover classes to maintain 10 categories
var reclassifiedLandCover = landCover.expression(
  "b(0) == 1 ? 1 : " +  // Dense rainforest
  "b(0) == 2 ? 2 : " +  // Bamboo forest
  "b(0) == 3 ? 3 : " +  // Open forest
  "b(0) == 4 ? 4 : " +  // Grassland
  "b(0) == 5 ? 5 : " +  // Bare land
  "b(0) == 6 ? 6 : " +  // Urban area
  "b(0) == 7 ? 7 : " +  // Built-up areas
  "b(0) == 8 ? 8 : " +  // Wetlands
  "b(0) == 9 ? 9 : " +  // Lakes
  "b(0) == 10 ? 10 : 0", // Desert
  {'b(0)': landCover}
);

// Clip the reclassified land cover to Kenya's boundary
var clippedReclassifiedLandCover = reclassifiedLandCover.clip(kenya);

// Visualization for the reclassified land cover with 10 classes
var reclassifiedVis = {
  min: 1,
  max: 10,
  palette: ['#009500', '#00ad00', '#00dc00', '#a0522d', '#ffff00', 
            '#ff00ff', '#ff82ff', '#00eded', '#0000ff', '#f3f391'] // Updated colors for reclassified classes
};

// Add the reclassified land cover to the map
Map.addLayer(clippedReclassifiedLandCover, reclassifiedVis, 'Reclassified Land Cover (10 Classes)');

// Export the reclassified land cover image
Export.image.toDrive({
  image: clippedReclassifiedLandCover,
  description: 'ReclassifiedLC',
  folder: 'pineapple',
  fileNamePrefix: 'ReclassifiedLC',
  region: kenya.geometry(),
  scale: 250,
  maxPixels: 1e13
});
