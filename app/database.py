
FIELDS = ('slug', 'author', 'year')

GALLERIES = {
    'flemish-proverbs': [
        ('flemish-proverbs-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('nederlandse-spreekwoorden-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-blue-cloak-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-topsy-turvy-world-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-dutch-proverbs-fragment', 'Pieter Brueghel the Elder', '1559'),
        ('the-dutch-proverbs', 'Pieter Brueghel the Elder', '1559'),
    ],
    'italian-reneissance': [
        ('lady-with-an-ermine', 'Leonardo da Vinci', '1490'),
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
    'french-impressionism': [
        ('paris-street;-rainy-day', 'Gustave Caillebotte', '1877'),
        ('garden-at-sainte-adresse', 'Claude Monet', '1867'),
        ('pont-neuf', 'Pierre-Auguste Renoir', '1872'),
        ('luncheon-on-the-grass', 'Edouard Manet', '1863'),
        ('luncheon-of-the-boating-party', 'Pierre-Auguste Renoir', '1880'),
        ('the-floor-planers', 'Gustave Caillebotte', '1875'),
        ('a-bar-at-the-folies-bergere', 'Edouard Manet', '1882'),
    ],
    'vertical': [
        ('the-arnolfini-protrait', 'Jan van Eyck', '1434'),
        ('lady-with-an-ermine', 'Leonardo da Vinci', '1490'),
        ('woman-with-a-parasol', 'Claude Monet', '1875'),
    ],
}
MOBILE = ['vertical']


def painting_context(gallery_slug: str, painting_slug: str = '') -> dict:
    if gallery_slug not in GALLERIES:
        gallery_slug = 'italian-reneissance'

    gallery = GALLERIES[gallery_slug]
    for i, painting in enumerate(gallery):
        if painting[0] == painting_slug:
            break
        if i+1 == len(gallery):
            painting = gallery[0]
            i = 0

    context = dict(zip(FIELDS, painting))
    context['title'] = context['slug'].replace('-', ' ').title()
    next_slug = gallery[0 if i+1 == len(gallery) else i+1][0]
    context['next'] = f'/{gallery_slug}/{next_slug}'
    return context
