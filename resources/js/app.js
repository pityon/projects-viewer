export default class App {
    constructor() {
        this.images = new Set();
        this.image = null;
        this.canvas = null;
        this.position = this.vector2();
        this.offset = this.vector2();
        this.resolution = this.vector2(1920, 1080);
        this.resizeTimer = null;
        this.drag = false;
        this.time = null;
        this.fps = 60;
        this.zoom = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
        this.zoomIndex = 0;
        this.resizeCanvasArea = false;
        this.scrollMode = 0;

        $(window)
            .resize(() => {
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => {
                    this.resize();
                }, 250);
            })
            .mousedown((e) => {
                this.drag = true;
                this.offset = this.vector2(-e.clientX + this.position.x, -e.clientY + this.position.y);
            })
            .mouseup(() => {
                this.drag = false;
            })
            .mousemove((e) => {
                if (this.drag) {
                    this.move(-e.clientX, -e.clientY);
                }
            })
            .keydown((e) => { if (e.shiftKey == true) { this.scrollMode = 1; } })
            .keyup((e) => { if (e.shiftKey == false) { this.scrollMode = 0; } })
            
        window.addEventListener("wheel", (e) => {
            // mode 0 - move vertical
            if (this.scrollMode == 0) {
                this.offset = this.vector2(this.position.x, this.position.y);
                this.move(0, e.deltaY);
            }
            // mode 1 - change zoom
            else if (this.scrollMode == 1) {
                let index = this.zoomIndex;
                if (e.deltaY > 0) {
                    index -= 1;
                }
                else if (e.deltaY < 0) {
                    index += 1;
                }
                this.rezoom(this.getZoom(index));
            }
        })
        window.addEventListener("touchstart", (e) => {
            this.drag = true;
            const point01 = e.targetTouches[0];
            this.offset = this.vector2(-point01.clientX + this.position.x, -point01.clientY + this.position.y);
        });
        window.addEventListener("touchend", (e) => {
            this.drag = false;
        });
        window.addEventListener("touchmove", (e) => {
            if (this.drag) {
                const point01 = e.targetTouches[0];
                this.move(-point01.clientX, -point01.clientY);
            }
        });
                
        this.update();
    }
    setCanvas(node, width=1920, height=1080) {
        this.canvas = node;
        this.resolution = this.vector2(width, height);
        this.resize();
    }
    loadImages(images) {
        if (images.length) {
            images.forEach((image) => {
                this.images.add({
                    title: image[0],
                    url: image[1],
                });
            });
            if (this.image == null) {
                this.setImage();
            }
            return true;
        }
        return false;
    }
    getImage(index) {
        const images = this.images;
        if (index < images.size && index >= 0) {
            let key = 0;
            for (let entry of images.values()) {
                if (key == index) {
                    return entry;
                }
                key++;
            }
        }
        return null;
    }
    setImage(index=0) {
        this.image = this.getImage(index);
        this.resizeCanvasArea = true;
        this.render();
    }
    render() {
        if (this.image) {
            const canvas = this.canvas;
            const ctx = canvas.getContext('2d');
            const pos = this.position;
            // const res = this.resolution;

            if (!this.image.buffer) {
                const image = new Image();
                image.onload = () => {
                    const buffer = document.createElement("canvas");
                    // buffer.width = res.x;
                    // buffer.height = res.y;
                    buffer.width = image.naturalWidth;
                    buffer.height = image.naturalHeight;
                    buffer.getContext('2d').drawImage(image, 0, 0);
                    this.image.buffer = buffer;
                    this.render();  //rerender with buffer this time
                }
                image.src = this.image.url;
            }
            else {
                if (this.resizeCanvasArea) {
                    this.resolution = this.vector2(this.image.buffer.width, this.image.buffer.height);
                    this.resizeCanvasArea = false;
                }
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.drawImage(this.image.buffer, pos.x, pos.y);
            }
        }
    }
    resize() {
        console.log("Resized");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // this.position.x = 0;
        // this.position.y = 0;
        this.render();
    }
    getZoom(index) {
        index = this.clamp(index, 0, this.zoom.length -1);
        return this.zoom[index];
    }
    rezoom(zoom) {
        const zoomIndex = this.zoom.indexOf(zoom)
        if (zoomIndex > -1) {
            this.zoomIndex = zoomIndex;
            const canvas = this.canvas;
            const ctx = canvas.getContext('2d');
            ctx.restore();
            ctx.save(); // ctx save and restore are necessary for scale (to reset scale to 1.0 before transforming again)
            ctx.scale(zoom, zoom);
            this.render();
        }
    }
    move(posX, posY) {
        let pos = this.vector2(this.offset.x - posX, this.offset.y - posY); // inverse direction
        this.position = pos;
        this.render();
        // console.log(pos);
    }
    normalize() {
        let posX = null, 
            posY = null;
        const pos = this.position,
            res = this.resolution,
            errorMargin = 0.1,
            zoom = this.getZoom(this.zoomIndex),
            width = this.canvas.width / zoom,
            height = this.canvas.height / zoom;

        const leftBorder = (pos.x > 0),
            rightBorder = (width - pos.x > res.x),
            topBorder = (pos.y > 0),
            botBorder = (height - pos.y > res.y);

        // posX rules
        if (width > res.x) {
            posX = (width-res.x) / 2;
        }
        else if (leftBorder) {
            posX = 0;
        }
        else if (rightBorder) {
            posX = -(res.x - width);
        }
        if (posX != null && Math.abs(pos.x - posX) < errorMargin) {
            posX = null;
        }

        // posY rules
        if (height > res.y) {
            posY = (height-res.y) / 2;
        }
        else if (topBorder) {
            posY = 0;
        }
        else if (botBorder) {
            posY = -(res.y - height);
        }
        if (posY != null && Math.abs(pos.y - posY) < errorMargin) {
            posY = null;
        }

        if (posX != null || posY !=null) {
            if (posX != null) {
                pos.x = this.lerp(pos.x, posX);
            }
            if (posY != null) {
                pos.y = this.lerp(pos.y, posY);
            }
            // console.log('normalize');
            this.render();
        }
    }
    vector2(x=0, y=0) {
        return {
            x: x, 
            y: y,
        };
    }
    lerp(start, end, speed=0.15) {
        return start + (end - start) * speed ;
    }
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    update(timestamp) {
        if (!this.time) {
            this.time = timestamp;
        }
        if (timestamp - this.time >= (1000/this.fps)) {
            this.fixedUpdate();
            this.time = timestamp;
        }
        requestAnimationFrame((ts) => this.update(ts));
    }
    fixedUpdate() {
        if (!this.drag) {
            this.normalize();
        }
    }
}