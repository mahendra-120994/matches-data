const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const snakeToCamel = require("./snakeToCamel");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.massage}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// GET States API 1
app.get("/players/", async (req, res) => {
  const getStatesQuery = `
    SELECT
    *
    FROM
    player_details
    `;
  const statesArray = await db.all(getStatesQuery);

  const states = statesArray.map((eachState) => {
    return snakeToCamel(eachState);
  });
  res.send(states);
});

// GET State by ID API 2
app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const playerData = await db.get(getPlayerQuery);

  const player = snakeToCamel(playerData);

  res.send(player);
});

// Update Player API 3
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const { playerName } = req.body;
  const updatePlayerDetails = `
    UPDATE
    player_details
    SET
    player_name = '${playerName}'
    `;
  await db.run(updatePlayerDetails);
  res.send("Player Details Updated");
});

// GET Match by ID API 4
app.get("/matches/:matchId/", async (req, res) => {
  const { matchId } = req.params;
  const getMatchQuery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const matchData = await db.get(getMatchQuery);

  const match = snakeToCamel(matchData);

  res.send(match);
});

// GET Matches by Player ID API 5
app.get("/players/:playerId/matches", async (req, res) => {
  const { playerId } = req.params;
  const getMatchesQuery = `
  SELECT
  T.match_id as matchId,
  match_details.match,
  match_details.year
  FROM ( player_details
  JOIN player_match_score ON player_details.player_id = player_match_score.player_id ) as T
  JOIN match_details ON match_details.match_id = T.match_id
  WHERE T.player_id = ${playerId};`;
  const matchesData = await db.all(getMatchesQuery);

  const matches = Object.values(matchesData);

  res.send(matches);
});

// GET Players by Match ID API 6
app.get("/matches/:matchId/players", async (req, res) => {
  const { matchId } = req.params;
  const getPlyersQuery = `
  SELECT
  T.player_id as playerId,
  T.player_name as playerName
  FROM ( player_details
  JOIN player_match_score ON player_details.player_id = player_match_score.player_id ) as T
  JOIN match_details ON match_details.match_id = T.match_id
  WHERE match_details.match_id = ${matchId};`;
  const playersData = await db.all(getPlyersQuery);

  const players = Object.values(playersData);

  res.send(players);
});

// GET Players Score by Player ID API 7
app.get("/players/:playerId/playerScores", async (req, res) => {
  const { playerId } = req.params;
  const getScoreQuery = `
  SELECT
  T.player_id as playerId,
  T.player_name as playerName,
  sum(T.score) as totalScore,
  sum(T.fours) as totalFours,
  sum(T.sixes) as totalSixes
  FROM ( player_details
  JOIN player_match_score ON player_details.player_id = player_match_score.player_id ) as T
  WHERE player_details.player_id = ${playerId};`;
  const scoreData = await db.all(getScoreQuery);

  const score = Object.values(scoreData);

  res.send(score);
});

module.exports = app;
