from pathlib import Path
import sqlite3


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    db_path = project_root / "prisma" / "dev.db"
    migration_path = (
        project_root
        / "prisma"
        / "migrations"
        / "20260316184000_init"
        / "migration.sql"
    )

    db_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(db_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON;")
        connection.executescript(migration_path.read_text(encoding="utf-8"))
        connection.commit()

    print(f"Initialized SQLite database at {db_path}")


if __name__ == "__main__":
    main()
