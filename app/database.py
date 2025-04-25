
FIELDS = ('slug', 'author', 'year', 'link')

GALLERIES = {
    'italian-reneissance': [
        ('the-creation-of-adam', 'Michelangelo', '1512', 'https://wikipedia.org/wiki/The_Creation_of_Adam'),
        ('the-school-of-athens', 'Raphael', '1510', 'https://wikipedia.org/wiki/The_School_of_Athens'),
        ('the-last-supper', 'Leonardo da Vinci', '1490s', 'https://wikipedia.org/wiki/The_Last_Supper_(Leonardo)'),
        ('primavera', 'Sandro Botticelli', '1470s', 'https://wikipedia.org/wiki/Primavera_(Botticelli)'),
        ('delivery-of-the-keys', 'Pietro Perugino', '1482', 'https://wikipedia.org/wiki/Delivery_of_the_Keys'),
        ('sacred-and-profane-love', 'Titian', '1514', 'https://wikipedia.org/wiki/Sacred_and_Profane_Love'),
        ('the-tempest', 'Giorgione', '1508', 'https://wikipedia.org/wiki/The_Tempest_(Giorgione)'),
        ('the-birth-of-venus', 'Sandro Botticelli', '1486', 'https://wikipedia.org/wiki/The_Birth_of_Venus'),
    ],
    'dutch-golden-age': [
        ('view-of-delft', 'Johannes Vermeer', '1661', ''),
        ('the-young-bull', 'Paulus Potter', '1647', ''),
        ('the-anatomy-lesson', 'Rembrandt', '1550', ''),
        ('the-great-market-in-haarlem', 'Gerrit Berckheyde', '1696', ''),
        ('while-the-housewife-sleeps', 'Jan Steen', '1663', ''),
        ('winter-scene-on-a-canal', 'Hendrick Avercamp', '1615', ''),
        ('the-meagre-company', 'Frans Hals', '1637', ''),
        ('the-dutch-proverbs', 'Pieter Brueghel the Elder', '1559', ''),
    ],
    'impressionism': [
        ('pont-neuf', 'Pierre-Auguste Renoir', '1872', ''),
        ('luncheon-on-the-grass', 'Edouard Manet', '1863', ''),
        ('luncheon-of-the-boating-party', 'Pierre-Auguste Renoir', '1880', ''),
        ('the-floor-planers', 'Gustave Caillebotte', '1875', ''),
        ('a-bar-at-the-folies-bergere', 'Edouard Manet', '1882', ''),
        ('little-girl-in-a-blue-armchair', 'Mary Cassatt', '1878', ''),
        ('paris-street;-rainy-day', 'Gustave Caillebotte', '1877', ''),
        ('garden-at-sainte-adresse', 'Claude Monet', '1867', ''),
    ],
}


def painting_context(gallery_slug: str, painting_slug: str = '') -> dict:
    if gallery_slug not in GALLERIES:
        gallery_slug = 'italian-reneissance'

    gallery = GALLERIES[gallery_slug]
    for i, painting in enumerate(gallery):
        if painting[0] == painting_slug:
            break

    context = dict(zip(FIELDS, painting))
    context['title'] = context['slug'].replace('-', ' ').title()
    next_slug = gallery[0 if i+1 == len(gallery) else i+1][0]
    context['next'] = f'/{gallery_slug}/{next_slug}'
    return context
