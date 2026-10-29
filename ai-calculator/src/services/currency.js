const API_BASE = import.meta.env.VITE_API_BASE || "";

function networkError(error) {
  if (error.name === "AbortError") return error;
  if (error instanceof TypeError) {
    return new Error("Currency API is unreachable. Start the app with `npm run dev` from the project folder and check your internet connection.");
  }
  return error;
}

async function readJson(response) {
  try { return await response.json(); }
  catch {
    throw new Error("The currency API did not return JSON. Start the app with `npm run dev` from the project folder, then reload the page.");
  }
}

export async function fetchCurrencies(signal) {
  let response;
  try { response = await fetch(`${API_BASE}/api/currencies`, { signal }); }
  catch (error) { throw networkError(error); }
  const data = await readJson(response);
  if (!response.ok) throw new Error(data.error || "Currency list is unavailable.");
  if (!Array.isArray(data) || data.length === 0 || !data.every((currency) => typeof currency.code === "string" && typeof currency.name === "string")) {
    throw new Error("Currency service returned an invalid currency list.");
  }
  return data;
}

export async function fetchExchangeRate(from, to, signal) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { signal });
  } catch (error) {
    throw networkError(error);
  }
  const data = await readJson(response);
  if (!response.ok) throw new Error(data.error || "No reference rate is available for this currency pair.");
  if (typeof data.rate !== "number" || !Number.isFinite(data.rate) || data.rate <= 0 || typeof data.date !== "string") {
    throw new Error("Currency service returned an invalid exchange rate.");
  }
  return data;
}
