let loginBtn = document.getElementById("tokenButn")

loginBtn.addEventListener("click", () =>{
    let token = document.getElementById("tokenInput").value;
    sessionStorage.setItem("token", token);

    window.location.href = "index.html";
});
