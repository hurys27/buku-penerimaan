import { useEffect, useState } from "react";

export default function ManageBook() {
  const [title, setTitle] = useState("");
  const [currentFile, setCurrentFile] = useState("");

  useEffect(() => {
    fetch("/book-settings.json")
      .then((r) => r.json())
      .then((json) => {
        setTitle(json.title || "");
        setCurrentFile(json.file || "");
      })
      .catch(() => {});
  }, []);

  const submitBook = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const res = await fetch("/api/admin/book", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (json.success) {
      alert("Book updated!");
      window.location.reload();
    } else {
      alert("Failed to save");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Book Settings</h2>

      {currentFile && (
        <p>
          Current Book:{" "}
          <a href={`/books/${currentFile}`} target="_blank">
            {currentFile}
          </a>
        </p>
      )}

      <form onSubmit={submitBook}>
        <p>
          Book Title:<br />
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </p>

        <p>
          Upload New File (PDF):<br />
          <input type="file" name="file" accept="application/pdf" />
        </p>

        <button type="submit">Save Book</button>
      </form>
    </div>
  );
}
