import uuid
import json
import urllib

import arrow
from karl_website_v2.lib.url_builder import get_static_assets_url, get_versioned_static_assets_url

from flask import Blueprint, Response, render_template, request, current_app, url_for, jsonify, redirect
from .. import account_linking, data, constants, festival_reco


festival = Blueprint('festivals', __name__)

APPROVED_FESTIVALS = constants.FESTIVAL_NAMES.keys()


@festival.route('/festivals', methods=['GET'])
def festivals():
    """ User visits /festivals and gets a new uuid, if args, then user has responded to spotify auth """
    args = request.args
    search_url = "{0}{1}{2}".format(current_app.config['LOCAL'], '/festivals/', 'search')

    if not args:
        # New visitor
        user_id = uuid.uuid1()
        spotify_connected = False
        spotify_link_url = account_linking.generate_spotify_link_url(user_id)
    else:
        # args exist, might be a redirect to process
        spotify_connected = args.get('spotify_connected', False)
        user_id = args.get('user_id', None)
        spotify_link_url = None

        if spotify_connected and user_id:
            # user has been re-directed from spotify o-auth flow
            user = data.get_user_from_couch(user_id)
            spotify_context = user.get('spotify_auth', None)
            if spotify_context:
                # we can obtain spotify data and update user profile
                sp_artists, sp_genres = data.get_user_music_info_spotify(spotify_context['access_token'])
                spotify_user_id = data.get_spotify_user_id(spotify_context['access_token'])

                new_info = {
                    'sp_artists': sp_artists,
                    'sp_genres': sp_genres,
                    'spotify_user_id': spotify_user_id
                }
                data.save_user_to_couch(user_id, new_info)

    return render_template('festivals.html',
                           static_assets_folder=get_static_assets_url(),
                           versioned_assets_folder=get_versioned_static_assets_url(),
                           spotify_account_linking_url=spotify_link_url,
                           spotify_connected=spotify_connected,
                           search=search_url,
                           user_id=user_id,
                           festival_list=constants.festival_list
                           )


@festival.route('/festivals_oauth/spotify/', methods=['GET'])
def spotify_redirect():
    """ Redirect from spotify auth, check response """
    args = request.args
    spotify_connected = False

    if args.get('code', None):
        spotify_context = account_linking.update_oauth_token(authorization_code=args['code'])
        spotify_connected = True
        data.save_user_to_couch(args['state'], {'spotify_auth': spotify_context})
    elif args.get('error', None):
        # TODO: Handle the error better
        spotify_connected = False

    params = {'user_id': args['state'], 'spotify_connected': spotify_connected}
    param_string = urllib.parse.urlencode(params)
    url = "{0}{1}{2}".format(current_app.config['LOCAL'], '/festivals?', param_string)

    return redirect(url)


@festival.route('/festivals/search', methods=['POST'])
def search():
    """ Generates a lineup based on user criterion """
    params = request.get_data(cache=False, as_text=True)
    params = json.loads(params)

    user_id = params.get('user_id', None)
    festival = params.get('festival', None)
    if user_id and festival:
        # we can continue, have minimum fields to progress
        user = data.get_user_from_couch(user_id)
        params['sp_artists'] = user.get('sp_artists', [])
        params['sp_genres'] = user.get('sp_genres', [])
    else:
        response = jsonify({"error": "A valid user_id and festival is a required field for this endpoint."})
        response.status_code = 406
        return response

    res_events, spotify_ids = festival_reco.get_lineup(params)

    # updating spotify token if expired
    spotify_context = user.get('spotify_auth', {})
    if spotify_context:
        token_expiry_time = arrow.get(spotify_context.get('access_token_expiry', None))
        if arrow.now() > token_expiry_time:
            refresh_token = user.get('spotify_auth', {}).get('refresh_token', None)
            spotify_context = account_linking.update_oauth_token(token=refresh_token, target='spotify')
            user['spotify_auth'] = spotify_context

    spotify_playlist = data.build_spotify_playlist(user, spotify_ids, festival)

    return render_template('results.html',
                           static_assets_folder=get_static_assets_url(),
                           versioned_assets_folder=get_versioned_static_assets_url(),
                           spotify_account_linking_url=None,
                           spotify_connected=False,
                           search={},
                           res_events=json.loads(res_events),
                           spotify_playlist=spotify_playlist
                           )


@festival.route('/festivals/artists', methods=['GET'])
def artist_info():
    """ Generates a name/image_url profile per artist in festival key provided """
    args = request.args
    festival = args.get('festival', None)
    artists = []

    if not festival:
        response = jsonify({"success": False, "error": "festival is a required argument for this endpoint."})
        response.status_code = 406
        return response
    elif festival in APPROVED_FESTIVALS:
        with open('karl_website_v2/data/{}/artists.json'.format(festival), 'r') as f:
            artists = json.load(f)

    response = jsonify(artists)
    response.status_code = 200
    return response


@festival.route('/festivals/artists_search', methods=['GET'])
def artist_info_suggestion():
    """ Generates a name/image_url profile per matching artists in festival key provided and user search term"""
    args = request.args
    selected_festival = args.get('festival', None)
    search_term = args.get('search_term', None).lower()
    selected = args.get('selected', '').split(',')
    artists = []

    if not selected_festival:
        response = jsonify({"success": False, "error": "time and location are required arguments for this endpoint"})
        response.status_code = 406
        return response
    elif selected_festival in APPROVED_FESTIVALS:
        with open('karl_website_v2/data/{}/artists.json'.format(selected_festival), 'r') as f:
            artists = json.load(f)

    matches = list(filter(lambda artist: search_term in artist['artist'].lower(), artists))

    if selected:
        matches = list(filter(lambda artist: artist['artist'] not in selected, matches))

    response = jsonify(matches)
    response.status_code = 200
    return response


@festival.route('/festivals/artist_add', methods=['GET'])
def artist_add_visual():
    """ Generates a name/image_url profile per matching artists in festival key provided and user search term"""
    args = request.args
    selected_festival = args.get('festival', None)
    search_term = args.get('search_term', None).lower()
    artists = []

    if not selected_festival:
        response = jsonify({"success": False, "error": "time and location are required arguments for this endpoint"})
        response.status_code = 406
        return response
    elif selected_festival in APPROVED_FESTIVALS:
        with open('karl_website_v2/data/{}/artists.json'.format(selected_festival), 'r') as f:
            artists = json.load(f)

    matches = list(filter(lambda artist: search_term in artist['artist'].lower(), artists))

    response = jsonify(matches)
    response.status_code = 200
    return response
