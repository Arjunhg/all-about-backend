const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const start = Date.now();

setImmediate(() => console.log("Hello from setTimmediate"))

fs.readFile("sample.txt", "utf8", () => {
    console.log("IO Polling")

    setTimeout(() => console.log("Hello from timer 2"), 0)

    setTimeout(() => console.log("Hello from timer 3"), 5*1000)

    setImmediate(() => console.log("Hello from setTimmediate 2"))

    const task = Array.from(
        { length: 6 },
        (_, i) => `password${i+1}`
    )

    task.forEach((password, index) => {
        crypto.pbkdf2(password, "salt", 100000, 1024, "sha512", () => { //goes to thread pool as cpu intensive
            console.log(`${Date.now() - start}ms`, `${password} Done`)
        })
    })
})

setTimeout(() => console.log("Hello from timer 1"), 0)

console.log("Hello from the top-level code")

/*
1️⃣ Call Stack (🔼 Highest Priority)
   └── Handles synchronous code (LIFO: Last In, First Out)
   └── Example: console.log(), function calls, loops

     ⬇️ If an async function is encountered, it's sent to Web API ⬇️

2️⃣ Web APIs (⏳ Handles Async Tasks)
   └── Executes long-running tasks (e.g., setTimeout, DOM events, fetch)
   └── Example: setTimeout(), setInterval(), fetch(), DOM events

     ⬇️ Once an async task completes, its callback moves to a queue ⬇️

3️⃣ Callback Queues (🕒 Different Priority Levels)
   └── Microtask Queue (🔥 Highest Priority in Queues)
       ├── Promises (.then, .catch, .finally)
       ├── process.nextTick() (Node.js only)
       ├── queueMicrotask()
       ├── MutationObserver()
   
   └── Timer Queue (⏳ Runs after delay)
       ├── setTimeout()
       ├── setInterval()

   └── I/O Queue (📡 Handles async I/O)
       ├── fs.readFile() (Node.js)
       ├── Network requests (if not using fetch)
   
   └── Check Queue (⚡ Runs after I/O)
       ├── setImmediate() (Node.js only)

   └── Close Queue (🚪 Handles cleanup)
       ├── socket.on('close', ...)
       ├── stream.on('close', ...)

     ⬇️ Event Loop moves tasks to the Call Stack when it's empty ⬇️

4️⃣ Back to Call Stack (✅ Execution Continues)
   └── The event loop picks tasks and executes them

1️⃣ General Case (Outside I/O Callbacks)
    If setTimeout(0) and setImmediate() are used outside an I/O operation, their execution order is unpredictable:

2️⃣ Inside an I/O Callback
    If inside an I/O operation (like fs.readFile()), setImmediate() always executes before setTimeout(0).

    ✅ Reason:

    After an I/O operation, Node.js moves directly to the Check Queue before the Timer Queue.
    That’s why setImmediate() runs before setTimeout(0).

1️⃣ Call Stack  (executes all synchronous code)
2️⃣ Microtask Queue (Promises, process.nextTick)
3️⃣ Timer Queue (setTimeout, setInterval)  ← if no I/O
4️⃣ I/O Queue  (fs.readFile, network requests)
5️⃣ Check Queue (setImmediate)  ← runs BEFORE Timer Queue if inside I/O
6️⃣ Close Queue (socket.on("close"), stream.on("close"))


*/