from main import SessionLocal, DBActivity
from sqlalchemy import or_

def surgical_cleanup():
    db = SessionLocal()
    
    # Add anything here you want to GONE from the database forever
    junk_to_delete = [
        "%chrome-extension://%",  # Catches all extension IDs
        "%file:///%",              # Catches all local files
        "newtab",
        "IDLE",
        "System/New Tab",
        "None",
        ""
    ]

    print("Starting surgical cleanup...")

    try:
        # Construct a combined filter: delete if domain matches ANY of the junk list
        # We use .like() with % so it acts as a wildcard search
        conditions = [DBActivity.domain.like(item) for item in junk_to_delete]
        
        query = db.query(DBActivity).filter(or_(*conditions))
        count = query.count()
        
        if count > 0:
            query.delete(synchronize_session=False)
            db.commit()
            print(f"✅ Success! Surgically removed {count} rows.")
        else:
            print("✨ Database is already clean. Nothing to delete.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during cleanup: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    surgical_cleanup()