use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub url: String,
    pub snippet: String,
    pub created_at: String,
    pub updated_at: String,
    pub message_count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Flashcard {
    pub id: String,
    pub conversation_id: String,
    pub question: String,
    pub answer: String,
    pub confidence: i32,
    pub next_review: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Bookmark {
    pub id: String,
    pub conversation_id: String,
    pub message_id: String,
    pub label: String,
    pub note: String,
    pub created_at: String,
}

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(path: &std::path::Path) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.run_migrations()?;
        Ok(db)
    }

    fn run_migrations(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '',
                url TEXT NOT NULL DEFAULT '',
                snippet TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                message_count INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
                content TEXT NOT NULL DEFAULT '',
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS flashcards (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                confidence INTEGER NOT NULL DEFAULT 0,
                next_review TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS bookmarks (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                message_id TEXT NOT NULL DEFAULT '',
                label TEXT NOT NULL DEFAULT '',
                note TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS folders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                parent_id TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
            CREATE INDEX IF NOT EXISTS idx_flashcards_conversation ON flashcards(conversation_id);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_conversation ON bookmarks(conversation_id);
            CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at);
            ",
        )?;

        Ok(())
    }
}

pub fn initialize(app: &AppHandle) -> Result<()> {
    let app_dir = app.path().app_data_dir().expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).ok();
    let db_path = app_dir.join("chatgpt-desktop.db");
    let db = Database::new(&db_path)?;
    app.manage(db);
    Ok(())
}
