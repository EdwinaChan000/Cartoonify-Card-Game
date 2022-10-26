document.querySelector("#signUpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const formData = new FormData();

  formData.append("name", form.name.value);
  formData.append("email", form.email.value);
  formData.append("psw", form.psw.value);
  formData.append("pswRepeat", form.repeat.value);
  formData.append("profile", form.files.files[0]);

  if (form.psw.value === form.repeat.value) {
    const res = await fetch("/user/signUp", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    await Swal.fire(result.message);
    window.location.href = "./login.html";
  } else {
    await Swal.fire({
      icon: "error",
      title: "Password not match",
      text: " Please try again",
    });
  }
});
