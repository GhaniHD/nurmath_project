class Feedback {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  /**
   * Menyimpan feedback baru ke database.
   * @param {string} userId - ID pengguna yang memberikan feedback.
   * @param {string} feedbackText - Teks feedback.
   * @returns {Promise<Object>} Objek feedback yang baru dibuat.
   */
  async createFeedback(userId, feedbackText) {
    try {
      const { rows } = await this.dbClient.query(
        `
        INSERT INTO feedback (user_id, feedback_text, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        RETURNING *
        `,
        [userId, feedbackText]
      );
      return rows[0]; // Mengembalikan feedback yang baru disimpan
    } catch (error) {
      console.error('Error in FeedbackModel.createFeedback:', error.stack);
      throw new Error('Failed to submit feedback');
    }
  }

  // Anda bisa menambahkan method lain di sini, misalnya:
  // async getAllFeedback() { ... }
  // async getFeedbackById(id) { ... }
}

module.exports = Feedback;