from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route
from starlette.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles

from database import GALLERIES, MOBILE, painting_context

STATIC_DIR = 'static/'
templates = Jinja2Templates(directory=STATIC_DIR)


def _detect_mobile_agent(request):
    for mobile_platform in ('Android', 'iPhone'):
        if mobile_platform in request.headers['user-agent']:
            return True
    return False


async def homepage(request):
    galleries = MOBILE if _detect_mobile_agent(request) else GALLERIES.keys()
    context = {'request': request, 'galleries': galleries}
    return templates.TemplateResponse('homepage.html', context=context)


async def gallery(request):
    context = painting_context(request.path_params['gallery'])
    context['request'] = request
    return templates.TemplateResponse('painting.html', context=context)


async def painting(request):
    context = painting_context(request.path_params['gallery'],
                               request.path_params['painting'])
    context['request'] = request
    return templates.TemplateResponse('painting.html', context=context)


app = Starlette(debug=True, routes=[
    Mount('/static', StaticFiles(directory=STATIC_DIR), name='static'),
    Route('/', homepage),
    Route('/{gallery:str}', gallery),
    Route('/{gallery:str}/{painting:str}', painting),
])
