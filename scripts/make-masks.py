"""Download logos from the old portfolio and derive single-channel masks for embossed icons."""
import io, subprocess
from PIL import Image

BASE = "https://framerusercontent.com/images/{}.png?scale-down-to=512"
# name: (framer id, mask mode)
LOGOS = {
    "tesla": ("JyCXbN16pDDfeAuJ1qEFuq0iLtM", "light"),
    "fidelity": ("HflWPtTvL1130Y2QQGh0LiygGc", "light"),
    "ibm": ("Agj7D2BC25JcjxIhIDdjP8dRFs", "dark"),
    "tcba": ("NvB9kPAZBN29fZJEB6dNLUzq2e8", "dark"),
    "fostersource": ("xmddfIck5hTxcxs2jdQ5e15IV4", "color"),
    "changepp": ("Oz15toQhOMABZhVgYKJsdMaHQE", "light"),
    "go": ("0NrsVcATEzkoZ33AM5d3TP680w", "alpha"),
    "flask": ("3o6ZL1EE3W2Zg0mE42REImxcnDs", "alpha"),
    "r": ("4RxM384sdrNfgA84nlNyYnw", "notwhite"),
    "firebase": ("6vbXiI4EqWSIfM8BGsic8f5T5VU", "alpha"),
    "aws": ("aDoUB6aTtv9RQJ6hqinyrb4CWTo", "alpha"),
    "node": ("EICvUYar3rDQzS8o2UBeqfZJln0", "alpha"),
    "next": ("fclJUaiJngakI0QOBzILolX8ag", "dark"),
    "spring": ("gnPGYML2c0Oi5YNtZshbhWRLoIE", "notwhite"),
    "typescript": ("JMzxsPXt9bYpDKPUCm0UATvg", "light"),
    "react": ("jQCyGl6wZ16LQZMlSLMrkV90KYU", "alpha"),
    "docker": ("ktkN3toWKvTl4iWd5M4YuUEMygg", "alpha"),
    "mongodb": ("l0GeOvAQbkj9SMKbv34oAKJQjZ0", "alpha"),
    "python": ("lqA07PXuT1apI5fRZSSMbheLAw", "alpha"),
    "express": ("maYtuBERMSNFDH37ZFDisEFe0kk", "alpha"),
    "java": ("ohNaXZYcEKJVO2P0bmz0qyDLBn4", "alpha"),
    "javascript": ("QYmq308u4qG3O15gu4OOjuYYbyo", "dark"),
    "kubernetes": ("t4wDslKPfgjXELqboMbugf6cME", "notwhite"),
    "postgres": ("vftc7DXWOTIOUKU54W74t9ulFwU", "notwhite"),
    "redis": ("ViqKu4Fi8d0rlBmcCynwInIpaLk", "notwhite"),
    "figma": ("xaZJ4I1E9nTfZOtZo7zKWikpzxs", "alpha"),
    "angular": ("xNKJechctyxs1KMTLOCylMDk38w", "alpha"),
    "cpp": ("Y7sNZNWi7iA2mszEgbo6zjqGmc", "notwhite"),
}
SHOTS = {
    "tcba": "4LuIQ0FSY7XwzY0bNsj9AJsH8",
    "pipeline": "PJL1waKRykTdIjFVftlHiXlUM",
    "smartstock": "ohGfr2cxTC3CoC3TGMYiQDMMvk",
    "fostersource": "qScg8E7NeviJ3cag46mcj490",
}


def fetch(fid, scale=512):
    url = BASE.format(fid).replace("512", str(scale))
    return Image.open(io.BytesIO(subprocess.run(["curl", "-sfL", url], check=True, capture_output=True).stdout)).convert("RGBA")


def mask_value(r, g, b, a, mode):
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    if mode == "alpha":
        return a
    if mode == "light":
        return int(a * max(0, min(1, (lum - 150) / 80)))
    if mode == "dark":
        return int(a * max(0, min(1, (200 - lum) / 90)))
    if mode == "ink":
        return int(a * max(0, min(1, (110 - lum) / 50)))
    if mode == "notwhite":
        return int(a * max(0, min(1, (245 - min(r, g, b)) / 40)))
    if mode == "color":
        sat = max(r, g, b) - min(r, g, b)
        return int(a * max(0, min(1, (sat - 30) / 60)))
    raise ValueError(mode)


for name, (fid, mode) in LOGOS.items():
    img = fetch(fid)
    img.save(f"public/logos/{name}.png", optimize=True)
    out = Image.new("LA", img.size)
    # drop faint values so background fringes don't survive the crop
    out.putdata([(255, v if v > 40 else 0) for v in (mask_value(*px, mode) for px in img.getdata())])
    if name == "typescript":  # source has a thin light frame around the tile
        w, h = out.size
        out.paste((255, 0), (0, 0, w, 12)); out.paste((255, 0), (0, h - 12, w, h))
        out.paste((255, 0), (0, 0, 12, h)); out.paste((255, 0), (w - 12, 0, w, h))
    bbox = out.getchannel("A").getbbox()
    out.crop(bbox).save(f"public/masks/{name}.png", optimize=True)
    if name == "fidelity":  # the mark is a circle on a square tile; keep just the circle
        from PIL import ImageDraw
        w, h = img.size
        m = Image.new("L", (w * 4, h * 4), 0)
        ImageDraw.Draw(m).ellipse([0, 0, w * 4 - 1, h * 4 - 1], fill=255)
        img.putalpha(m.resize((w, h), Image.LANCZOS))
        img.save(f"public/logos/{name}.png", optimize=True)
    if mode in ("alpha", "notwhite") or name == "next":  # trim padding off free-standing marks
        img.crop(bbox).save(f"public/logos/{name}.png", optimize=True)
    print(name, mode, img.size, bbox)

for name, fid in SHOTS.items():
    fetch(fid, 1200).convert("RGB").save(f"public/projects/{name}.jpg", quality=86)
    print("shot", name)
