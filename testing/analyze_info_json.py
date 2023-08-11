# Extracting JSON Fields
import json

f = open('info.json')

data = json.load(f)

# Extract required fields
width = data.get("width")
height = data.get("height")
sizes = data.get("sizes")
tiles = data.get("tiles")

# Construct new JSON object
extracted_data = {
    "width": width,
    "height": height,
    "sizes": sizes,
    "tiles": tiles
}

# Convert new object to string
extracted_data_str = json.dumps(extracted_data, indent=4)
print(extracted_data_str)
