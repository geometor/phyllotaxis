# import the Python Image processing Library

from PIL import Image

# Create an Image object from an Image
folder = '/home/phi/Sessions/rings/610/'
filename = folder + '00000.png'
img  = Image.open(filename)

bg_img = Image.new("RGBA", img.size) # Create a white rgba background

for i in range(144):
    f = f'{folder}/zoetrope/{i:0>5}.png'
    print(f)
    img_rotated = img.rotate(i * 137.5)
    bg_img.paste(img_rotated, (0, 0), img_rotated)
    bg_img.save(f)

#  img.show()
#  img_rotated.show()
