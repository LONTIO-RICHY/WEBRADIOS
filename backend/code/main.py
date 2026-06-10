from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Importé pour monter le dossier
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import os # Importé pour créer le dossier uploads
import shutil

import models
import schemas
import auth
from database import engine, get_db

# Crée les tables si elles n'existent pas
models.Base.metadata.create_all(bind=engine)

# 1. CRÉATION DE L'APPLICATION
app = FastAPI()


# 2. TON BLOC DE CODE (À PLACER EXACTEMENT ICI)
# Crée le dossier 'uploads' s'il n'existe pas
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Permet d'accéder aux fichiers audio via http://localhost:8000/uploads/...
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# 3. MIDDLEWARE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROUTE DE TEST & SERVICES ====================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_audio(self, message: bytes):
        for connection in self.active_connections:
            await connection.send_bytes(message)

manager = ConnectionManager()


@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_bytes()
            await manager.broadcast_audio(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ==================== ROUTES UTILISATEURS ====================

@app.post("/api/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")

    db_user_name = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user_name:
        raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris.")

    hashed_pw = auth.hash_password(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/login", response_model=schemas.Token)
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects.")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }


# ==================== ROUTES ÉMISSIONS & TRACKS ====================

@app.post("/api/emissions", response_model=schemas.EmissionResponse)
def create_emission(
    emission: schemas.EmissionCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_emission = models.Emission(
        title=emission.title,
        description=emission.description,
        is_live=True,
        creator_id=current_user.id
    )
    db.add(new_emission)
    db.commit()
    db.refresh(new_emission)
    return new_emission


@app.post("/api/upload", response_model=schemas.TrackResponse)
async def upload_audio(
    title: str,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Seuls les fichiers audio sont autorisés.")

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"user_{current_user.id}_{os.urandom(8).hex()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_track = models.Track(
        title=title,
        file_path=file_path,
        owner_id=current_user.id
    )
    db.add(new_track)
    db.commit()
    db.refresh(new_track)
    return new_track


@app.get("/api/my-tracks", response_model=list[schemas.TrackResponse])
def get_my_tracks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Track).filter(models.Track.owner_id == current_user.id).all()