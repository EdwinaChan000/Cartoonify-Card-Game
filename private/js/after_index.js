document.querySelector(".logout").addEventListener("click", async function (e) {
  const resp = await fetch("/logout");
  const result = await resp.json();
  if (result.success === true) {
    await Swal.fire("Logout success", "Bye!");
    window.location.href = "./index.html";
    return;
  }
});
