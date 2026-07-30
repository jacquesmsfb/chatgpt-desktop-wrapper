use tauri::State;
use crate::db::{Database, Flashcard};

#[tauri::command]
pub fn list_flashcards(db: State<Database>) -> Result<Vec<Flashcard>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, conversation_id, question, answer, confidence, next_review, created_at FROM flashcards ORDER BY next_review ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Flashcard {
                id: row.get(0)?,
                conversation_id: row.get(1)?,
                question: row.get(2)?,
                answer: row.get(3)?,
                confidence: row.get(4)?,
                next_review: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut flashcards = Vec::new();
    for row in rows {
        flashcards.push(row.map_err(|e| e.to_string())?);
    }

    Ok(flashcards)
}

#[tauri::command]
pub fn create_flashcard(db: State<Database>, flashcard: Flashcard) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO flashcards (id, conversation_id, question, answer, confidence, next_review, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            flashcard.id,
            flashcard.conversation_id,
            flashcard.question,
            flashcard.answer,
            flashcard.confidence,
            flashcard.next_review,
            flashcard.created_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_flashcard(db: State<Database>, flashcard: Flashcard) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE flashcards SET confidence = ?1, next_review = ?2 WHERE id = ?3",
        rusqlite::params![flashcard.confidence, flashcard.next_review, flashcard.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
