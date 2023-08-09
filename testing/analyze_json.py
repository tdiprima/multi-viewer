import json

f = open('data.json')  # one viewer, one layer
# f = open('data1.json')  # 2 viewers, 2 layers

data = json.load(f)

viewer_list = data[0]
layer1_dict = viewer_list[0]
layer2_dict = viewer_list[1]

# DO STUFF
# print(len(viewer_list))
# print(len(layer1_dict))
# print(layer1_dict)
# print(layer2_dict)

# LAYER 1
for key in layer1_dict:
    # print(key)  # JUST KEY
    print(key, '->', layer1_dict[key])  # KEY / VALUE

# COLORSCHEME
# for i in layer1_dict['colorscheme']:
#     print(i)

f.close()
