let message = "Welcome";

const period = new Date().getHours() < 12 ? "AM" : "PM";

if (period === "AM"){
    message = "Good Morning"
} else {
    message = "Good Afternoon"
}

console.log(message)