use tauri::State;
use crate::db::{Database, Conversation};

#[tauri::command]
pub fn list_conversations(db: State<Database>) -> Result<Vec<Conversation>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title, url, snippet, created_at, updated_at, message_count FROM conversations ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Conversation {
                id: row.get(0)?,
                title: row.get(1)?,
                url: row.get(2)?,
                snippet: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                message_count: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut conversations = Vec::new();
    for row in rows {
        conversations.push(row.map_err(|e| e.to_string())?);
    }

    Ok(conversations)
}

#[tauri::command]
pub fn save_conversation(
    db: State<Database>,
    conversation: Conversation,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO conversations (id, title, url, snippet, created_at, updated_at, message_count)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            snippet = excluded.snippet,
            updated_at = excluded.updated_at,
            message_count = excluded.message_count",
        rusqlite::params![
            conversation.id,
            conversation.title,
            conversation.url,
            conversation.snippet,
            conversation.created_at,
            conversation.updated_at,
            conversation.message_count,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_conversation(db: State<Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM conversations WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
