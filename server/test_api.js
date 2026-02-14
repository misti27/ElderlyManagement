
const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject({ statusCode: res.statusCode, body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testApi() {
    try {
        console.log('Logging in as elderly...');
        const loginRes = await request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login/elderly',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { phone: '13800138000' });

        const token = loginRes.token;
        console.log('Login success, token:', token);
        console.log('User ID:', loginRes.user.id);

        console.log('Fetching guardians...');
        const guardiansRes = await request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/elderly/guardians',
            method: 'GET',
            headers: { 'Authorization': token }
        });

        console.log('Guardians:', JSON.stringify(guardiansRes, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testApi();
