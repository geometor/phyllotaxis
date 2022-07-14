#!/usr/bin/env python
# import the Python Image processing Library
import sys
import os

for arg in sys.argv:
    print(arg)

from PIL import Image

# Create an Image object from an Image
folder = '/home/phi/Sessions/pyllotaxis/twilight/008/00244'
z_folder = folder + '/zoetrope'    
os.makedirs(z_folder, exist_ok=True)

filename = folder + '/dots-zoom.png'
img  = Image.open(filename)

bg_img = Image.new("RGBA", img.size) # Create a white rgba background

for i in range(144):
    f = f'{z_folder}/{i:0>5}.png'
    print(f)
    img_rotated = img.rotate(i * 137.5)
    bg_img.paste(img_rotated, (0, 0), img_rotated)
    bg_img.save(f)

#  img.show()
#  img_rotated.show()
