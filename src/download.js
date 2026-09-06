import apkUrl from '/musugo-mobile.apk?url';

const downloadButton = document.getElementById("downloadButton");

downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = apkUrl;
  link.download = "musugo-mobile.apk";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});