const QuestionTable = ({ questions, onEdit, onDelete }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-4 border-b">ID Misi</th>
              <th className="py-2 px-4 border-b">Teks Soal</th>
              <th className="py-2 px-4 border-b">Pilihan</th>
              <th className="py-2 px-4 border-b">Jawaban Benar</th>
              <th className="py-2 px-4 border-b">Skor</th>
              <th className="py-2 px-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                  Tidak ada soal tersedia.
                </td>
              </tr>
            ) : (
              questions.map((question) => (
                <tr key={question._id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{question.missionId}</td>
                  <td className="py-2 px-4 border-b">{question.questionText}</td>
                  <td className="py-2 px-4 border-b">{question.options.join(', ')}</td>
                  <td className="py-2 px-4 border-b">{question.correctAnswer}</td>
                  <td className="py-2 px-4 border-b">{question.score}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => onEdit(question)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(question._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default QuestionTable;