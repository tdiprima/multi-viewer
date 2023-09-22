import json

# Given JSON string
data_str = '''...'''  # (replace ... with your JSON string)

# Parse the JSON string
data = json.loads(data_str)

# Initialize the count
count = 0

# Traverse through the parsed JSON data
for sublist in data:
    for item in sublist:
        if "layerNum" in item:
            count += 1

# How many layers
print(count)
