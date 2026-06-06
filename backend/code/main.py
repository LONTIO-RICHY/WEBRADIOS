from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import auth  # Assure-toi que c'est importé
from datetime import timedelta

import models
import schemas
import auth
from database import engine, get_db

# Crée les tables si elles n'existent pas
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTE D'INSCRIPTION
@app.post("/api/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Vérifier si l'email existe déjà
    db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")

    # 2. Vérifier si le nom d'utilisateur existe déjà
    db_user_name = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user_name:
        raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris.")

    # 3. Hasher le mot de passe
    hashed_pw = auth.hash_password(user.password)

    # 4. Créer l'utilisateur en base de données
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Récupère l'ID généré par MySQL

    return new_user


# ... (le reste de ton code main.py) ...

# ROUTE DE CONNEXION (LOGIN)
@app.post("/api/login", response_model=schemas.Token)
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Chercher l'utilisateur par son username
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    
    # 2. Si l'utilisateur n'existe pas
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )

    # 3. Vérifier si le mot de passe est correct
    if not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )

    # 4. Générer le Token d'accès
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # 5. Renvoyer le token au frontend
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }



# Ajoute l'import de auth si ce n'est pas fait
import auth

# ... (le reste de ton code) ...

# ROUTE POUR CRÉER UNE ÉMISSION (Sécurisée !)
@app.post("/api/emissions", response_model=schemas.EmissionResponse)
def create_emission(
    emission: schemas.EmissionCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Sécurité active !
):
    # Créer l'émission liée à l'utilisateur connecté
    new_emission = models.Emission(
        title=emission.title,
        description=emission.description,
        is_live=True, # On la passe directement en Live
        creator_id=current_user.id
    )
    db.add(new_emission)
    db.commit()
    db.refresh(new_emission)
    return new_emission

# ROUTE POUR VOIR TOUS LES LIVES EN COURS (Public)
@app.get("/api/emissions/live", response_model=list[schemas.EmissionResponse])
def get_live_emissions(db: Session = Depends(get_db)):
    return db.query(models.Emission).filter(models.Emission.is_live == True).all()


from fastapi import WebSocket, WebSocketDisconnect
from typing import List

# 1. Le gestionnaire qui garde en mémoire qui est connecté
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_audio(self, message: bytes):
        # Envoie les données binaires (le son) à tout le monde
        for connection in self.active_connections:
            await connection.send_bytes(message)

manager = ConnectionManager()

# 2. La route WebSocket pour le flux audio
@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # On reçoit les morceaux de son (chunks) de l'animateur
            data = await websocket.receive_bytes()
            # On les renvoie immédiatement à tous les auditeurs
            await manager.broadcast_audio(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

