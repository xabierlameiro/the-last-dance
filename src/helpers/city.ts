/**
 * Shared validation for the city values that /api/weather and /api/news accept.
 *
 * Kept in one place because the two routes take the same values from the same UI:
 * they drifted apart once before, and a rule tightened in one route but not the
 * other means a city that renders weather but silently fails to load its news.
 */

// '+' is allowed because the UI sends "city+region" pairs, e.g. "limerick+ireland".
const CITY_NAME = /^[a-zA-ZÀ-ÿ\s+-]+$/;

const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

export const isValidCityName = (city: string): boolean =>
    city.length >= MIN_LENGTH && city.length <= MAX_LENGTH && CITY_NAME.test(city);
