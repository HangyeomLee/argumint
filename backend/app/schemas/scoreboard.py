from pydantic import BaseModel

class ScoreboardRead(BaseModel):
    pro_score: int
    con_score: int
    pro_count: int
    con_count: int
