from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List # Importation de List pour la compatibilité

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True

# Pour l'inscription (Token)
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    is_admin: bool

class UserLogin(BaseModel):
    username: str
    password: str

# Pour les Catégories
class CategoryBase(BaseModel):
    name: str
    description: str | None = None
    icon: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    channels_count: int = 0
    emissions_count: int = 0

    class Config:
        from_attributes = True

class ChannelCreate(BaseModel):
    name: str
    phone: str
    owner_name: str
    amount: str
    payment_method: str
    auth_word: str
    category_id: int | None = None
    region: str | None = None

class ChannelUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    category_id: int | None = None
    region: str | None = None

class ChannelResponse(BaseModel):
    id: int
    name: str
    phone: str
    owner_name: str
    amount: str
    payment_method: str
    owner_id: int
    category_id: int | None = None
    region: str | None = None
    last_broadcast_at: datetime | None = None

    class Config:
        from_attributes = True

# Pour les Émissions
class EmissionCreate(BaseModel):
    title: str
    description: str
    channel_id: int
    category_id: int | None = None
    audio_path: str | None = None
    stream_url: str | None = None
    image_url: str | None = None

class EmissionResponse(BaseModel):
    id: int
    title: str
    description: str
    is_live: bool
    creator_id: int
    channel_id: int | None = None
    category_id: int | None = None
    audio_path: str | None = None
    stream_url: str | None = None
    image_url: str | None = None
    channel_name: str | None = None

    class Config:
        from_attributes = True

# Pour les Tracks (Musiques)
class TrackResponse(BaseModel):
    id: int
    title: str
    file_path: str
    owner_id: int

    class Config:
        from_attributes = True

# Pour les Commentaires
class CommentCreate(BaseModel):
    content: str
    emission_id: int | None = None
    channel_id: int | None = None

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_id: int
    username: str
    emission_id: int | None = None
    channel_id: int | None = None

    class Config:
        from_attributes = True

# Planning d'Antenne
class BroadcastSlotBase(BaseModel):
    channel_id: int | None = None
    start_time: datetime
    end_time: datetime
    track_info: str | None = None

class BroadcastSlotCreate(BroadcastSlotBase):
    pass

class BroadcastSlotResponse(BroadcastSlotBase):
    id: int
    channel_name: str | None = None

    class Config:
        from_attributes = True

# LA LIGNE MAGIQUE : Force la reconstruction du modèle pour Python 3.14+
CommentResponse.model_rebuild()



