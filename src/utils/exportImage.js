import html2canvas from "html2canvas-pro";

export async function exportToJPG(element, filename = "weekly-planner.jpg") {
  const stickyEls = element.querySelectorAll(".sticky");
  stickyEls.forEach((el) => {
    el.dataset.oldPosition = el.style.position;
    el.style.position = "static";
  });

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  window.scrollTo(0, 0);

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#0f172a"
        : "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.95)
    );

    if (!blob) {
      alert("خطا در ساخت تصویر");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    console.error("Export error:", err);
    alert("خطا در ساخت تصویر: " + err.message);
  } finally {
    stickyEls.forEach((el) => {
      el.style.position = el.dataset.oldPosition || "";
      delete el.dataset.oldPosition;
    });

    window.scrollTo(scrollX, scrollY);
  }
}