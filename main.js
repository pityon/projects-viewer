import App from "./resources/js/app.js";

const app = new App();
app.setCanvas($("#canvas").get(0));
app.loadImages(images);
app.render();

// UI
const projectSelect = $('select.changeImage');
projectSelect.on('change', function() {
    app.setImage($(this).val());
});
$(window).mouseup(() => {
    projectSelect.focus();
})
projectSelect.focus();