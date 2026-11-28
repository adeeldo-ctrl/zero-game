import test from "node:test";
import assert from "node:assert/strict";
import {
  createCampaignLives,
  loseCampaignHeart,
  STARTING_CAMPAIGN_TOKENS,
  normalizeCampaignTokens,
  spendCampaignToken,
  getTokensEarnedForScore,
} from "../src/campaignRules.js";

test("one campaign token starts three chances with three hearts each", () => {
  assert.equal(STARTING_CAMPAIGN_TOKENS, 3);
  assert.deepEqual(createCampaignLives(), { chances: 3, hearts: 3, gameOver: false });
});

test("losing the third heart consumes one chance and restores three hearts", () => {
  const result = loseCampaignHeart({ chances: 3, hearts: 1, gameOver: false });
  assert.deepEqual(result, { chances: 2, hearts: 3, gameOver: false, chanceLost: true });
});

test("token balances are normalized safely", () => {
  assert.equal(normalizeCampaignTokens(null), 3);
  assert.equal(normalizeCampaignTokens("4.8"), 4);
  assert.equal(normalizeCampaignTokens(-2), 0);
  assert.equal(normalizeCampaignTokens("invalid", 2), 2);
});

test("continuing spends exactly one token and cannot create a negative balance", () => {
  assert.deepEqual(spendCampaignToken(2), { tokens: 1, spent: true });
  assert.deepEqual(spendCampaignToken(1), { tokens: 0, spent: true });
  assert.deepEqual(spendCampaignToken(0), { tokens: 0, spent: false });
});

test("each crossed 10000 score threshold awards one token", () => {
  assert.equal(getTokensEarnedForScore(0, 9999), 0);
  assert.equal(getTokensEarnedForScore(9500, 10000), 1);
  assert.equal(getTokensEarnedForScore(5000, 25000), 2);
  assert.equal(getTokensEarnedForScore(25000, 15000), 0);
});
