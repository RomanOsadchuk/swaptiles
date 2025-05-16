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


async def homepage(request):
    # galleries = MOBILE if _detect_mobile_agent(request) else GALLERIES.keys()
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
    Route('/{gallery:str}', gallery),
    Route('/{gallery:str}/{painting:str}', painting),
])
