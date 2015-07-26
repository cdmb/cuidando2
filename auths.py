#!/usr/bin/env python
# coding: utf-8

import sys

from flask import request, g, url_for

from social.apps.flask_app.default.models import init_social
from social.actions import do_auth, do_complete
from social.apps.flask_app.utils import load_strategy, load_backend
from social.backends.facebook import FacebookOAuth2
from social.strategies.flask_strategy import FlaskStrategy
from social.utils import build_absolute_uri
# from social.strategies.utils import set_current_strategy_getter
# from social.apps.flask_app.routes import social_auth
# from social.apps.flask_app.template_filters import backends


def init_social_models(app, db_session):
    try:
        import mars
    except:
        sys.path.append('..')
    init_social(app, db_session)


# set_current_strategy_getter(load_strategy)


def get_auth_url(backend, redirect_uri='complete', *args, **kwargs):
    uri = redirect_uri
    if uri and not uri.startswith('/'):
        uri = url_for(uri, backend=backend)

    g.strategy = load_strategy()
    g.backend = load_backend(g.strategy, backend, redirect_uri=uri,
                             *args, **kwargs)
    resp = do_auth(g.backend)
    return resp.location


def get_username(backend):
    g.strategy = load_strategy()
    g.backend = load_backend(g.strategy, backend, redirect_uri="/")
    do_complete(g.backend, login=do_login)
    return g.user.username


class HeadlessFacebookStrategy(FlaskStrategy):
    name = 'facebook'

    def build_absolute_uri(self, path=None):
        return build_absolute_uri(request.referrer, path).partition("&")[0]


class HeadlessFacebookBackend(FacebookOAuth2):
    name = 'facebook'

    def validate_state(self):
        if not self.STATE_PARAMETER and not self.REDIRECT_STATE:
            return None
        state = self.get_session_state()
        request_state = self.get_request_state()
        print("VALIDATE!!!!!!!!!!")
        print(state)
        print(request_state)
        # if not request_state:
        #     raise AuthMissingParameter(self, 'state')
        return request_state


def do_login(backend, user, social_user):
    print("do_login", user, social_user)


def insert_user(user, is_new, **kwargs):
    if user:
        g.user = user
    if is_new:
        db_session.add(user)
        db_session.commit()
        print(">>>>>Adicinado ao BD!!!")