from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash,check_password_hash
import mysql.connector


app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="smj1234@mi",
        database="pomodoro"
    )


@app.route("/")
def home():
    return "Pomodoro Timer backend is running!"


@app.route("/api/test")
def test():
    return jsonify({
        "message": "Hello from Pomodoro Timer!",
        "status": "success"
    })

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data["name"]
    email = data["email"]
    password = data["password"]

    hashed_password = generate_password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO users (name, email, password)
        VALUES (%s, %s, %s)
    """

    cursor.execute(query, (name, email, hashed_password))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Registration successful!"
    })

@app.route("/api/session", methods=["POST"])
def create_session():

    data = request.get_json()

    duration = data["duration"]
    session_type = data["session_type"]

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO session (duration, session_type)
        VALUES (%s, %s)
    """

    cursor.execute(query, (duration, session_type))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Session saved successfully!",
        "duration": duration,
        "session_type": session_type
    })
@app.route("/api/tasks", methods=["POST"])
def create_task():

    data = request.get_json()

    user_id = data["user_id"]
    title = data["title"]

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO tasks (user_id, title)
        VALUES (%s, %s)
    """

    cursor.execute(query, (user_id, title))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Task created successfully!"
    })
@app.route("/api/tasks/<int:user_id>", methods=["GET"])
def get_tasks(user_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT id, title, completed, created_at
        FROM tasks
        WHERE user_id = %s
        ORDER BY created_at DESC
    """

    cursor.execute(query, (user_id,))

    tasks = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(tasks)
@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def complete_task(task_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        UPDATE tasks
        SET completed = TRUE
        WHERE id = %s
    """

    cursor.execute(query, (task_id,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Task completed successfully!"
    })
@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data["email"]
    password = data["password"]

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT id, name, email, password
        FROM users
        WHERE email = %s
    """

    cursor.execute(query, (email,))

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if user is None:
        return jsonify({
            "message": "User not found"
        }), 404

    if not check_password_hash(user["password"], password):
        return jsonify({
            "message": "Incorrect password"
        }), 401

    return jsonify({
        "message": "Login successful!",
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"]
    })
@app.route("/api/stats/<int:user_id>", methods=["GET"])
def get_stats(user_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Total focus sessions
    cursor.execute("""
        SELECT COUNT(*) AS total_sessions
        FROM session
        WHERE user_id = %s
        AND session_type = 'focus'
    """, (user_id,))

    total_sessions = cursor.fetchone()["total_sessions"]


    # Total focus minutes
    cursor.execute("""
        SELECT COALESCE(SUM(duration), 0) AS total_minutes
        FROM session
        WHERE user_id = %s
        AND session_type = 'focus'
    """, (user_id,))

    total_minutes = cursor.fetchone()["total_minutes"]


    # Completed tasks
    cursor.execute("""
        SELECT COUNT(*) AS completed_tasks
        FROM tasks
        WHERE user_id = %s
        AND completed = TRUE
    """, (user_id,))

    completed_tasks = cursor.fetchone()["completed_tasks"]


    # Pending tasks
    cursor.execute("""
        SELECT COUNT(*) AS pending_tasks
        FROM tasks
        WHERE user_id = %s
        AND completed = FALSE
    """, (user_id,))

    pending_tasks = cursor.fetchone()["pending_tasks"]


    cursor.close()
    connection.close()


    return jsonify({
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks
    })
if __name__ == "__main__":
    app.run(debug=True)