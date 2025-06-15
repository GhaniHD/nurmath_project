class LeaderboardModel {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async submitScore(userId, username, score, missionId) {
    try {
      // Pastikan user_id dan username konsisten, tambahkan jika belum ada
      const checkUserQuery = `
        INSERT INTO users (id, username)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username
        RETURNING id
      `;
      const { rows } = await this.dbClient.query(checkUserQuery, [userId, username]);
      const confirmedUserId = rows[0].id;

      // Simpan atau update skor di leaderboard dengan penambahan
      const queryText = `
        INSERT INTO leaderboard (user_id, username, score, mission_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ON CONSTRAINT unique_user_mission
        DO UPDATE SET score = leaderboard.score + EXCLUDED.score,
                     username = EXCLUDED.username,
                     created_at = CURRENT_TIMESTAMP
        RETURNING id, user_id, username, score, mission_id, created_at
      `;

      const values = [confirmedUserId, username, score, missionId];
      const { rows: leaderboardRows } = await this.dbClient.query(queryText, values);
      console.log('Skor berhasil ditambahkan:', leaderboardRows[0]);
      return leaderboardRows[0];
    } catch (err) {
      console.error('Error submitScore:', err.stack);
      throw err;
    }
  }

  async getTopLeaderboardEntries() {
    try {
      const queryText = `
        SELECT user_id, username, SUM(score) as total_score, mission_id, MAX(created_at) as last_updated
        FROM leaderboard
        GROUP BY user_id, username, mission_id
        ORDER BY total_score DESC
        LIMIT 100
      `;
      const { rows } = await this.dbClient.query(queryText);
      return rows;
    } catch (err) {
      console.error('Error getTopLeaderboardEntries:', err.stack);
      throw err;
    }
  }
}

module.exports = LeaderboardModel;