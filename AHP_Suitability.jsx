import rasterio
import numpy as np
from rasterio.plot import show
from rasterio import Affine, MemoryFile
from rasterio.enums import Resampling

# Load reclassified GeoTIFF layers
def load_layer(filepath):
    with rasterio.open(filepath) as src:
        data = src.read(1)  # Read the first band
        profile = src.profile
    return data, profile

# Filepaths for reclassified layers
rainfall_file = "reclassified_rainfall.tif"
temperature_file = "reclassified_temperature.tif"
soil_file = "reclassified_soil.tif"

# Load layers
rainfall, profile = load_layer(rainfall_file)
temperature, _ = load_layer(temperature_file)
soil, _ = load_layer(soil_file)

# Normalize layers to [0, 1] range
def normalize(data, min_val, max_val):
    return (data - min_val) / (max_val - min_val)

rainfall_normalized = normalize(rainfall, rainfall.min(), rainfall.max())
temperature_normalized = normalize(temperature, temperature.min(), temperature.max())
soil_normalized = normalize(soil, soil.min(), soil.max())

# AHP weights (calculated externally)
temperature_weight = 0.4
rainfall_weight = 0.3
soil_weight = 0.3

# Calculate suitability index (weighted sum)
suitability_index = (
    temperature_normalized * temperature_weight +
    rainfall_normalized * rainfall_weight +
    soil_normalized * soil_weight
)

# Clip suitability index to [0, 1] (optional)
suitability_index = np.clip(suitability_index, 0, 1)

# Save suitability index as GeoTIFF
output_file = "suitability_index.tif"
profile.update(dtype=rasterio.float32, count=1)  # Update profile for output

with rasterio.open(output_file, "w", **profile) as dst:
    dst.write(suitability_index.astype(rasterio.float32), 1)

print(f"Suitability index saved to {output_file}")

# Visualization (optional)
import matplotlib.pyplot as plt

plt.imshow(suitability_index, cmap="YlGn", interpolation= "nearest")
plt.colorbar(label="Suitability Index"c)
plt.title("Suitability Model")
plt.xlabel("Longitude")
plt.ylabel("Latitude")
plt.show()
