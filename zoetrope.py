# import the Python Image processing Library

from PIL import Image

 

# Create an Image object from an Image
filename = '/home/phiarchitect/Sessions/spirals/copper/0005/0144.png'
img  = Image.open(filename)

pad = 100
w, h = img.size
margin = (w - h) / 2
left = margin + pad
right = w - margin - pad
top = 0 + pad
bottom = h - pad
img = img.crop((left, top, right, bottom))
img.show()

for i in range(10):
    f = f'/home/phiarchitect/Sessions/zoetrope/{i}.png'
    img_rotated = img.rotate(i * 137.5)
    img_rotated.save(f)

#  img.show()
#  img_rotated.show()
