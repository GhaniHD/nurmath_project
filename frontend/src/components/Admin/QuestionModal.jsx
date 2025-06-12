import React, { useState } from 'react';

const QuestionModal = ({ isOpen, onClose, onSubmit, question, isEdit }) => {
    const [formData, setFormData] = useState({
      missionId: question?.missionId || 'misi-1',
      questionText: question?.questionText || '',
      options: question?.options || ['', '', '', ''],
      correctAnswer: question?.correctAnswer || '',
      score: question?.score || 0,
    });
    const [error, setError] = useState('');
  
    if (!isOpen) return null;
  
    const handleSubmit = () => {
      if (
        !formData.questionText ||
        formData.options.some((opt) => !opt) ||
        !formData.correctAnswer ||
        !formData.score
      ) {
        setError('Semua field harus diisi!');
        return;
      }
      if (!formData.options.includes(formData.correctAnswer)) {
        setError('Jawaban benar harus salah satu dari pilihan!');
        return;
      }
      onSubmit(formData);
      setError('');
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">
            {isEdit ? 'Edit Soal' : 'Tambah Soal Baru'}
          </h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <select
            value={formData.missionId}
            onChange={(e) => setFormData({ ...formData, missionId: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="misi-1">Misi 1</option>
            <option value="misi-2">Misi 2</option>
            <option value="misi-3">Misi 3</option>
          </select>
          <input
            type="text"
            placeholder="Teks Soal"
            value={formData.questionText}
            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          {formData.options.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Pilihan ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...formData.options];
                newOptions[index] = e.target.value;
                setFormData({ ...formData, options: newOptions });
              }}
              className="w-full p-2 border rounded mb-2"
            />
          ))}
          <input
            type="text"
            placeholder="Jawaban Benar"
            value={formData.correctAnswer}
            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="number"
            placeholder="Skor"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded mb-2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            >
              {isEdit ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default QuestionModal;