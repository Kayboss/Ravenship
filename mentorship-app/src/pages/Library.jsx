import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import { useParams } from "react-router-dom";
import { SidebarByRole } from "../components/layout/SidebarByRole.jsx";
import { TopBar } from "../components/layout/TopBar.jsx";
import { getStoredUser, onAuthReady } from "../firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getBooks, addBook, deleteBook } from "../firebase/db";
import { uploadBookFile, downloadFromUrl } from "../lib/upload";

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0 ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.xl};
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${(props) => props.theme.spacing.lg};
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    margin-left: 0;
    padding: ${(props) => props.theme.spacing.sm};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  flex-wrap: wrap;
  gap: 12px;
`;

const HeaderTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.heading2};
  font-family: ${(props) => props.theme.typography.fontFamilyHeading};
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
`;

const UploadToggle = styled.button`
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  background: ${(props) => props.theme.colors.primaryContainer};
  color: white;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; }
`;

const UploadForm = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 24px;
  padding: 24px;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const FormTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 16px;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const FileInput = styled.input`
  margin-bottom: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
  font-family: inherit;
`;

const SubmitBtn = styled.button`
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  background: ${(props) => props.theme.colors.primaryContainer};
  color: white;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const BookCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.outline};
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const BookCover = styled.div`
  height: 200px;
  background: ${(p) => p.$img ? `url(${p.$img})` : `linear-gradient(135deg, ${p.theme.colors.primary}20, ${p.theme.colors.secondary}20)`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`;

const BookBody = styled.div`
  padding: 20px;
`;

const BookTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const BookAuthor = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const BookDesc = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BookMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const FileSize = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 600;
`;

const DownloadBtn = styled.button`
  padding: 8px 20px;
  border-radius: 50px;
  border: none;
  background: ${(props) => props.theme.colors.primary}15;
  color: ${(props) => props.theme.colors.primary};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${(props) => props.theme.colors.primary}; color: white; }
`;

const DeleteBtn = styled.button`
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid ${(props) => props.theme.colors.error};
  background: transparent;
  color: ${(props) => props.theme.colors.error};
  font-family: inherit;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${(props) => props.theme.colors.error}; color: white; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: ${(props) => props.theme.colors.textSecondary};
  grid-column: 1 / -1;
`;

const Msg = styled.p`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => p.$error ? p.theme.colors.error : "#2e7d32"};
  margin-top: 8px;
`;

export const Library = () => {
  const { role } = useParams();
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";
  const [authReady, setAuthReady] = useState(false);
  const [books, setBooks] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: "", author: "", description: "", file: null });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { onAuthReady(() => setAuthReady(true)); }, []);

  useEffect(() => {
    if (!authReady) return;
    AOS.init({ duration: 800, once: true, offset: 50 });
    loadBooks();
  }, [authReady]);

  const loadBooks = async () => {
    const data = await getBooks().catch(() => []);
    setBooks(data);
  };

  const handleUpload = async () => {
    if (!form.title || !form.file) { setMsg({ text: "Title and file are required", error: true }); return; }
    setUploading(true);
    setMsg(null);
    try {
      const bookId = await addBook({
        title: form.title,
        author: form.author || "Unknown",
        description: form.description || "",
        fileName: form.file.name,
        fileSize: form.file.size,
        fileType: form.file.type,
      });
      const fileUrl = await uploadBookFile(form.file, bookId);
      await updateDoc(doc(db, "library", bookId), { fileUrl });
      setForm({ title: "", author: "", description: "", file: null });
      setShowUpload(false);
      setMsg({ text: "Book uploaded successfully!", error: false });
      loadBooks();
    } catch (e) {
      setMsg({ text: e.message || "Upload failed", error: true });
    }
    setUploading(false);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await deleteBook(id).catch(() => {});
    loadBooks();
  };

  const handleDownload = (book) => {
    if (!book.fileUrl) { setMsg({ text: "No file available for download", error: true }); return; }
    downloadFromUrl(book.fileUrl, book.fileName || `${book.title}.pdf`);
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const q = searchTerm.toLowerCase();
  const filtered = books.filter(b =>
    (b.title || "").toLowerCase().includes(q) ||
    (b.author || "").toLowerCase().includes(q)
  );

  return (
    <Page>
      <SidebarByRole />
      <Main>
        <TopBar searchPlaceholder="Search books..." onSearch={setSearchTerm} />
        <Header data-aos="fade-down">
          <HeaderTitle>📚 Library</HeaderTitle>
          {isAdmin && (
            <UploadToggle onClick={() => setShowUpload(!showUpload)}>
              {showUpload ? "Cancel" : "+ Upload Book"}
            </UploadToggle>
          )}
        </Header>
        {msg && <Msg $error={msg.error}>{msg.text}</Msg>}
        {isAdmin && showUpload && (
          <UploadForm data-aos="fade-up">
            <FormTitle>Upload a Book</FormTitle>
            <FormRow>
              <Input placeholder="Book title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </FormRow>
            <TextArea placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FileInput type="file" accept=".pdf,.epub,.mobi,.doc,.docx" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
            {form.file && <p style={{ fontSize: "0.8rem", color: "#594048", marginBottom: 8 }}>{form.file.name} ({formatSize(form.file.size)})</p>}
            <SubmitBtn disabled={uploading} onClick={handleUpload}>
              {uploading ? "Uploading..." : "Upload"}
            </SubmitBtn>
          </UploadForm>
        )}
        <BooksGrid>
          {filtered.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>📖</div>
              <p style={{ fontWeight: 600 }}>{searchTerm ? "No books match your search." : "Library is empty."}</p>
              {isAdmin && !searchTerm && <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Click "+ Upload Book" to add the first book.</p>}
            </EmptyState>
          ) : filtered.map((book, i) => (
            <BookCard key={book.id} data-aos="fade-up" data-aos-delay={i * 80}>
              <BookCover $img={book.coverUrl || undefined}>
                {!book.coverUrl && "📕"}
              </BookCover>
              <BookBody>
                <BookTitle>{book.title}</BookTitle>
                <BookAuthor>by {book.author || "Unknown"}</BookAuthor>
                {book.description && <BookDesc>{book.description}</BookDesc>}
                <BookMeta>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileSize>{formatSize(book.fileSize)}</FileSize>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <DownloadBtn onClick={() => handleDownload(book)}>Download</DownloadBtn>
                    {isAdmin && <DeleteBtn onClick={() => handleDelete(book.id, book.title)}>Delete</DeleteBtn>}
                  </div>
                </BookMeta>
              </BookBody>
            </BookCard>
          ))}
        </BooksGrid>
      </Main>
    </Page>
  );
};
