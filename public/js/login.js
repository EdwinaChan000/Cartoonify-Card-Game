window.onload = function () {
  login();
};

function login() {
  document.querySelector("#login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Serialize the Form afterwards
    const form = event.target;
    const formObject = {};
    formObject["email"] = form.email.value;
    formObject["psw"] = form.psw.value;

    const res = await fetch("/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formObject),
    });
    const result = await res.json();
    if (!result.success) {
      await Swal.fire({
        icon: "error",
        title: "Incorrect email or password",
        text: " Please try again",
      });
      window.location.href = "/login.html";
    } else {
      await Swal.fire("登入成功", "歡迎", "登入成功");
      window.location.href = "/profile.html";
    }
  });
}
