import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import QuestionTable from './QuestionTable';
import QuestionModal from './QuestionModal';

const AdminPage = () => {
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [missionIdFilter, setMissionIdFilter] = useState('misi-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  // Tentukan halaman aktif berdasarkan URL
  const isQuestionsPage = location.pathname === '/admin/questions';

  // Ambil daftar soal
  useEffect(() => {
    if (isQuestionsPage) {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:3001/api/questions/${missionIdFilter}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setQuestions(data);
          setError('');
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [missionIdFilter, isQuestionsPage]);

  // Tambah soal
  const handleAddQuestion = async (formData) => {
    try {
      const response = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Gagal menambah soal');
      const addedQuestion = await response.json();
      setQuestions([...questions, addedQuestion]);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit soal
  const handleEditQuestion = async (formData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/questions/${editQuestion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Gagal memperbarui soal');
      const updatedQuestion = await response.json();
      setQuestions(questions.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q)));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Hapus soal
  const handleDeleteQuestion = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/questions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Gagal menghapus soal');
      setQuestions(questions.filter((q) => q._id !== id));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-comic-sans">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full">
        {isQuestionsPage ? (
          <>
            <h2 className="text-3xl font-bold mb-6 text-blue-600">Kelola Soal</h2>
            <div className="mb-4 flex justify-between items-center max-w-4xl mx-auto">
              <div>
                <label className="mr-2">Pilih Misi:</label>
                <select
                  value={missionIdFilter}
                  onChange={(e) => setMissionIdFilter(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="misi-1">Misi 1</option>
                  <option value="misi-2">Misi 2</option>
                  <option value="misi-3">Misi 3</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setEditQuestion(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
              >
                Tambah Soal
              </button>
            </div>
            {error && <p className="text-red-600 mb-4 max-w-4xl mx-auto">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat...</p>
            ) : (
              <div className="max-w-4xl mx-auto">
                <QuestionTable
                  questions={questions}
                  onEdit={(question) => {
                    setEditQuestion(question);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteQuestion}
                />
              </div>
            )}
            <QuestionModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setEditQuestion(null);
              }}
              onSubmit={editQuestion ? handleEditQuestion : handleAddQuestion}
              question={editQuestion}
              isEdit={!!editQuestion}
            />
          </>
        ) : (
          <h2 className="text-3xl font-bold mb-6 text-blue-600">
            {location.pathname === '/admin/leaderboard' ? 'Kelola Leaderboard' : 'Kelola Feedback'}
          </h2>
        )}
      </div>
    </div>
  );
};

export default AdminPage;