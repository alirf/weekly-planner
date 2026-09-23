import html2canvas from "html2canvas";

export async function exportToJPG(element, filename = "weekly-planner.jpg") {
  const stickyEls = element.querySelectorAll(".sticky");
  stickyEls.forEach((el) => {
    el.dataset.oldPosition = el.style.position;
    el.style.position = "static";
  });

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,        
      useCORS: true,
      logging: false,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  } finally {
    stickyEls.forEach((el) => {
      el.style.position = el.dataset.oldPosition || "";
      delete el.dataset.oldPosition;
    });
  }
}