Backend Information Regarding Endpoints:

Full list of links:

POST - http://localhost:3000/startgame
GET - http://localhost:3000/sheriff
POST - http://localhost:3000/mafia
POST - http://localhost:3000/vote
POST - http://localhost:3000/endgame



Requested input & output:

- Startgame:

Input:

{
  "players": ["Player1", "Player2", "Player3", "Player4", "Player5", "Player6"]
}

Output:

{
  "message": "Game started successfully",
  "gameID": 2,
  "players": [
    {
      "username": "Player1",
      "role": "Mafia",
      "alive": true,
      "winner": false
    },
    {
      "username": "Player2",
      "role": "Sheriff",
      "alive": true,
      "winner": false
    },
    {
      "username": "Player3",
      "role": "Townspeople",
      "alive": true,
      "winner": false
    },
    {
      "username": "Player4",
      "role": "Townspeople",
      "alive": true,
      "winner": false
    },
    {
      "username": "Player5",
      "role": "Townspeople",
      "alive": true,
      "winner": false
    },
    {
      "username": "Player6",
      "role": "Townspeople",
      "alive": true,
      "winner": false
    }
  }
}

___

- Sheriff:
Input:
{
  "playerName": "Player2"
}

Output:

{
  "role": "Sheriff"
}

___

- Mafia:

Input:
{
  "playerName": "Player1"
}

Output:

{
  "message": "Player killed successfully",
  "killedPlayerName": "Player1"
}


___

- Vote:

Input:

{
  "votes": [
    {"voterName": "Player1", "votedPlayerName": "Player2"},
    {"voterName": "Player2", "votedPlayerName": "Player1"},
    {"voterName": "Player3", "votedPlayerName": "Player1"}
  ]
}

Output:

{
  "message": "Player killed successfully",
  "killedPlayerName": "Player1"
}


___

- Endgame:

Input:
{}

Output:
{
  "message": "Game ended successfully",
  "winners": ["Player2", "Player4"]
}

