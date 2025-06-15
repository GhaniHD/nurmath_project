import { useState } from 'react';
import axios from 'axios';

const NameModal = ({ isOpen, onSubmit }) => {
  const [userName, setUserName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!userName.trim()) {
      alert('Please enter your name!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/users', {
        userName,
      });

      const { userId, userName: returnedName } = response.data;
      onSubmit({ userId, userName: returnedName });
    } catch (err) {
      console.error('Error submitting name:', err);
      alert('Failed to create user');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">Enter Your Name</h2>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Your name..."
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-300"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameModal;
