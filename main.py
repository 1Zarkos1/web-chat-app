import re
from flask import Flask, render_template, request, flash, session, redirect, make_response
from socketio import Server, WSGIApp

app = Flask(__name__, template_folder='.', static_url_path='/', static_folder='.')
app.config['SECRET_KEY'] = 'testKey'
sio = Server()
app.wsgi_app = WSGIApp(sio, app.wsgi_app)

current_users = {}

@sio.on('connect')
def connect(sid, environ, auth=None):
    p = re.compile(r'username=(.*);?')
    username = p.search(environ.get('HTTP_COOKIE')).group(1)
    current_users[sid] = username
    # sio.emit('userlist', list(current_users.values()), room=sid)
    sio.emit('system', {'type': 'connect', 'data': username})

@sio.on('disconnect')
def disconnect(sid):
    username = current_users[sid]
    del current_users[sid]
    sio.emit('system', {'type': 'disconnect', 'data': username})

@sio.on('message')
def message(sid, data):
    sio.emit('message', {'sender': current_users[sid], 'data': data})

@app.route('/', methods=['POST', 'GET'])
def main():
    resp = make_response(render_template('index.html'))
    if request.method == 'POST':
        username = request.form.get('username')
        if not username:
            return resp
        elif username in current_users.values():
            flash('That username is already taken! Choose another.')
        else:
            resp = make_response(redirect('/'))
            resp.set_cookie('username', username)
    return resp

@app.route('/leave-chat')
def leave():
    resp = make_response(redirect('/'))
    resp.delete_cookie('username')
    return resp

@app.context_processor
def get_cookie():
    user = request.cookies.get('username')
    if user and user in current_users.values():
        user = None
    return dict(user=user)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)