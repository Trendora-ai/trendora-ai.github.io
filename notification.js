// notification.js
export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toast-title");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");

  if (type === "success") {
    toastTitle.textContent = "🎉 Success!";
    toastMessage.textContent = message;
    toastIcon.textContent = "✅";
    toastIcon.className = "flex-shrink-0 bg-green-100 text-green-600 p-2 rounded-full";
  } else {
    toastTitle.textContent = "⚠️ Error";
    toastMessage.textContent = message;
    toastIcon.textContent = "❌";
    toastIcon.className = "flex-shrink-0 bg-red-100 text-red-600 p-2 rounded-full";
  }

  toast.classList.remove("hidden", "opacity-0", "-translate-y-5");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    toast.classList.add("opacity-0", "-translate-y-5");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 3000);
}
