from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route
from starlette.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles

from database import GALLERIES, painting_context

STATIC_DIR = 'static/'
templates = Jinja2Templates(directory=STATIC_DIR)


async def homepage(request):
    context = {'request': request, 'galleries': list(GALLERIES.keys())}
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
