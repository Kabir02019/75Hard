// There is no login system in this app. Each of the 3 players is defined
// entirely by environment variables (PERSON1_*, PERSON2_*, PERSON3_*), and
// their "account" is just their private check-in URL token.

export type PlayerConfig = {
  playerId: string;
  name: string;
  token: string;
  phoneNumber: string;
  callMeBotApiKey: string;
};

const PLAYER_COUNT = 3;

export function getAllPlayers(): PlayerConfig[] {
  const players: PlayerConfig[] = [];

  for (let playerNumber = 1; playerNumber <= PLAYER_COUNT; playerNumber = playerNumber + 1) {
    const name = process.env["PERSON" + playerNumber + "_NAME"];
    const token = process.env["PERSON" + playerNumber + "_TOKEN"];
    const phoneNumber = process.env["PERSON" + playerNumber + "_PHONE"];
    const callMeBotApiKey = process.env["PERSON" + playerNumber + "_CALLMEBOT_APIKEY"];

    const nameIsSet = name !== undefined && name.length > 0;
    const tokenIsSet = token !== undefined && token.length > 0;

    if (nameIsSet && tokenIsSet) {
      const player: PlayerConfig = {
        playerId: "player" + playerNumber,
        name: name as string,
        token: token as string,
        phoneNumber: phoneNumber === undefined ? "" : phoneNumber,
        callMeBotApiKey: callMeBotApiKey === undefined ? "" : callMeBotApiKey,
      };
      players.push(player);
    }
  }

  return players;
}

export function getPlayerByToken(token: string): PlayerConfig | null {
  const allPlayers = getAllPlayers();

  for (let index = 0; index < allPlayers.length; index = index + 1) {
    if (allPlayers[index].token === token) {
      return allPlayers[index];
    }
  }

  return null;
}
