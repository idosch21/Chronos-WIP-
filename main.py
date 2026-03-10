from pydantic import BaseModel
from fastapi import FastAPI
from sqlalchemy import create_engine,Column,Integer,String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime,time 
from sqlalchemy import DateTime

DATABASE_URL = "sqlite:///./tracker.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Activity(BaseModel):
    url:str
    domain:str
    timestamp:datetime = None
    time_spent : float = 0.0
    
    class Config:
        from_attributes = True
    
class DBActivity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String)
    domain = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)
    
    
engine = create_engine("sqlite:///./tracker.db")
    
    
    
app = FastAPI()

app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"], # Allows the extension to talk to the server
   allow_methods=["*"],
   allow_headers=["*"],
)
 
 
@app.post("/log")
def root(data:Activity):
    db = SessionLocal()
    new_entry = DBActivity(url=data.url, domain=data.domain)
    
    domain_name = "IDLE" if data.url =="IDLE"else data.domain
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    db.close()
    
    print(f"saved to DB: {data.domain}")
    return {"status":"saved","time": new_entry.timestamp}


@app.get("/history")
def get_history():
    db = SessionLocal()
    
    history = db.query(DBActivity).order_by(DBActivity.timestamp).all()
    db.close()
    
    return calculate_summary_from_history(history) 


def format_time(total_seconds):
    total_seconds = int(total_seconds)
    hours = total_seconds //3600
    
    remaining_seconds = total_seconds % 3600
    minutes = remaining_seconds // 60
    
    seconds = remaining_seconds %60
        
    return f"{hours}h {minutes}m {seconds}s"

@app.get("/summary/today")
def get_today_data():
    db = SessionLocal()
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    today_data = db.query(DBActivity).filter(DBActivity.timestamp >=today_start).order_by(DBActivity.timestamp).all()
    db.close()
    return calculate_summary_from_history(today_data)
    


def calculate_summary_from_history(history):
    raw_summary = {}
    
    for i in range(len(history)):
        domain = history[i].domain
        ignored_domains = ["127.0.0.1", "newtab", "extensions"]
        if domain == "IDLE" or domain in ignored_domains or domain == "":
            continue
            
        if i < len(history) - 1:
            duration = history[i+1].timestamp - history[i].timestamp
        else:
            duration = datetime.utcnow() - history[i].timestamp

        seconds = duration.total_seconds()
        
        if domain not in raw_summary:
            raw_summary[domain] = 0.0
        raw_summary[domain] += seconds

    # Format the results
    display_summary = {}
    for domain,seconds in raw_summary.items():
        display_summary[domain] = format_time(seconds)

    return display_summary