async function test() {
    try {
        const token = "mock-guardian-token";

        // 2. Fetch History for Elder 2 (Li Xiuying) on 2026-02-13
        const historyUrl = 'http://127.0.0.1:3000/api/stats/history/2?date=2026-02-13';
        console.log("Fetching:", historyUrl);

        const historyRes = await fetch(historyUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("History status:", historyRes.status);

        const historyData = await historyRes.json();
        console.log("History Records Count:", historyData.length);
        if (historyData.length > 0) {
            console.log("First record:", historyData[0]);
        } else {
            console.log("Result:", historyData);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();