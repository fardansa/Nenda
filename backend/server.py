from fastapi import FastAPI, Request, Response, HTTPException, Cookie, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from pydantic import BaseModel
import mysql.connector
from dotenv import load_dotenv
import os
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, cast, Dict, Any

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT configuration
SECRET_KEY = "nenda_secret_key_for_class_assignment"
ALGORITHM = "HS256"

# Request Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    nama: str
    email: str
    password: str

# Password Hashing Helpers
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

# JWT Helper Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=120)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# Database Connection Helper with Socket Fallback
def get_db_connection():
    db_socket = os.getenv("DB_UNIX_SOCKET", "/opt/lampp/var/mysql/mysql.sock")
    try:
        if db_socket and os.path.exists(db_socket):
            return mysql.connector.connect(
                user=os.getenv("DB_USER", "nenda"),
                password=os.getenv("DB_PASSWORD", "12345678"),
                database=os.getenv("DB_NAME", "nenda_db"),
                unix_socket=db_socket
            )
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "nenda"),
            password=os.getenv("DB_PASSWORD", "12345678"),
            database=os.getenv("DB_NAME", "nenda_db")
        )
    except mysql.connector.Error as e:
        # Fallback to root with no password (common on local development/XAMPP defaults)
        try:
            if db_socket and os.path.exists(db_socket):
                return mysql.connector.connect(
                    user="root",
                    password="",
                    database=os.getenv("DB_NAME", "nenda_db"),
                    unix_socket=db_socket
                )
            return mysql.connector.connect(
                host="127.0.0.1",
                port=3306,
                user="root",
                password="",
                database=os.getenv("DB_NAME", "nenda_db")
            )
        except Exception:
            raise e

# Base Directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Pages serving routes ---

@app.get("/", response_class=HTMLResponse)
def get_login_page(request: Request):
    token = request.cookies.get("session_token")
    if token:
        payload = decode_access_token(token)
        if payload:
            return RedirectResponse(url="/dashboard")
            
    with open(os.path.join(BASE_DIR, "login.html"), "r") as f:
        return f.read()

@app.get("/dashboard", response_class=HTMLResponse)
def get_dashboard_page(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        return RedirectResponse(url="/")
    
    payload = decode_access_token(token)
    if not payload:
        response = RedirectResponse(url="/")
        response.delete_cookie("session_token")
        return response
        
    with open(os.path.join(BASE_DIR, "dashboard.html"), "r") as f:
        return f.read()

# --- API authentication routes ---

@app.post("/api/register")
def register(req: RegisterRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if user already exists
        cursor.execute("SELECT * FROM user WHERE email = %s", (req.email,))
        existing = cursor.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already registered")
        
        # Hash password and insert user
        hashed_pwd = hash_password(req.password)
        cursor.execute(
            "INSERT INTO user (nama, email, password, role) VALUES (%s, %s, %s, %s)",
            (req.nama, req.email, hashed_pwd, "user")
        )
        conn.commit()
        return {"status": "success", "message": "User registered successfully"}
    except mysql.connector.Error as db_err:
        raise HTTPException(status_code=500, detail=f"Database error: {db_err}")
    finally:
        cursor.close()
        conn.close()

@app.post("/api/login")
def login(req: LoginRequest, response: Response):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Fetch user
        cursor.execute("SELECT * FROM user WHERE email = %s", (req.email,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid email or password")
        
        # Cast to dict to satisfy Pylance type checking
        user = cast(Dict[str, Any], row)
        if not verify_password(req.password, user["password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")
        
        # Generate JWT session token
        token_data = {
            "user_id": user["user_id"],
            "nama": user["nama"],
            "email": user["email"],
            "password": user["password"],
            "role": user["role"]
        }
        token = create_access_token(token_data)
        
        # Set HTTP-Only Cookie
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            max_age=7200,
            samesite="lax"
        )
        return {"status": "success", "user": token_data}
    except mysql.connector.Error as db_err:
        raise HTTPException(status_code=500, detail=f"Database error: {db_err}")
    finally:
        cursor.close()
        conn.close()

@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie(key="session_token")
    return {"status": "success", "message": "Logged out successfully"}

# --- Dashboard helper APIs ---

@app.get("/api/user")
def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    return payload

@app.get("/api/tents")
def get_tents_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Query fetching all packages from the 'paket' table along with count of available tents and availability status
        query = """
            SELECT p.paket_id, p.nama_paket, p.deskripsi, p.fasilitas, p.kapasitas, p.harga,
                   (SELECT COUNT(*) FROM tent t WHERE t.paket_id = p.paket_id AND t.status = 'tersedia') AS available_count,
                   CASE 
                       WHEN (SELECT COUNT(*) FROM tent t WHERE t.paket_id = p.paket_id AND t.status = 'tersedia') > 0 THEN 'Tersedia'
                       ELSE 'Tidak Tersedia'
                   END AS status
            FROM paket p
            ORDER BY p.paket_id ASC
        """
        cursor.execute(query)
        tents = cursor.fetchall()
        return {"tents": tents}
    except mysql.connector.Error as db_err:
        raise HTTPException(status_code=500, detail=f"Database error: {db_err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=6969, reload=True)