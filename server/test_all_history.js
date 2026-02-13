async function testAllHistory() {
    try {
        const token = "mock-guardian-token";
        
        // Fetch History for 'all'
        const historyUrl = 'http://127.0.0.1:3000/api/stats/history/all?date=2026-02-13';
        console.log("Fetching:", historyUrl);
        
        const historyRes = await fetch(historyUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("History status:", historyRes.status);

        if (historyRes.status !== 200) {
            console.log(await historyRes.text());
            return;
        }

        const historyData = await historyRes.json();
        console.log("History Records Count:", historyData.length);
        if (historyData.length > 0) {
            console.log("First record:", historyData[0]);
            // Check if elderlyName is present
            if (historyData[0].elderlyName) {
                console.log("Success: elderlyName is present.");
            } else {
                console.log("Failure: elderlyName is missing.");
            }
        } else {
            console.log("Result:", historyData);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

testAllHistory();