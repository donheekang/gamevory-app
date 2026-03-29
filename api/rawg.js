// Vercel Serverless: RAWG API 프록시
// 프론트엔드에서 API 키 노출 없이 RAWG 호출
// GET /api/rawg?path=/games&search=portal&page_size=10

const RAWG_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE = "https://api.rawg.io/api";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1200"); // 10분 캐시

  const { path, ...params } = req.query;
  if (!path) {
    return res.status(400).json({ error: "path parameter required (e.g. /games)" });
  }

  try {
    // path에서 key 제거 후 서버 키 사용
    const queryParams = new URLSearchParams(params);
    queryParams.set("key", RAWG_KEY);

    const url = `${RAWG_BASE}${path}?${queryParams}`;
    const rawgRes = await fetch(url);

    if (!rawgRes.ok) {
      return res.status(rawgRes.status).json({ error: `RAWG API error: ${rawgRes.status}` });
    }

    const data = await rawgRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "RAWG proxy failed", message: err.message });
  }
}
