from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime
    total_score: int
    
    # Email is inherited from UserBase, let's redefine UserRead without it for general privacy
    # Only the owner or admin should see emails.
    username: str
    email: Optional[EmailStr] = None # Make it optional and default to None
