// Probability comes from Best Match ensembles, independently of the selected
// deterministic model. Keep failures optional and match samples by timestamp.
export async function fetchWeatherWithProbability(params, fetchHourly) {
  const weatherRequest = fetchHourly(params);
  const includeProbability = params.forecast_mode === 'forecast' && params.hourly.includes('precipitation');
  const { daily, ...probabilityParams } = params;
  const probabilityRequest = includeProbability
    ? fetchHourly({ ...probabilityParams, models: 'best_match', hourly: ['precipitation_probability'] })
      .catch(() => null)
    : Promise.resolve(null);
  const [weather, probability] = await Promise.all([weatherRequest, probabilityRequest]);
  if (!includeProbability) return weather;
  const byTime = new Map((probability?.time ?? []).map((time, i) => [time, probability.precipitation_probability?.[i]]));
  return {
    ...weather,
    precipitation_probability: Float32Array.from(weather.time, time => {
      const value = byTime.get(time);
      return Number.isFinite(value) && value >= 0 && value <= 100 ? value : NaN;
    }),
  };
}
