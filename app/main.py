from starlette.applications import Starlette
from starlette.routing import Mount, Route
from starlette.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles

from database import getGalleries, getPainting

STATIC_DIR = 'static/'
templates = Jinja2Templates(directory=STATIC_DIR)


def _detectMobile(request):
    for mobile_platform in ('Android', 'iPhone'):
        if mobile_platform in request.headers['user-agent']:
            return True
    return False


async def alapolok(request):
    return templates.TemplateResponse('alapolok/page.html', context={'request': request})


async def rects(request):
    return templates.TemplateResponse('alapolok/rect_af.html', context={'request': request})


async def homepage(request):
    context = {'request': request, 'galleries': getGalleries()}
    return templates.TemplateResponse('homepage.html', context=context)


async def gallery(request):
    context = getPainting(request.path_params['gallery'],
                          mobile=_detectMobile(request))
    context['request'] = request
    return templates.TemplateResponse('painting.html', context=context)


async def painting(request):
    context = getPainting(request.path_params['gallery'],
                          request.path_params['painting'],
                          mobile=_detectMobile(request))
    context['request'] = request
    return templates.TemplateResponse('painting.html', context=context)


app = Starlette(debug=True, routes=[
    Mount('/static', StaticFiles(directory=STATIC_DIR), name='static'),
    Route('/', homepage),
    Route('/alapolok', alapolok),
    Route('/rects', rects),
    Route('/{gallery:str}', gallery),
    Route('/{gallery:str}/{painting:str}', painting),
])
