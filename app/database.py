import os

FIELDS = ('slug', 'author', 'year')


def getGalleries() -> list:
    base = 'static/paintings/'
    return [i for i in os.listdir(base) if os.path.isdir(base + i)]


def getPainting(gallery_slug: str, painting_slug: str = '', mobile: bool = False) -> dict:
    if gallery_slug not in getGalleries():
        gallery_slug = 'italian-renaissance'
    lines = _getPaintingOrder(gallery_slug, mobile)

    for i, line in enumerate(lines):
        values = line.strip('\n').split(',')
        if values[0] == painting_slug:
            break
        if i+1 == len(lines):
            values = lines[0].strip('\n').split(',')
            i = 0

    context = dict(zip(FIELDS, values))
    context['title'] = context['slug'].replace('-', ' ').title()
    next_line = lines[0 if i+1 == len(lines) else i+1]
    context['next'] = '/' + gallery_slug + '/' + next_line.split(',')[0]
    context['gallery'] = gallery_slug
    return context


def _getPaintingOrder(gallery_slug: str, mobile: bool):
    files = ('_mobile.txt', '_content.txt') if mobile else ('_content.txt', '_mobile.txt')
    lines = []
    for filename in files:
        with open(f'static/paintings/{gallery_slug}/{filename}') as f:
            lines += f.readlines()
    return lines
