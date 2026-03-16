const http = require('http');

setTimeout(() => {
  http.get('http://localhost:4000', (res) => {
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response Status:', res.statusCode);
      console.log('Response Body:', data);
      
      const expectedData = {
        "data": {
          "organization": {
            "metrics": {
              "prsMerged": 15,
              "averageCycleTime": 24.5,
              "reviewCount": 30
            }
          }
        }
      };

      try {
        const json = JSON.parse(data);
        const match = JSON.stringify(json) === JSON.stringify(expectedData);
        if (match) {
          console.log('✅ Test Passed! Response matches expected format.');
          process.exit(0);
        } else {
          console.error('❌ Test Failed! Unexpected response:', json);
          process.exit(1);
        }
      } catch (err) {
        console.error('❌ Test Failed! Could not parse JSON response:', err.message);
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.log("Error: " + err.message);
    process.exit(1);
  });
}, 1000); // give the server 1 second to start
