
import sqlite3
from flask import Flask, request, jsonify
import random
import hashlib
import datetime
import os
import json
import tests
from datetime import datetime
app = Flask(__name__)
app.config['SECRET_KEY'] = ''.join(
    random.choice('0123456789ABCDEF') for i in range(16))
database_path = './Data/database.db'
config_path = 'Data/configs.json'


def get_hash(password, salt):
    hash = hashlib.pbkdf2_hmac(
        'sha256', password.encode('utf-8'), salt, 100000)
    return hash.hex()


class db_handler:
    def __init__(self):
        if not os.path.exists(database_path):
            self.initialize_db()
            with open(config_path, 'r') as config_file:
                config = json.load(config_file)
                admin_username = config['admin']['username']
                admin_password = config['admin']['password']
                admin_email = config['admin']['email']
                salt = os.urandom(16)
                hash = get_hash(admin_password, salt)
                self.execute('INSERT INTO users (username, hash, salt, email, permissions) VALUES (?, ?, ?, ?, ?)',
                             (admin_username, hash, salt, admin_email, 'admin'))

    def connect_db(self):
        return sqlite3.connect(database_path)

    def execute(self, statement, params=None):
        db = self.connect_db()
        db_cur = db.cursor()
        if params is None:
            result = db_cur.execute(statement)
        else:
            result = db_cur.execute(statement, params)
        if statement.startswith('SELECT'):
            return result
        db.commit()
        db.close()

    def initialize_db(self):
        db = self.connect_db()
        db_cur = db.cursor()
        db_cur.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            email TEXT NOT NULL,
            permissions TEXT NOT NULL
        )''')
        db_cur.execute('''CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            end_time INTEGER NOT NULL,
            item TEXT NOT NULL,
            status TEXT NOT NULL
        )''')
        db_cur.execute('''CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL
        )''')
        db.commit()
        db.close()


dat = db_handler()


def readable_to_timestamp(readable_time):
    readable_time = datetime.strptime(readable_time, '%Y-%m-%d %H:%M:%S')
    timestamp = int(readable_time.timestamp())
    return int(timestamp)


def timestamp_to_readable(timestamp):
    readable_time = datetime.fromtimestamp(timestamp)
    return readable_time


def get_reservation(reservation_id):
    reservation = dat.execute(
        'SELECT * FROM reservations WHERE id = ?', (reservation_id,)).fetchone()
    return reservation


def user_exists(username):
    user = dat.execute(
        'SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    return user is not None


def item_exists(item_name):
    item = dat.execute('SELECT * FROM items WHERE name = ?',
                       (item_name,)).fetchone()
    return item is not None


def authenticate(username, password):
    hash_salt = dat.execute(
        'SELECT hash, salt FROM users WHERE username = ?', (username,)).fetchone()
    if hash_salt is None:
        return False
    if hash_salt[0] != get_hash(password, hash_salt[1]):
        return False
    return True


@app.route('/login', methods=['POST'])
def login():
    try:
        username = request.form['username']
        password = request.form['password']
        user = dat.execute(
            'SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        if user is None:
            return jsonify({'status': 'error', 'error': 'Authentication failed'})
        if not authenticate(username, password):
            return jsonify({'status': 'error', 'error': 'Authentication failed'})
        return jsonify({'status': 'success', 'username': user[1], 'permissions': user[5]})
    except Exception as e:
        print(e)
        return jsonify({'status': 'error', 'error': 'Internal server error'})


@app.route('/items', methods=['GET', 'POST'])
def get_items():
    if request.method == 'GET':
        items = dat.execute('SELECT * FROM items').fetchall()
        field_names = ['id', 'name', 'description', 'status']
        items_list = []
        for item in items:
            item_dict = {}
            for i in range(len(field_names)):
                item_dict[field_names[i]] = item[i]
            items_list.append(item_dict)
        return jsonify({'status': 'success', 'items': items_list})
    elif request.method == 'POST':
        try:
            start_time = request.form['start_time']
            end_time = request.form['end_time']
            if not tests.check_time_valid(start_time) or not tests.check_time_valid(end_time):
                return jsonify({'status': 'error', 'error': 'Invalid time'})
            start_time = readable_to_timestamp(start_time)
            end_time = readable_to_timestamp(end_time)
            items = dat.execute('SELECT * FROM items').fetchall()
            reservation_exists = []
            for item in items:
                within_reservations = dat.execute(
                    'SELECT * FROM reservations WHERE item = ? AND start_time <= ? AND end_time >= ?',
                    (item[1], end_time, start_time)
                ).fetchall()
                encap_reservations = dat.execute(
                    'SELECT * FROM reservations WHERE item = ? AND start_time <= ? AND end_time >= ?',
                    (item[1], start_time, start_time)
                ).fetchall()
                if len(within_reservations) > 0:
                    items.remove(item)
                    reservation_exists.append(item)
                elif len(encap_reservations) > 0:
                    items.remove(item)
                    reservation_exists.append(item)
            field_names = ['id', 'name', 'description', 'status']
            items = [dict(zip(field_names, item)) for item in items]
            reservation_exists = [dict(zip(field_names, resv))
                                  for resv in reservation_exists]
            resp = {'status': 'success', 'items': items,
                    'reserved': reservation_exists}
            return jsonify(resp)
        except Exception as e:
            print(e)
            return jsonify({'status': 'error', 'error': 'Internal server error'})


@app.route('/reserve', methods=['POST'])
def reserve():
    error = None
    try:
        username = request.form['username']
        password = request.form['password']
        start_time = request.form['start_time']
        end_time = request.form['end_time']
        item = request.form['item']
        if not authenticate(username, password):
            error = 'Authentication failed'
        if not item_exists(item):
            error = 'Item not found'
        if readable_to_timestamp(start_time) > readable_to_timestamp(end_time):
            error = 'Start time is after end time'
        if readable_to_timestamp(start_time) < datetime.now().timestamp():
            error = 'Start time is before current time'
        if readable_to_timestamp(end_time) < datetime.now().timestamp():
            error = 'End time is before current time'
        reservations = dat.execute('SELECT * FROM reservations WHERE item = ? AND start_time <= ? AND end_time >= ?', (
            item, end_time, start_time)).fetchall()
        encap_reservations = dat.execute('SELECT * FROM reservations WHERE item = ? AND start_time <= ? AND end_time >= ?', (
            item, start_time, start_time)).fetchall()
        if len(reservations) > 0:
            error = 'Item is reserved'
        elif len(encap_reservations) > 0:
            error = 'Item is reserved'
        if error is None:
            dat.execute('INSERT INTO reservations (username, item, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
                        (username, item, readable_to_timestamp(start_time), readable_to_timestamp(end_time), 'pending'))
            return jsonify({'status': 'success'})
        else:
            print(error)
            return jsonify({'status': 'error', 'error': error})
    except:
        print('Error')
        return jsonify({'status': 'error', 'error': 'Internal server error'})


@app.route('/cancel', methods=['POST'])
def cancel():
    username = request.form['username']
    password = request.form['password']
    reservation_id = request.form['reservation_id']
    if not authenticate(username, password):
        return jsonify({'status': 'error', 'error': 'Authentication failed'})
    reservation = get_reservation(reservation_id)
    if reservation is None:
        return jsonify({'status': 'error', 'error': 'Reservation not found'})
    if reservation[1] != username:
        return jsonify({'status': 'error', 'error': 'Username is incorrect'})
    if reservation[5] != 'pending':
        return jsonify({'status': 'error', 'error': 'Reservation is not pending'})
    dat.execute('DELETE FROM reservations WHERE id = ?', (reservation_id,))
    return jsonify({'username': username, 'item': reservation[2], 'start_time': reservation[3], 'end_time': reservation[4], 'status': 'success'})


@app.route('/reservations', methods=['POST', 'GET'])
def get_reservations():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if not authenticate(username, password):
            return jsonify({'error': 'Authentication failed'})
        reservations = dat.execute(
            'SELECT * FROM reservations WHERE username = ?', (username,)).fetchall()
        field_names = ['id', 'username', 'start_time',
                       'end_time', 'item', 'status']
        reservations = [dict(zip(field_names, reservation))
                        for reservation in reservations]
        return jsonify(reservations)
    elif request.method == 'GET':
        if not authenticate_admin(request.args.get('username'), request.args.get('password')):
            return jsonify({'error': 'Authentication failed'})
        reservations = dat.execute('SELECT * FROM reservations').fetchall()
        field_names = ['id', 'username', 'start_time',
                       'end_time', 'item', 'status']
        for reservation in reservations:
            updated_reservation = list(reservation)
            updated_reservation[2] = timestamp_to_readable(reservation[2])
            updated_reservation[3] = timestamp_to_readable(reservation[3])
            reservations[reservations.index(reservation)] = updated_reservation
        reservations = [dict(zip(field_names, reservation))
                        for reservation in reservations]
        return jsonify({'reservations': reservations})


def authenticate_admin(username, password):
    if not user_exists(username):
        return False
    hash, salt, permission = dat.execute(
        'SELECT hash, salt, permissions FROM users WHERE username = ?', (username,)).fetchone()
    if hash is not None and permission == 'admin':
        if hash == get_hash(password, salt):
            return True
        else:
            return False
    else:
        return False


@app.route('/admin/lend', methods=['POST'])
def lend():
    username = request.form['username']
    password = request.form['password']
    reservation_id = request.form['reservation_id']
    if not authenticate_admin(username, password):
        return jsonify({'error': 'Authentication failed'})
    reservation = get_reservation(reservation_id)
    if reservation is None:
        return jsonify({'error': 'Reservation not found'})
    if reservation[5] != 'pending':
        print(reservation)
        return jsonify({'error': 'Reservation is not pending'})
    dat.execute('UPDATE reservations SET status = ? WHERE id = ?',
                ('lent', reservation_id))
    return jsonify({'username': username, 'item': reservation[2], 'start_time': reservation[3], 'end_time': reservation[4], 'status': 'lent'})


@app.route('/admin/return', methods=['POST'])
def return_reservation():
    username = request.form['username']
    password = request.form['password']
    reservation_id = request.form['reservation_id']
    if not authenticate_admin(username, password):
        return jsonify({'error': 'Authentication failed'})
    reservation = get_reservation(reservation_id)
    if reservation is None:
        return jsonify({'error': 'Reservation not found'})
    if reservation[5] != 'lent' and reservation[5] != 'returned':
        return jsonify({'error': 'Reservation is not lent'})
    dat.execute('UPDATE reservations SET status = ? WHERE id = ?',
                ('returned', reservation_id))
    return jsonify({'username': username, 'item': reservation[2], 'start_time': reservation[3], 'end_time': reservation[4], 'status': 'returned'})


@app.route('/admin/overdue', methods=['POST'])
def get_overdue_reservations():
    username = request.form['username']
    password = request.form['password']
    if not authenticate_admin(username, password):
        return jsonify({'error': 'Authentication failed'})
    reservations = dat.execute(
        'SELECT * FROM reservations WHERE status = ?', ('lent',)).fetchall()
    current_time = datetime.now()
    overdue_reservations = []
    for reservation in reservations:
        if reservation[3] < current_time.timestamp():
            overdue_reservations.append(reservation)
    for reservation in overdue_reservations:
        updated_reservation = list(reservation)
        updated_reservation[2] = timestamp_to_readable(reservation[2])
        updated_reservation[3] = timestamp_to_readable(reservation[3])
        overdue_reservations[overdue_reservations.index(
            reservation)] = updated_reservation
    field_names = ['id', 'username', 'start_time',
                   'end_time', 'item', 'status']
    overdue_reservations = [dict(zip(field_names, reservation))
                            for reservation in overdue_reservations]
    return jsonify({'overdue_reservations': overdue_reservations})


@app.route('/admin/pending', methods=['POST'])
def get_pending_reservations():
    username = request.form['username']
    password = request.form['password']
    if not authenticate_admin(username, password):
        return jsonify({'error': 'Authentication failed'})
    reservations = dat.execute(
        'SELECT * FROM reservations WHERE status = ?', ('pending',)).fetchall()
    current_time = datetime.now()
    current_time = current_time.timestamp()
    pending_reservations = []
    for reservation in reservations:
        if reservation[3] > current_time:
            pending_reservations.append(reservation)
    return jsonify({'pending_reservations': pending_reservations})


@app.route('/admin/users', methods=['POST'])
def list_users():
    username = request.form['username']
    password = request.form['password']
    if not authenticate_admin(username, password):
        return jsonify({'error': 'Authentication failed'})
    users = dat.execute(
        'SELECT id, username, email, permissions, hash FROM users').fetchall()
    users = [dict(zip(['id', 'username', 'email', 'permissions', 'hash'], user))
             for user in users]
    return jsonify({'users': users})


@app.route('/admin/register', methods=['POST'])
def register():
    if not authenticate_admin(request.form['username'], request.form['password']):
        return jsonify({'error': 'Authentication failed'})
    new_username = request.form['new_username']
    new_password = request.form['new_password']
    new_email = request.form['new_email']
    new_permissions = request.form['new_permissions']
    new_salt = os.urandom(16)
    new_hash = get_hash(new_password, new_salt)
    if user_exists(new_username):
        return jsonify({'error': 'User already exists'})
    dat.execute('INSERT INTO users (username, hash, salt, email, permissions) VALUES (?, ?, ?, ?, ?)', (
        new_username,
        new_hash,
        new_salt,
        new_email,
        new_permissions)
    )
    return jsonify({'status': 'success', 'username': new_username, 'permissions': new_permissions})


@app.route('/admin/delete_user', methods=['POST'])
def delete_user():
    if not authenticate_admin(request.form['username'], request.form['password']):
        return jsonify({'error': 'Authentication failed'})
    username = request.form['username_to_delete']
    if not user_exists(username):
        return jsonify({'error': 'User does not exist'})
    dat.execute('DELETE FROM users WHERE username = ?', (username,))
    return jsonify({'success': 'User deleted'})


@app.route('/admin/add_item', methods=['POST'])
def add_item():
    if not authenticate_admin(request.form['username'], request.form['password']):
        return jsonify({'error': 'Authentication failed'})
    new_item_name = request.form['name']
    new_item_description = request.form['description']
    if item_exists(new_item_name):
        return jsonify({'error': 'item already exists'})
    dat.execute('INSERT INTO items (name, description, status) VALUES (?, ?, ?)',
                (new_item_name, new_item_description, 'available'))
    return jsonify({'status': 'success'})


@app.route('/admin/remove_item', methods=['POST'])
def remove_item():
    if not authenticate_admin(request.form['username'], request.form['password']):
        return jsonify({'error': 'Authentication failed'})
    item_name = request.form['name']
    if not item_exists(item_name):
        return jsonify({'error': 'item does not exist'})
    dat.execute('DELETE FROM items WHERE name = ?', (item_name,))
    return jsonify({'status': 'success'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6969, debug=True)
