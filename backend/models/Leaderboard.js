class Leaderboard {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  /**
   * Mengambil data leaderboard teratas berdasarkan total skor.
   * @returns {Promise<Array>} Array objek peringkat leaderboard.
   */
  async getTopLeaderboardEntries() {
    try {
      // SQL query to sum scores for each username and sort by total score descending
      const { rows } = await this.dbClient.query(
        `
        SELECT username, SUM(score) as totalScore
        FROM leaderboard
        GROUP BY username
        ORDER BY totalScore DESC
        LIMIT 10
        `
      );
      return rows;
    } catch (error) {
      console.error('Error in LeaderboardModel.getTopLeaderboardEntries:', error.stack);
      throw new Error('Failed to fetch leaderboard data');
    }
  }

  /**
   * Mengirimkan atau memperbarui skor ke leaderboard.
   * Jika entri sudah ada untuk username dan mission_id yang sama, skor akan ditambahkan.
   * Jika tidak, entri baru akan dibuat.
   * @param {string} userName - Nama pengguna.
   * @param {number} score - Skor yang akan ditambahkan/disimpan.
   * @param {string} missionId - ID misi.
   * @returns {Promise<Object>} Objek entri leaderboard yang diperbarui/baru dibuat.
   */
  async submitScore(userName, score, missionId) {
    try {
      // Check for existing entry for the user and mission
      const { rows } = await this.dbClient.query(
        'SELECT * FROM leaderboard WHERE username = $1 AND mission_id = $2',
        [userName, missionId]
      );

      let leaderboardEntry;
      if (rows.length > 0) {
        // Update existing entry by adding score
        const updatedScore = rows[0].score + score;
        const { rows: updatedRows } = await this.dbClient.query(
          `
          UPDATE leaderboard
          SET score = $1, created_at = CURRENT_TIMESTAMP -- Anda mungkin ingin update created_at atau menambahkan updated_at
          WHERE username = $2 AND mission_id = $3
          RETURNING *
          `,
          [updatedScore, userName, missionId]
        );
        leaderboardEntry = updatedRows[0];
      } else {
        // Insert new entry
        const { rows: insertedRows } = await this.dbClient.query(
          `
          INSERT INTO leaderboard (username, score, mission_id, created_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          RETURNING *
          `,
          [userName, score, missionId]
        );
        leaderboardEntry = insertedRows[0];
      }
      return leaderboardEntry;
    } catch (error) {
      console.error('Error in LeaderboardModel.submitScore:', error.stack);
      throw new Error('Failed to submit score to leaderboard');
    }
  }
}

module.exports = Leaderboard;