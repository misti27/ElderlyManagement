console.log("Starting test...");
fetch('http://localhost:3000/').then(r => console.log(r.status)).catch(e => console.error(e));
console.log("Request sent.");