import os


FIELDS = ('slug', 'author', 'year')

GALLERIES = {
    'italian-renaissance': [
        ('the-birth-of-venus', 'Sandro Botticelli', '1486'),
        ('the-creation-of-adam', 'Michelangelo', '1512'),
        ('the-school-of-athens', 'Raphael', '1510'),
        ('the-last-supper', 'Leonardo da Vinci', '1490s'),
        ('primavera', 'Sandro Botticelli', '1470s'),
        ('delivery-of-the-keys', 'Pietro Perugino', '1482'),
        ('sacred-and-profane-love', 'Titian', '1514'),
    ],
    'dutch-golden-age': [
        ('view-of-delft', 'Johannes Vermeer', '1661'),
        ('the-young-bull', 'Paulus Potter', '1647'),
        ('the-anatomy-lesson', 'Rembrandt', '1632'),
        ('the-great-market-in-haarlem', 'Gerrit Berckheyde', '1696'),
        ('while-the-housewife-sleeps', 'Jan Steen', '1663'),
        ('the-meagre-company', 'Frans Hals', '1637'),
        ('winter-scene-on-a-canal', 'Hendrick Avercamp', '1615'),
    ],
    'flemish-proverbs': [
        ('flemish-proverbs-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('nederlandse-spreekwoorden-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-blue-cloak-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-topsy-turvy-world-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-dutch-proverbs-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-dutch-proverbs', 'Pieter Brueghel the Elder', '1559'),
    ],
    'french-impressionism': [
        ('paris-street;-rainy-day', 'Gustave Caillebotte', '1877'),
        ('garden-at-sainte-adresse', 'Claude Monet', '1867'),
        ('pont-neuf', 'Pierre-Auguste Renoir', '1872'),
        ('luncheon-on-the-grass', 'Edouard Manet', '1863'),
        ('luncheon-of-the-boating-party', 'Pierre-Auguste Renoir', '1880'),
        ('the-floor-planers', 'Gustave Caillebotte', '1875'),
        ('a-bar-at-the-folies-bergere', 'Edouard Manet', '1882'),
    ],
    'self-portraits': [
        ('self-portrait-with-death-playing-the-fiddle', 'Arnold Bocklin', '1872'),
        ('the-desperate-man', 'Gustave Courbet', '1845'), 
        ('self-portrait-with-bandaged-ear', 'Vincent van Gogh', '1889'), 
        ('self-portrait-with-halo-and-snake', 'Paul Gauguin', '1889'),
        ('the-surprise', 'Joseph Ducreux', '1790'),
    ],
    'vertical': [
        ('lady-with-an-ermine', 'Leonardo da Vinci', '1490'),
        ('woman-with-a-parasol', 'Claude Monet', '1875'),
        ('the-kiss', 'Gustav Klimt', '1908'),
        ('the-arnolfini-protrait', 'Jan van Eyck', '1434'),
        ('the-milkmaid', 'Jan Vermeer', '1658'),
        ('the-lute-player', 'Frans Hals', '1624'),
    ],
}


def getGalleries() -> list:
    base = 'static/paintings/'
    return [i for i in os.listdir(base) if os.path.isdir(base + i)]


def getPainting(gallery_slug: str, painting_slug: str = '') -> dict:
    if gallery_slug not in getGalleries():
        gallery_slug = 'italian-renaissance'
    with open(f'static/paintings/{gallery_slug}/_content.txt') as f:
        lines = f.readlines()

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
