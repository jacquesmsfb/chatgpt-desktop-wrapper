use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::Database;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub conversation_id: String,
    pub message_id: String,
    pub content: String,
    pub score: f64,
}

#[tauri::command]
pub fn search_conversations(
    db: State<Database>,
    query: String,
) -> Result<Vec<SearchResult>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let search_pattern = format!("%{}%", query);

    let mut stmt = conn
        .prepare(
            "SELECT m.conversation_id, m.id, m.content
             FROM messages m
             WHERE m.content LIKE ?1
             LIMIT 50",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![search_pattern], |row| {
            Ok(SearchResult {
                conversation_id: row.get(0)?,
                message_id: row.get(1)?,
                content: row.get(2)?,
                score: 1.0,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }

    Ok(results)
}
