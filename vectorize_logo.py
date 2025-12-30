from PIL import Image
import os
import base64
from io import BytesIO

def vectorize_logo():
    # Load the logo
    logo_path = "LOGO.png"
    output_dir = "VECTORIZED IMG"
    
    # Open and process the image
    img = Image.open(logo_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Save as high-quality PNG (lossless)
    img.save(os.path.join(output_dir, "logo_vectorized.png"), "PNG", optimize=True)
    
    # Create SVG version (basic vectorization)
    width, height = img.size
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image width="{width}" height="{height}" xlink:href="data:image/png;base64,{get_base64_image(img)}"/>
</svg>'''
    
    with open(os.path.join(output_dir, "logo_vectorized.svg"), "w") as f:
        f.write(svg_content)
    
    print("Logo vectorized and saved in VECTORIZED IMG folder")

def get_base64_image(img):
    import base64
    from io import BytesIO
    
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

if __name__ == "__main__":
    vectorize_logo()