use tauri::State;
use crate::db::{Database, Bookmark};

#[tauri::command]
pub fn list_bookmarks(db: State<Database>) -> Result<Vec<Bookmark>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, conversation_id, message_id, label, note, created_at FROM bookmarks ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                conversation_id: row.get(1)?,
                message_id: row.get(2)?,
                label: row.get(3)?,
                note: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut bookmarks = Vec::new();
    for row in rows {
        bookmarks.push(row.map_err(|e| e.to_string())?);
    }

    Ok(bookmarks)
}

#[tauri::command]
pub fn create_bookmark(db: State<Database>, bookmark: Bookmark) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO bookmarks (id, conversation_id, message_id, label, note, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            bookmark.id,
            bookmark.conversation_id,
            bookmark.message_id,
            bookmark.label,
            bookmark.note,
            bookmark.created_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_bookmark(db: State<Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM bookmarks WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
