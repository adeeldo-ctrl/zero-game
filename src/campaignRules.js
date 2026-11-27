export const CHANCES_PER_CAMPAIGN = 3;
export const HEARTS_PER_CHANCE = 3;

export function createCampaignLives() {
  return { chances: CHANCES_PER_CAMPAIGN, hearts: HEARTS_PER_CHANCE, gameOver: false };
}

export function loseCampaignHeart(state) {
  if (state.gameOver) return { ...state, chanceLost: false };
  const hearts = Math.max(0, state.hearts - 1);
  if (hearts > 0) return { chances: state.chances, hearts, gameOver: false, chanceLost: false };
  const chances = Math.max(0, state.chances - 1);
  return {
    chances,
    hearts: chances > 0 ? HEARTS_PER_CHANCE : 0,
    gameOver: chances === 0,
    chanceLost: true,
  };
}

export function getStageTransitionDirection(stageNumber) {
  // The player and new arena now rise into view after each five-second score window.
  const index = Math.max(0, Math.floor(Number(stageNumber) || 1) - 1);
  return ["up"][index % 1];
}
