export function getYouTubeSearchUrl(keyword: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
}

export function getTrendsUrl(keyword: string) {
  return `https://trends.google.com/trends/explore?geo=US&q=${encodeURIComponent(keyword)}`;
}
