from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import timedelta, datetime
import os
import shutil

import models
import schemas
import auth
from database import engine, get_db

# Crée les tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def create_admin():
    db = next(get_db())
    admin = db.query(models.User).filter(models.User.username == "LUKO").first()
    if not admin:
        hashed_pw = auth.hash_password("LUKO123")
        new_admin = models.User(
            username="LUKO",
            email="admin@luko.com",
            hashed_password=hashed_pw,
            is_admin=True
        )
        db.add(new_admin)
        db.commit()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}
        self.broadcasters: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, channel_id: int, is_broadcaster: bool = False):
        await websocket.accept()
        if is_broadcaster:
            # Si un diffuseur est déjà là, on ferme l'ancienne connexion (sécurité)
            if channel_id in self.broadcasters:
                try: await self.broadcasters[channel_id].close()
                except: pass
            self.broadcasters[channel_id] = websocket
            print(f"Broadcaster connecté à la chaîne {channel_id}")
        else:
            if channel_id not in self.active_connections:
                self.active_connections[channel_id] = []
            self.active_connections[channel_id].append(websocket)
            print(f"Auditeur connecté à la chaîne {channel_id}. Total: {len(self.active_connections[channel_id])}")

    def disconnect(self, websocket: WebSocket, channel_id: int):
        if channel_id in self.broadcasters and self.broadcasters[channel_id] == websocket:
            del self.broadcasters[channel_id]
            print(f"Broadcaster déconnecté de la chaîne {channel_id}")
        elif channel_id in self.active_connections:
            if websocket in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(websocket)
                print(f"Auditeur déconnecté de la chaîne {channel_id}")

    async def broadcast_audio(self, message: bytes, channel_id: int):
        if channel_id in self.active_connections:
            # On broadcast à tous les auditeurs
            for connection in self.active_connections[channel_id]:
                try:
                    await connection.send_bytes(message)
                except:
                    pass

    def get_listener_count(self, channel_id: int):
        return len(self.active_connections.get(channel_id, []))

manager = ConnectionManager()

@app.websocket("/ws/stream/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: int, role: str = "listener", db: Session = Depends(get_db)):
    is_broadcaster = (role == "broadcaster")
    
    await manager.connect(websocket, channel_id, is_broadcaster)
    try:
        while True:
            data = await websocket.receive_bytes()
            if is_broadcaster:
                # Seul le diffuseur envoie des données
                await manager.broadcast_audio(data, channel_id)
            else:
                # Les auditeurs ne devraient rien envoyer, on ignore
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel_id)
        if is_broadcaster:
            # Si le diffuseur coupe, on arrête le live proprement en base
            db.query(models.Emission).filter(
                models.Emission.channel_id == channel_id,
                models.Emission.is_live == True
            ).update({"is_live": False})
            db.commit()

@app.post("/api/emissions/{id}/stop")
def stop_emission(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    emission = db.query(models.Emission).filter(models.Emission.id == id).first()
    if not emission: raise HTTPException(status_code=404)
    # Vérifier que c'est bien le créateur ou un admin
    if emission.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403)
    emission.is_live = False
    db.commit()
    return {"status": "stopped"}

# AUTH
@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    hashed_pw = auth.hash_password(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=schemas.Token)
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username, "is_admin": user.is_admin}

# CATEGORIES
@app.get("/api/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.post("/api/categories", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403, detail="Réservé aux admins")
    new_cat = models.Category(**category.dict())
    db.add(new_cat); db.commit(); db.refresh(new_cat)
    return new_cat

@app.delete("/api/categories/{id}")
def delete_category(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    cat = db.query(models.Category).filter(models.Category.id == id).first()
    if cat: db.delete(cat); db.commit()
    return {"message": "OK"}

# CHANNELS
@app.post("/api/channels", response_model=schemas.ChannelResponse)
def create_channel(channel: schemas.ChannelCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if channel.auth_word != "qwerty237":
        raise HTTPException(status_code=400, detail="Mot d'authentification incorrect")
    new_channel = models.Channel(**channel.dict(exclude={"auth_word"}), owner_id=current_user.id, auth_word=channel.auth_word)
    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)
    return new_channel

@app.get("/api/channels", response_model=List[schemas.ChannelResponse])
def get_all_channels(category_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Channel)
    if category_id:
        query = query.filter(models.Channel.category_id == category_id)
    return query.all()

@app.get("/api/my-channels", response_model=List[schemas.ChannelResponse])
def get_my_channels(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Channel).filter(models.Channel.owner_id == current_user.id).all()

@app.get("/api/channels/{channel_id}", response_model=schemas.ChannelResponse)
def get_channel(channel_id: int, db: Session = Depends(get_db)):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel: raise HTTPException(status_code=404, detail="Non trouvé")
    return channel

@app.patch("/api/channels/{channel_id}", response_model=schemas.ChannelResponse)
def update_channel(channel_id: int, update: schemas.ChannelUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_channel = db.query(models.Channel).filter(models.Channel.id == channel_id, models.Channel.owner_id == current_user.id).first()
    if not db_channel: raise HTTPException(status_code=404)
    if update.name: db_channel.name = update.name
    if update.phone: db_channel.phone = update.phone
    if update.category_id: db_channel.category_id = update.category_id
    db.commit()
    db.refresh(db_channel)
    return db_channel

@app.get("/api/channels/{channel_id}/emissions", response_model=List[schemas.EmissionResponse])
def get_channel_emissions(channel_id: int, db: Session = Depends(get_db)):
    return db.query(models.Emission).filter(models.Emission.channel_id == channel_id).all()

@app.get("/api/channels/{channel_id}/history", response_model=List[schemas.EmissionResponse])
def get_channel_history(channel_id: int, db: Session = Depends(get_db)):
    return db.query(models.Emission).filter(models.Emission.channel_id == channel_id).order_by(models.Emission.id.desc()).all()

@app.get("/api/channels/{channel_id}/stats")
def get_channel_stats(channel_id: int, db: Session = Depends(get_db)):
    broadcasts = db.query(models.Emission).filter(models.Emission.channel_id == channel_id).count()
    followers = db.query(models.Follower).filter(models.Follower.channel_id == channel_id).count()
    listeners = manager.get_listener_count(channel_id)
    return {"broadcasts": broadcasts, "followers": followers, "listeners": listeners}

@app.post("/api/channels/{channel_id}/follow")
def follow_channel(channel_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Follower).filter(models.Follower.channel_id == channel_id, models.Follower.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Unfollowed"}
    db.add(models.Follower(user_id=current_user.id, channel_id=channel_id))
    db.commit()
    return {"message": "Followed"}

# FAVORITES
@app.post("/api/favorites/{channel_id}")
def toggle_favorite(channel_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Favorite).filter(models.Favorite.channel_id == channel_id, models.Favorite.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed"}
    db.add(models.Favorite(user_id=current_user.id, channel_id=channel_id))
    db.commit()
    return {"status": "added"}

@app.get("/api/favorites/me", response_model=List[schemas.ChannelResponse])
def get_my_favorites(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    return [f.channel for f in favs]

# LIBRARY (SAVED CONTENT)
@app.post("/api/library/{id}")
def toggle_save_content(id: int, type: str = "emission", db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if type == "emission":
        existing = db.query(models.SavedTrack).filter(models.SavedTrack.emission_id == id, models.SavedTrack.user_id == current_user.id).first()
        if existing:
            db.delete(existing); db.commit()
            return {"status": "removed"}
        db.add(models.SavedTrack(user_id=current_user.id, emission_id=id))
    else:
        existing = db.query(models.SavedTrack).filter(models.SavedTrack.track_id == id, models.SavedTrack.user_id == current_user.id).first()
        if existing:
            db.delete(existing); db.commit()
            return {"status": "removed"}
        db.add(models.SavedTrack(user_id=current_user.id, track_id=id))
    
    db.commit()
    return {"status": "added"}

@app.get("/api/library/me")
def get_my_library(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    saved = db.query(models.SavedTrack).filter(models.SavedTrack.user_id == current_user.id).all()
    results = []
    for s in saved:
        if s.emission:
            results.append({
                "id": s.emission.id,
                "title": s.emission.title,
                "description": s.emission.description,
                "type": "emission",
                "is_live": s.emission.is_live,
                "channel_id": s.emission.channel_id,
                "file_path": s.emission.audio_path
            })
        elif s.track:
            results.append({
                "id": s.track.id,
                "title": s.track.title,
                "type": "track",
                "file_path": s.track.file_path
            })
    return results

@app.get("/api/channels/{channel_id}/status")
def get_channel_live_status(channel_id: int, db: Session = Depends(get_db)):
    is_live = db.query(models.Emission).filter(models.Emission.channel_id == channel_id, models.Emission.is_live == True).first() is not None
    return {"is_live": is_live, "listeners": manager.get_listener_count(str(channel_id))}

@app.get("/api/search")
def search_global(q: str, db: Session = Depends(get_db)):
    if not q:
        return {"channels": [], "emissions": []}
    
    query = f"%{q}%"
    
    # Recherche dans les chaînes
    channels = db.query(models.Channel).filter(models.Channel.name.ilike(query)).all()
    
    # Recherche dans les émissions
    emissions = db.query(models.Emission).filter(models.Emission.title.ilike(query)).all()
    
    return {
        "channels": channels,
        "emissions": emissions
    }

# ADMIN
@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
def admin_get_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    return db.query(models.User).all()

@app.get("/api/admin/stats")
def admin_get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    
    # Statistiques totales
    total_users = db.query(models.User).count()
    total_channels = db.query(models.Channel).count()
    
    # Données pour les graphiques (30 derniers jours)
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    limit_date = datetime.now() - timedelta(days=30)
    
    # Groupement par date pour les utilisateurs
    user_data = db.query(
        func.date(models.User.created_at).label('date'),
        func.count(models.User.id).label('count')
    ).filter(models.User.created_at >= limit_date).group_by(func.date(models.User.created_at)).all()
    
    # Groupement par date pour les chaînes
    channel_data = db.query(
        func.date(models.Channel.created_at).label('date'),
        func.count(models.Channel.id).label('count')
    ).filter(models.Channel.created_at >= limit_date).group_by(func.date(models.Channel.created_at)).all()
    
    # Groupement par date pour les créateurs (utilisateurs ayant créé une chaîne ce jour là)
    creator_data = db.query(
        func.date(models.Channel.created_at).label('date'),
        func.count(func.distinct(models.Channel.owner_id)).label('count')
    ).filter(models.Channel.created_at >= limit_date).group_by(func.date(models.Channel.created_at)).all()

    # Formater les résultats pour le frontend
    history = {}
    for d in user_data:
        date_str = str(d.date)
        if date_str not in history: history[date_str] = {"date": date_str, "users": 0, "channels": 0, "creators": 0}
        history[date_str]["users"] = d.count
        
    for d in channel_data:
        date_str = str(d.date)
        if date_str not in history: history[date_str] = {"date": date_str, "users": 0, "channels": 0, "creators": 0}
        history[date_str]["channels"] = d.count

    for d in creator_data:
        date_str = str(d.date)
        if date_str not in history: history[date_str] = {"date": date_str, "users": 0, "channels": 0, "creators": 0}
        history[date_str]["creators"] = d.count

    chart_data = sorted(history.values(), key=lambda x: x["date"])
    
    return {
        "users": total_users, 
        "channels": total_channels,
        "chart_data": chart_data
    }

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    db.delete(user); db.commit()
    return {"message": "OK"}

@app.get("/api/admin/channels", response_model=List[schemas.ChannelResponse])
def admin_get_channels(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    return db.query(models.Channel).all()

@app.delete("/api/admin/channels/{channel_id}")
def admin_delete_channel(channel_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    db.delete(channel); db.commit()
    return {"message": "OK"}

@app.post("/api/admin/promote/{user_id}")
def admin_promote(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    user.is_admin = True; db.commit()
    return {"message": "OK"}

@app.post("/api/admin/demote/{user_id}")
def admin_demote(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    user.is_admin = False; db.commit()
    return {"message": "OK"}

@app.get("/api/admin/emissions", response_model=List[schemas.EmissionResponse])
def admin_get_emissions(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    return db.query(models.Emission).all()

@app.get("/api/admin/tracks", response_model=List[schemas.TrackResponse])
def admin_get_tracks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    return db.query(models.Track).all()

@app.delete("/api/admin/emissions/{id}")
def admin_delete_emission(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    em = db.query(models.Emission).filter(models.Emission.id == id).first()
    if not em: raise HTTPException(status_code=404)
    # Supprimer le fichier physique
    if em.audio_path and os.path.exists(em.audio_path):
        try: os.remove(em.audio_path)
        except: pass
    db.delete(em); db.commit()
    return {"message": "OK"}

@app.delete("/api/admin/categories/{id}/clear")
def admin_clear_category(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    # 1. Supprimer les fichiers des émissions liées directement à la catégorie
    emissions = db.query(models.Emission).filter(models.Emission.category_id == id).all()
    for em in emissions:
        if em.audio_path and os.path.exists(em.audio_path):
            try: os.remove(em.audio_path)
            except: pass
        db.delete(em)
    
    # 2. Supprimer les chaînes et leurs contenus
    channels = db.query(models.Channel).filter(models.Channel.category_id == id).all()
    for c in channels:
        # Émissions de la chaîne
        ch_emissions = db.query(models.Emission).filter(models.Emission.channel_id == c.id).all()
        for em in ch_emissions:
            if em.audio_path and os.path.exists(em.audio_path):
                try: os.remove(em.audio_path)
                except: pass
            db.delete(em)
        db.query(models.Comment).filter(models.Comment.channel_id == c.id).delete()
        db.query(models.Follower).filter(models.Follower.channel_id == c.id).delete()
        db.query(models.Favorite).filter(models.Favorite.channel_id == c.id).delete()
        db.delete(c)
        
    db.commit()
    return {"message": "Category content cleared"}

# PLANNING (ADMIN ONLY)
@app.get("/api/admin/planning", response_model=List[schemas.BroadcastSlotResponse])
def admin_get_planning(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    slots = db.query(models.BroadcastSlot).all()
    return [{
        "id": s.id,
        "channel_id": s.channel_id,
        "channel_name": s.channel.name if s.channel else "Inconnue",
        "start_time": s.start_time,
        "end_time": s.end_time,
        "track_info": s.track_info
    } for s in slots]

@app.post("/api/admin/planning", response_model=schemas.BroadcastSlotResponse)
def admin_add_slot(slot: schemas.BroadcastSlotCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    new_slot = models.BroadcastSlot(**slot.dict())
    db.add(new_slot); db.commit(); db.refresh(new_slot)
    return {
        "id": new_slot.id,
        "channel_id": new_slot.channel_id,
        "channel_name": new_slot.channel.name if new_slot.channel else "Inconnue",
        "start_time": new_slot.start_time,
        "end_time": new_slot.end_time,
        "track_info": new_slot.track_info
    }

@app.delete("/api/admin/planning/{id}")
def admin_delete_slot(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin: raise HTTPException(status_code=403)
    slot = db.query(models.BroadcastSlot).filter(models.BroadcastSlot.id == id).first()
    if slot: db.delete(slot); db.commit()
    return {"message": "OK"}

# PUBLIC PLANNING
@app.get("/api/planning", response_model=List[schemas.BroadcastSlotResponse])
def get_public_planning(db: Session = Depends(get_db)):
    slots = db.query(models.BroadcastSlot).order_by(models.BroadcastSlot.start_time.asc()).all()
    return [{
        "id": s.id,
        "channel_id": s.channel_id,
        "channel_name": s.channel.name if s.channel else "Inconnue",
        "start_time": s.start_time,
        "end_time": s.end_time,
        "track_info": s.track_info
    } for s in slots]

@app.get("/api/channels/{channel_id}/planning", response_model=List[schemas.BroadcastSlotResponse])
def get_channel_planning(channel_id: int, db: Session = Depends(get_db)):
    slots = db.query(models.BroadcastSlot).filter(models.BroadcastSlot.channel_id == channel_id).all()
    return [{
        "id": s.id,
        "channel_id": s.channel_id,
        "channel_name": s.channel.name if s.channel else "Inconnue",
        "start_time": s.start_time,
        "end_time": s.end_time,
        "track_info": s.track_info
    } for s in slots]

# EMISSIONS & UPLOAD
@app.get("/api/emissions", response_model=List[schemas.EmissionResponse])
def get_all_emissions(is_live: bool = None, category_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Emission)
    if is_live is not None:
        query = query.filter(models.Emission.is_live == is_live)
    if category_id:
        query = query.filter(models.Emission.category_id == category_id)
    return query.all()

@app.post("/api/emissions", response_model=schemas.EmissionResponse)
def create_emission(emission: schemas.EmissionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # 1. Vérification du PLANNING pour le LIVE
    is_live_now = True if not emission.audio_path else False
    
    if is_live_now:
        now = datetime.now()
        # On cherche si la chaîne a un créneau actif MAINTENANT
        slot = db.query(models.BroadcastSlot).filter(
            models.BroadcastSlot.channel_id == emission.channel_id,
            models.BroadcastSlot.start_time <= now,
            models.BroadcastSlot.end_time >= now
        ).first()
        
        if not slot and not current_user.is_admin:
            raise HTTPException(
                status_code=403, 
                detail="Vous n'avez pas de créneau d'antenne autorisé actuellement. Veuillez contacter l'administrateur."
            )

    # 2. Désactiver tous les anciens lives de cette chaîne
    db.query(models.Emission).filter(
        models.Emission.channel_id == emission.channel_id,
        models.Emission.is_live == True
    ).update({"is_live": False})

    # 3. Créer la nouvelle émission (en direct si pas d'archive, archivée sinon)
    new_em = models.Emission(
        **emission.dict(), 
        creator_id=current_user.id, 
        is_live=is_live_now
    )
    db.add(new_em)

    # Mettre à jour la date de dernière diffusion de la chaîne
    channel = db.query(models.Channel).filter(models.Channel.id == emission.channel_id).first()
    if channel:
        channel.last_broadcast_at = datetime.now()

    db.commit()
    db.refresh(new_em)
    return new_em

@app.post("/api/upload", response_model=schemas.TrackResponse)
async def upload_audio(title: str, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    ext = os.path.splitext(file.filename)[1]
    filename = f"user_{current_user.id}_{os.urandom(8).hex()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    new_t = models.Track(title=title, file_path=path, owner_id=current_user.id)
    db.add(new_t); db.commit(); db.refresh(new_t)
    return new_t

@app.get("/api/my-tracks", response_model=List[schemas.TrackResponse])
def get_my_tracks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Track).filter(models.Track.owner_id == current_user.id).all()

@app.delete("/api/tracks/{id}")
def delete_track(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    track = db.query(models.Track).filter(models.Track.id == id, models.Track.owner_id == current_user.id).first()
    if not track: raise HTTPException(status_code=404)
    if os.path.exists(track.file_path): os.remove(track.file_path)
    db.delete(track); db.commit()
    return {"message": "OK"}

# COMMENTS
@app.post("/api/comments", response_model=schemas.CommentResponse)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_c = models.Comment(
        content=comment.content, 
        user_id=current_user.id,
        emission_id=comment.emission_id,
        channel_id=comment.channel_id
    )
    db.add(new_c); db.commit(); db.refresh(new_c)
    return {
        "id": new_c.id, 
        "content": new_c.content, 
        "created_at": new_c.created_at, 
        "user_id": new_c.user_id, 
        "username": current_user.username,
        "emission_id": new_c.emission_id,
        "channel_id": new_c.channel_id
    }

@app.get("/api/comments", response_model=List[schemas.CommentResponse])
def get_comments(emission_id: int = None, channel_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Comment)
    if emission_id:
        query = query.filter(models.Comment.emission_id == emission_id)
    if channel_id:
        query = query.filter(models.Comment.channel_id == channel_id)
    
    comments = query.order_by(models.Comment.created_at.desc()).all()
    return [{
        "id": c.id, 
        "content": c.content, 
        "created_at": c.created_at, 
        "user_id": c.user_id, 
        "username": c.user.username,
        "emission_id": c.emission_id,
        "channel_id": c.channel_id
    } for c in comments]
