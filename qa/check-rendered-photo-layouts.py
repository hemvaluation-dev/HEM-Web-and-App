"""Check rendered report evidence for overlaps and page overflow.
Usage: python check-rendered-photo-layouts.py RENDER_DIRECTORY OUTPUT_JSON
Render with the documents skill's render_docx.py first, one subdirectory per report.
"""
import json
import sys
from pathlib import Path
import pdfplumber

results = []
for path in sorted(Path(sys.argv[1]).glob('*/*.pdf')):
    with pdfplumber.open(path) as document:
        overflow, overlaps, backgrounds = [], [], 0
        for page_number, page in enumerate(document.pages, 1):
            images = []
            for image in page.images:
                # Aditya Birla and Chola use a full-page letterhead background.
                if image['width'] >= page.width * .98 and image['height'] >= page.height * .98:
                    backgrounds += 1
                    continue
                if image['width'] > 50 and image['height'] > 50:
                    images.append(image)
            for index, image in enumerate(images):
                if image['top'] < -1 or image['bottom'] > page.height + 1 or image['x0'] < -1 or image['x1'] > page.width + 1:
                    overflow.append(page_number)
                for other in images[index + 1:]:
                    dx = min(image['x1'], other['x1']) - max(image['x0'], other['x0'])
                    dy = min(image['bottom'], other['bottom']) - max(image['top'], other['top'])
                    if dx > 2 and dy > 2:
                        overlaps.append({'page': page_number, 'overlap_points': [round(dx, 1), round(dy, 1)]})
        results.append({'template': path.stem, 'pages': len(document.pages), 'reviewed_letterhead_backgrounds': backgrounds,
                        'out_of_page_images': overflow, 'overlapping_image_pairs': overlaps})
Path(sys.argv[2]).write_text(json.dumps(results, indent=2) + '\n')
failures = [r for r in results if r['out_of_page_images'] or r['overlapping_image_pairs']]
print(f'{len(results)} templates inspected; {len(failures)} with overlapping or out-of-page evidence images.')
if not results or failures:
    raise SystemExit(1)
