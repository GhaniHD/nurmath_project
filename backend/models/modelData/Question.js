class Question {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  /**
   * Mengambil semua pertanyaan untuk missionId tertentu.
   * @param {string} missionId - ID misi.
   * @returns {Promise<Array>} Array objek pertanyaan.
   */
  async getQuestionsByMissionId(missionId) {
    try {
      const { rows } = await this.dbClient.query(
        'SELECT * FROM questions WHERE mission_id = $1',
        [missionId]
      );
      return rows;
    } catch (error) {
      console.error(`Error in QuestionModel.getQuestionsByMissionId for missionId ${missionId}:`, error.stack);
      throw new Error('Failed to fetch questions by mission ID');
    }
  }

  /**
   * Mengambil satu pertanyaan berdasarkan ID-nya.
   * @param {string} id - ID pertanyaan.
   * @returns {Promise<Object|null>} Objek pertanyaan atau null jika tidak ditemukan.
   */
  async getQuestionById(id) {
    try {
      const { rows } = await this.dbClient.query(
        'SELECT * FROM questions WHERE id = $1',
        [id]
      );
      return rows[0] || null; // Mengembalikan baris pertama atau null jika tidak ada
    } catch (error) {
      console.error(`Error in QuestionModel.getQuestionById for id ${id}:`, error.stack);
      throw new Error('Failed to fetch question by ID');
    }
  }

  // Anda bisa menambahkan method lain di sini, misalnya:
  // async createQuestion(questionData) { ... }
  // async updateQuestion(id, questionData) { ... }
  // async deleteQuestion(id) { ... }
}

module.exports = Question;