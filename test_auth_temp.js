const http = require('http');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ success: false, message: 'Invalid JSON response', body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function testAuth() {
    const testUser = {
        name: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'password123'
    };

    console.log('1. Testing Registration...');
    try {
        const regData = await postRequest('/api/auth/customer/register', JSON.stringify(testUser));

        if (regData.success) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed:', regData.message);
            return;
        }

        console.log('2. Testing Login...');
        const loginData = await postRequest('/api/auth/customer/login', JSON.stringify({
            email: testUser.email,
            password: testUser.password
        }));

        if (loginData.success && loginData.token) {
            console.log('✅ Login Successful. Token received.');
        } else {
            console.error('❌ Login Failed:', loginData.message);
        }

        console.log('3. Testing Invalid Login...');
        const failData = await postRequest('/api/auth/customer/login', JSON.stringify({
            email: testUser.email,
            password: 'wrongpassword'
        }));

        if (!failData.success) {
            console.log('✅ Invalid Login correctly rejected.');
        } else {
            console.error('❌ Invalid Login accepted (this is bad).');
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testAuth();
