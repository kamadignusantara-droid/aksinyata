"""Photo storage kept in MongoDB (collection `file_blobs`).

Replaces the Emergent-managed object store so the app runs on any host
(Vercel, etc.) with only a MongoDB connection. Vercel limits request bodies
to ~4.5 MB, so uploads are capped at MAX_UPLOAD_BYTES.
"""
import os

from bson.binary import Binary

APP_NAME = os.environ.get("APP_NAME", "aksinyata")
MAX_UPLOAD_BYTES = 4 * 1024 * 1024


async def put_object(db, path: str, data: bytes, content_type: str) -> dict:
    await db.file_blobs.update_one(
        {"path": path},
        {"$set": {"path": path, "data": Binary(data), "content_type": content_type, "size": len(data)}},
        upsert=True,
    )
    return {"path": path, "size": len(data)}


async def get_object(db, path: str):
    doc = await db.file_blobs.find_one({"path": path})
    if not doc:
        return None, None
    return bytes(doc["data"]), doc.get("content_type", "application/octet-stream")
