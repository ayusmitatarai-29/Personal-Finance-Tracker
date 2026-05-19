/* script.js */

let isLogin = true;

const authTitle =
document.getElementById("authTitle");

const toggleText =
document.getElementById("toggleText");

const authContainer =
document.getElementById("authContainer");

const dashboard =
document.getElementById("dashboard");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let monthlyBudget =
JSON.parse(localStorage.getItem("monthlyBudget")) || 0;

/* LOGIN SIGNUP */

function toggleAuth(){

    isLogin = !isLogin;

    authTitle.innerText =
    isLogin ? "Login" : "Signup";

    toggleText.innerHTML =
    isLogin
    ? `Don't have an account?
    <span onclick="toggleAuth()">Signup</span>`
    : `Already have an account?
    <span onclick="toggleAuth()">Login</span>`;
}

function handleAuth(){

    const username =
    document.getElementById("username").value;

    const password =
    document.getElementById("password").value;

    if(username === "" || password === ""){
        alert("Fill all fields");
        return;
    }

    if(isLogin){

        const savedUser =
        JSON.parse(localStorage.getItem("user"));

        if(savedUser &&
           savedUser.username === username &&
           savedUser.password === password){

            loginSuccess();

        }else{
            alert("Invalid Credentials");
        }

    }else{

        localStorage.setItem(
            "user",
            JSON.stringify({
                username,
                password
            })
        );

        alert("Signup Successful");

        toggleAuth();
    }
}

function loginSuccess(){

    authContainer.classList.add("hidden");

    dashboard.classList.remove("hidden");

    loadTransactions();
}

function logout(){

    dashboard.classList.add("hidden");

    authContainer.classList.remove("hidden");
}

/* ADD EXPENSE */

function addTransaction(){

    const text =
    document.getElementById("text").value;

    const amount =
    document.getElementById("amount").value;

    const category =
    document.getElementById("category").value;

    if(text === "" || amount === ""){
        alert("Please fill all fields");
        return;
    }

    const transaction = {
        id:Date.now(),
        text,
        amount:+amount,
        category,
        date:new Date().toLocaleDateString()
    };

    transactions.push(transaction);

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    document.getElementById("text").value = "";
    document.getElementById("amount").value = "";

    loadTransactions();
}

/* SET BUDGET */

function setBudget(){

    const budgetInput =
    document.getElementById("monthlyBudget").value;

    if(budgetInput === ""){
        alert("Enter budget amount");
        return;
    }

    monthlyBudget = +budgetInput;

    localStorage.setItem(
        "monthlyBudget",
        JSON.stringify(monthlyBudget)
    );

    document.getElementById("monthlyBudget").value = "";

    loadTransactions();
}

/* LOAD TRANSACTIONS */

function loadTransactions(
    filteredTransactions = transactions
){

    const list =
    document.getElementById("list");

    list.innerHTML = "";

    let totalExpense = 0;

    let categoryData = {};

    let monthlyData = {};

    filteredTransactions.forEach(transaction => {

        const li =
        document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${transaction.text}</strong>
                <br>
                <small>${transaction.category}</small>
            </div>

            <div>
                - ₹${transaction.amount}
            </div>

            <button
            class="delete-btn"
            onclick="deleteTransaction(${transaction.id})">
            Delete
            </button>
        `;

        list.appendChild(li);

        totalExpense += transaction.amount;

        categoryData[transaction.category] =
        (categoryData[transaction.category] || 0)
        + transaction.amount;

        const month =
        new Date().toLocaleString(
            'default',
            { month:'short' }
        );

        monthlyData[month] =
        (monthlyData[month] || 0)
        + transaction.amount;
    });

    document.getElementById("expense")
    .innerText = `₹${totalExpense}`;

    document.getElementById("budgetAmount")
    .innerText = `₹${monthlyBudget}`;

    document.getElementById("balance")
    .innerText =
    `₹${monthlyBudget-totalExpense}`;

    document.getElementById("remainingBudget")
    .innerText =
    `₹${monthlyBudget-totalExpense}`;

    /* Progress */

    const progress =
    document.getElementById("progress");

    let percent = 0;

    if(monthlyBudget > 0){

        percent =
        (totalExpense / monthlyBudget) * 100;

        if(percent > 100){
            percent = 100;
        }
    }

    progress.style.width =
    percent + "%";

    loadCharts(categoryData, monthlyData);
}

/* SEARCH */

function searchTransactions(){

    const searchValue =
    document.getElementById("searchInput")
    .value
    .toLowerCase();

    const filteredTransactions =
    transactions.filter(transaction =>

        transaction.text
        .toLowerCase()
        .includes(searchValue)

        ||

        transaction.category
        .toLowerCase()
        .includes(searchValue)
    );

    loadTransactions(filteredTransactions);
}

/* DELETE */

function deleteTransaction(id){

    transactions =
    transactions.filter(
        transaction =>
        transaction.id !== id
    );

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    loadTransactions();
}

/* CHARTS */

let expenseChart;
let monthlyChart;

function loadCharts(categoryData, monthlyData){

    const expenseCanvas =
    document.getElementById("expenseChart");

    const monthlyCanvas =
    document.getElementById("monthlyChart");

    if(!expenseCanvas || !monthlyCanvas){
        return;
    }

    const ctx1 =
    expenseCanvas.getContext("2d");

    const ctx2 =
    monthlyCanvas.getContext("2d");

    if(expenseChart){
        expenseChart.destroy();
    }

    if(monthlyChart){
        monthlyChart.destroy();
    }

    const expenseLabels =
    Object.keys(categoryData);

    const expenseValues =
    Object.values(categoryData);

    const monthlyLabels =
    Object.keys(monthlyData);

    const monthlyValues =
    Object.values(monthlyData);

    expenseChart = new Chart(ctx1, {

        type: 'pie',

        data: {

            labels:
            expenseLabels.length
            ? expenseLabels
            : ["No Data"],

            datasets: [{
                data:
                expenseValues.length
                ? expenseValues
                : [1]
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });

    monthlyChart = new Chart(ctx2, {

        type: 'bar',

        data: {

            labels:
            monthlyLabels.length
            ? monthlyLabels
            : ["No Data"],

            datasets: [{
                label:'Monthly Expenses',

                data:
                monthlyValues.length
                ? monthlyValues
                : [0]
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}

/* DARK MODE */

const themeToggle =
document.getElementById("themeToggle");

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        themeToggle.innerText = "☀️";

    }else{

        themeToggle.innerText = "🌙";
    }
});