from fastapi import FastAPI, Request, Response, HTTPException, Cookie, Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
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

# Mount uploaded files directory statically
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
upload_dir = os.path.join(BASE_DIR, "upload")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/upload", StaticFiles(directory=upload_dir), name="upload")

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

def get_admin_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    return payload

@app.get("/api/user")
def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    return payload

@app.get("/api/admin/users")
def get_admin_users(request: Request):
    get_admin_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT user_id, nama, email, role, created_at FROM user ORDER BY user_id DESC")
        users = cursor.fetchall()
        for u in users:
            if u.get("created_at") is not None:
                u["created_at"] = str(u["created_at"])
        return {"users": users}
    except mysql.connector.Error as db_err:
        raise HTTPException(status_code=500, detail=f"Database error: {db_err}")
    finally:
        cursor.close()
        conn.close()

@app.get("/api/admin/tents")
def get_admin_tents(request: Request):
    get_admin_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT t.tent_id, t.nomor_tent, t.nomor_loker, t.status, p.nama_paket, p.harga
            FROM tent t
            JOIN paket p ON t.paket_id = p.paket_id
            ORDER BY t.tent_id ASC
        """
        cursor.execute(query)
        tents = cursor.fetchall()
        return {"tents": tents}
    except mysql.connector.Error as db_err:
        raise HTTPException(status_code=500, detail=f"Database error: {db_err}")
    finally:
        cursor.close()
        conn.close()

class TentStatusUpdate(BaseModel):
    status: str

@app.post("/api/admin/tents/{tent_id}/status")
def update_tent_status(tent_id: int, req: TentStatusUpdate, request: Request):
    get_admin_user(request)
    if req.status not in ["tersedia", "tidak tersedia"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "UPDATE tent SET status = %s WHERE tent_id = %s",
            (req.status, tent_id)
        )
        conn.commit()
        return {"status": "success", "message": "Tent status updated successfully"}
    except mysql.connector.Error as db_err:
        raise HTTPException(status_code=500, detail=f"Database error: {db_err}")
    finally:
        cursor.close()
        conn.close()


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


# --- New Booking and Availability APIs ---

@app.get("/api/tents/booked")
def get_booked_tents(check_in: str, check_out: str, paket_id: int):
    # Retrieve all tent numbers (nomor_tent) that are unavailable during the timespan
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT t.nomor_tent FROM tent t
            WHERE t.paket_id = %s AND (
                t.status = 'tidak tersedia'
                OR t.tent_id IN (
                    SELECT dp.tent_id 
                    FROM detail_pemesanan dp
                    JOIN pemesanan_master pm ON dp.pemesanan_id = pm.pemesanan_id
                    WHERE pm.status_pemesanan IN ('menunggu_pembayaran', 'menunggu_konfirmasi', 'telah_dibayar')
                      AND pm.tanggal_checkin < %s 
                      AND pm.tanggal_checkout > %s
                )
            )
        """
        cursor.execute(query, (paket_id, check_out, check_in))
        rows = cursor.fetchall()
        booked_tents = [r["nomor_tent"] for r in rows]
        return {"booked_tents": booked_tents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.get("/api/tents/{tent_id}/availability")
def check_tent_availability(tent_id: int, check_in: str, check_out: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check general status
        cursor.execute("SELECT status FROM tent WHERE tent_id = %s", (tent_id,))
        tent = cursor.fetchone()
        if not tent:
            raise HTTPException(status_code=404, detail="Tent not found")
        if tent["status"] == "tidak tersedia":
            return {"available": False, "reason": "out_of_service"}
        
        # Check active bookings
        query = """
            SELECT 1 FROM detail_pemesanan dp
            JOIN pemesanan_master pm ON dp.pemesanan_id = pm.pemesanan_id
            WHERE dp.tent_id = %s 
              AND pm.status_pemesanan IN ('menunggu_pembayaran', 'menunggu_konfirmasi', 'telah_dibayar')
              AND pm.tanggal_checkin < %s 
              AND pm.tanggal_checkout > %s
        """
        cursor.execute(query, (tent_id, check_out, check_in))
        if cursor.fetchone():
            return {"available": False, "reason": "booked"}
        return {"available": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


class BookingCreateRequest(BaseModel):
    check_in: str
    check_out: str
    paket_id: int
    nomor_tent: str
    total_harga: int


@app.post("/api/bookings")
def create_booking(req: BookingCreateRequest, request: Request):
    user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Find tent_id
        cursor.execute(
            "SELECT tent_id, status FROM tent WHERE nomor_tent = %s AND paket_id = %s",
            (req.nomor_tent, req.paket_id)
        )
        tent = cursor.fetchone()
        if not tent:
            raise HTTPException(status_code=404, detail="Tent not found")
        if tent["status"] == "tidak tersedia":
            raise HTTPException(status_code=400, detail="Tent is currently out of service")
        
        # Check if already booked for these dates
        check_query = """
            SELECT 1 FROM detail_pemesanan dp
            JOIN pemesanan_master pm ON dp.pemesanan_id = pm.pemesanan_id
            WHERE dp.tent_id = %s 
              AND pm.status_pemesanan IN ('menunggu_pembayaran', 'menunggu_konfirmasi', 'telah_dibayar')
              AND pm.tanggal_checkin < %s 
              AND pm.tanggal_checkout > %s
        """
        cursor.execute(check_query, (tent["tent_id"], req.check_out, req.check_in))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Tent is already booked for these dates")
        
        # Find package price
        cursor.execute("SELECT harga FROM paket WHERE paket_id = %s", (req.paket_id,))
        paket = cursor.fetchone()
        if not paket:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Create master booking
        cursor.execute(
            """
            INSERT INTO pemesanan_master (user_id, tanggal_checkin, tanggal_checkout, total_harga, status_pemesanan, expired_at)
            VALUES (%s, %s, %s, %s, 'menunggu_pembayaran', DATE_ADD(NOW(), INTERVAL 24 HOUR))
            """,
            (user["user_id"], req.check_in, req.check_out, req.total_harga)
        )
        pemesanan_id = cursor.lastrowid
        
        # Create booking detail
        cursor.execute(
            """
            INSERT INTO detail_pemesanan (pemesanan_id, tent_id, harga_per_malam, subtotal)
            VALUES (%s, %s, %s, %s)
            """,
            (pemesanan_id, tent["tent_id"], paket["harga"], req.total_harga)
        )

        # Update tent status to 'tidak tersedia' in database
        cursor.execute(
            "UPDATE tent SET status = 'tidak tersedia' WHERE tent_id = %s",
            (tent["tent_id"],)
        )
        conn.commit()
        return {"status": "success", "pemesanan_id": pemesanan_id}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.get("/api/bookings")
def get_user_bookings(request: Request):
    user = get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT pm.pemesanan_id, pm.tanggal_checkin, pm.tanggal_checkout, pm.total_harga, pm.status_pemesanan,
                   p.nama_paket, t.nomor_tent
            FROM pemesanan_master pm
            JOIN detail_pemesanan dp ON pm.pemesanan_id = dp.pemesanan_id
            JOIN tent t ON dp.tent_id = t.tent_id
            JOIN paket p ON t.paket_id = p.paket_id
            WHERE pm.user_id = %s
            ORDER BY pm.pemesanan_id DESC
        """
        cursor.execute(query, (user["user_id"],))
        bookings = cursor.fetchall()
        for b in bookings:
            b["tanggal_checkin"] = str(b["tanggal_checkin"])
            b["tanggal_checkout"] = str(b["tanggal_checkout"])
        return {"bookings": bookings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.post("/api/bookings/{pemesanan_id}/payment")
async def upload_payment_proof(
    pemesanan_id: int, 
    request: Request,
    bukti_tf: UploadFile = File(...)
):
    user = get_current_user(request)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT pemesanan_id, total_harga, status_pemesanan FROM pemesanan_master WHERE pemesanan_id = %s AND user_id = %s",
            (pemesanan_id, user["user_id"])
        )
        booking = cursor.fetchone()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking["status_pemesanan"] != "menunggu_pembayaran":
            raise HTTPException(status_code=400, detail="Booking is not awaiting payment")
            
        # Read and save the file
        upload_dir = os.path.join(BASE_DIR, "upload")
        os.makedirs(upload_dir, exist_ok=True)
        
        _, ext = os.path.splitext(bukti_tf.filename or "")
        if not ext:
            ext = ".jpg"
        
        filename = f"tf_{pemesanan_id}_{int(datetime.utcnow().timestamp())}{ext}"
        filepath = os.path.join(upload_dir, filename)
        
        content = await bukti_tf.read()
        with open(filepath, "wb") as f:
            f.write(content)
            
        # Update/Insert pembayaran table
        cursor.execute("SELECT pembayaran_id FROM pembayaran WHERE pemesanan_id = %s", (pemesanan_id,))
        existing_pay = cursor.fetchone()
        if existing_pay:
            cursor.execute(
                """
                UPDATE pembayaran 
                SET total_pembayaran = %s, status_pembayaran = 'menunggu_verifikasi', bukti_tf = %s, tanggal_pembayaran = CURRENT_TIMESTAMP()
                WHERE pemesanan_id = %s
                """,
                (booking["total_harga"], filename, pemesanan_id)
            )
        else:
            cursor.execute(
                """
                INSERT INTO pembayaran (pemesanan_id, total_pembayaran, status_pembayaran, bukti_tf)
                VALUES (%s, %s, 'menunggu_verifikasi', %s)
                """,
                (pemesanan_id, booking["total_harga"], filename)
            )
            
        # Update pemesanan_master status to 'menunggu_konfirmasi'
        cursor.execute(
            "UPDATE pemesanan_master SET status_pemesanan = 'menunggu_konfirmasi' WHERE pemesanan_id = %s",
            (pemesanan_id,)
        )
        
        conn.commit()
        return {"status": "success", "message": "Bukti pembayaran berhasil diunggah"}
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.get("/api/admin/bookings")
def get_admin_bookings(request: Request):
    get_admin_user(request)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT pm.pemesanan_id, pm.tanggal_checkin, pm.tanggal_checkout, pm.total_harga, pm.status_pemesanan, pm.created_at,
                   u.nama AS user_nama, p.nama_paket, t.nomor_tent,
                   pay.pembayaran_id, pay.bukti_tf, pay.status_pembayaran, pay.tanggal_pembayaran
            FROM pemesanan_master pm
            JOIN user u ON pm.user_id = u.user_id
            JOIN detail_pemesanan dp ON pm.pemesanan_id = dp.pemesanan_id
            JOIN tent t ON dp.tent_id = t.tent_id
            JOIN paket p ON t.paket_id = p.paket_id
            LEFT JOIN pembayaran pay ON pm.pemesanan_id = pay.pemesanan_id
            ORDER BY pm.pemesanan_id DESC
        """
        cursor.execute(query)
        bookings = cursor.fetchall()
        for b in bookings:
            b["tanggal_checkin"] = str(b["tanggal_checkin"])
            b["tanggal_checkout"] = str(b["tanggal_checkout"])
            b["created_at"] = str(b["created_at"])
            if b.get("tanggal_pembayaran") is not None:
                b["tanggal_pembayaran"] = str(b["tanggal_pembayaran"])
        return {"bookings": bookings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


class BookingStatusUpdateRequest(BaseModel):
    status: str


@app.post("/api/admin/bookings/{pemesanan_id}/status")
def update_booking_status(pemesanan_id: int, req: BookingStatusUpdateRequest, request: Request):
    get_admin_user(request)
    if req.status not in ["telah_dibayar", "dibatalkan", "menunggu_konfirmasi", "menunggu_pembayaran"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT status_pemesanan, total_harga FROM pemesanan_master WHERE pemesanan_id = %s", (pemesanan_id,))
        booking = cursor.fetchone()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        cursor.execute(
            "UPDATE pemesanan_master SET status_pemesanan = %s WHERE pemesanan_id = %s",
            (req.status, pemesanan_id)
        )
        
        pay_status = "diterima" if req.status == "telah_dibayar" else "ditolak" if req.status == "dibatalkan" else "menunggu_verifikasi"
        
        cursor.execute("SELECT pembayaran_id FROM pembayaran WHERE pemesanan_id = %s", (pemesanan_id,))
        existing_pay = cursor.fetchone()
        if existing_pay:
            cursor.execute(
                "UPDATE pembayaran SET status_pembayaran = %s WHERE pemesanan_id = %s",
                (pay_status, pemesanan_id)
            )
        else:
            if pay_status != "menunggu_verifikasi":
                cursor.execute(
                    """
                    INSERT INTO pembayaran (pemesanan_id, total_pembayaran, status_pembayaran, bukti_tf)
                    VALUES (%s, %s, %s, NULL)
                    """,
                    (pemesanan_id, booking["total_harga"], pay_status)
                )
                
        if req.status == "dibatalkan":
            cursor.execute("SELECT tent_id FROM detail_pemesanan WHERE pemesanan_id = %s", (pemesanan_id,))
            detail = cursor.fetchone()
            if detail:
                cursor.execute(
                    "UPDATE tent SET status = 'tersedia' WHERE tent_id = %s",
                    (detail["tent_id"],)
                )

        conn.commit()
        return {"status": "success", "message": f"Booking status updated to {req.status}"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


import asyncio

async def check_expired_bookings_loop():
    while True:
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute(
                """
                SELECT pemesanan_id FROM pemesanan_master 
                WHERE status_pemesanan IN ('menunggu_pembayaran', 'menunggu_konfirmasi')
                  AND expired_at < NOW()
                """
            )
            expired = cursor.fetchall()
            
            for b in expired:
                pid = b["pemesanan_id"]
                cursor.execute("SELECT tent_id FROM detail_pemesanan WHERE pemesanan_id = %s", (pid,))
                detail = cursor.fetchone()
                if detail:
                    cursor.execute(
                        "UPDATE tent SET status = 'tersedia' WHERE tent_id = %s",
                        (detail["tent_id"],)
                    )
                cursor.execute(
                    "UPDATE pemesanan_master SET status_pemesanan = 'expired' WHERE pemesanan_id = %s",
                    (pid,)
                )
                
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Error checking expired bookings: {e}")
        
        await asyncio.sleep(300) # Check every 5 minutes (300 seconds)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(check_expired_bookings_loop())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=6969, reload=True)