from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    emissions = relationship("Emission", back_populates="creator")
    tracks = relationship("Track", back_populates="owner")
    comments = relationship("Comment", back_populates="user")
    channels = relationship("Channel", back_populates="owner")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255))
    icon = Column(String(50)) # Nom de l'icône boxicons

    channels = relationship("Channel", back_populates="category")
    emissions = relationship("Emission", back_populates="category")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    content = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emission_id = Column(Integer, ForeignKey("emissions.id"), nullable=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=True)
    
    user = relationship("User", back_populates="comments")
    emission = relationship("Emission", back_populates="comments")
    channel = relationship("Channel", back_populates="comments")

class Emission(Base):
    __tablename__ = "emissions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    is_live = Column(Boolean, default=False)
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="emissions")
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=True)
    channel = relationship("Channel", back_populates="emissions")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    audio_path = Column(String(255), nullable=True)
    stream_url = Column(String(500), nullable=True) # Nouveau : URL externe pour le stream
    image_url = Column(String(500), nullable=True)  # Nouveau : Miniature de l'émission
    category = relationship("Category", back_populates="emissions")
    comments = relationship("Comment", back_populates="emission")

class Track(Base):
    __tablename__ = "tracks"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    file_path = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tracks")

class Channel(Base):
    __tablename__ = "channels"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    owner_name = Column(String(100))
    amount = Column(String(50))
    payment_method = Column(String(100))
    auth_word = Column(String(100), default="qwerty237")
    owner_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    region = Column(String(100), nullable=True) # Nouveau : Région du Cameroun
    last_broadcast_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="channels")
    category = relationship("Category", back_populates="channels")
    emissions = relationship("Emission", back_populates="channel")
    followers = relationship("Follower", back_populates="channel")
    comments = relationship("Comment", back_populates="channel")

class Follower(Base):
    __tablename__ = "followers"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    channel_id = Column(Integer, ForeignKey("channels.id"))
    channel = relationship("Channel", back_populates="followers")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    channel_id = Column(Integer, ForeignKey("channels.id"))
    channel = relationship("Channel")

class SavedTrack(Base):
    __tablename__ = "saved_tracks"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=True)
    emission_id = Column(Integer, ForeignKey("emissions.id"), nullable=True)
    
    user = relationship("User")
    track = relationship("Track")
    emission = relationship("Emission")

class BroadcastSlot(Base):
    __tablename__ = "broadcast_slots"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    track_info = Column(String(255), nullable=True) # Nom de l'audio ou de l'émission prévue
    
    channel = relationship("Channel")
