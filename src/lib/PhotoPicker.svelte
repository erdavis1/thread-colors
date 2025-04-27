<script>
export let baseHex;
export let resetSliders = () => {}; 
export let rgbToHex = () => {}; 



//image picker
let showPhoto = true;
let imageSrc = '';
let imgRef;
let canvasRef;
let pickedHex = ''; 
let containerRef;

let clickedX = null;
let clickedY = null;
let translateX = 0;
let translateY = 0;

let zoom = 1; 
let minZoom = 0.5;
let maxZoom = 7;

let isDragging = false;
let dragStarted = false;
let wasDragging = false;
let dragThreshold = 5;

let lastMouseX = 0;
let lastMouseY = 0;
let lastTouchDistance = null;
let activeTouchMode = null; 

function handleFileChange(event) {
    resetZoom()
    resetSliders()

    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageSrc = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function handleImageLoad() {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');

    canvas.width = imgRef.naturalWidth;
    canvas.height = imgRef.naturalHeight;

    ctx.drawImage(imgRef, 0, 0);
}

function handleImageClick(event) {
    if (wasDragging) {
		wasDragging = false;
		return;
	}

	const rect = containerRef.getBoundingClientRect();

	// Mouse position relative to container
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	// Correct for translate and zoom
	const realX = (mouseX - translateX) / zoom;
	const realY = (mouseY - translateY) / zoom;

	//Now: compute based on displayed image inside container
	const displayedWidth = imgRef.clientWidth;
	const displayedHeight = imgRef.clientHeight;

	const scaleX = imgRef.naturalWidth / displayedWidth;
	const scaleY = imgRef.naturalHeight / displayedHeight;

	const canvasX = realX * scaleX;
	const canvasY = realY * scaleY;

	const ctx = canvasRef.getContext('2d');
	const pixel = ctx.getImageData(Math.floor(canvasX), Math.floor(canvasY), 1, 1).data;
	const [r, g, b] = pixel;
	const hex = rgbToHex({ r, g, b });

	pickedHex = hex;
	baseHex = hex;

	// Marker on screen
    clickedX = mouseX;
    clickedY = mouseY;



    console.log('handle image click')
}



function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function resetZoom() {
	zoom = 1;
	translateX = 0;
	translateY = 0;
    clickedX = null;
    clickedY = null;
}

function handleWheelZoom(event) {
	event.preventDefault();

	const rect = imgRef.getBoundingClientRect();
	const offsetX = event.clientX - rect.left;
	const offsetY = event.clientY - rect.top;

	const oldZoom = zoom;
	const zoomAmount = event.deltaY * -0.001;
	zoom = Math.min(maxZoom, Math.max(minZoom, zoom + zoomAmount));

	// Recalculate translate to zoom around mouse
	const zoomFactor = zoom / oldZoom;

	translateX = offsetX - zoomFactor * (offsetX - translateX);
	translateY = offsetY - zoomFactor * (offsetY - translateY);

    clickedX = null;
    clickedY = null;
    clampPan()
    console.log('handle wheel zoom')

}

function getTouchDistance(touches) {
	const dx = touches[0].clientX - touches[1].clientX;
	const dy = touches[0].clientY - touches[1].clientY;
	return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchStart(event) {
	if (event.touches.length === 1) {
		// One finger = dragging
		isDragging = true;
		lastMouseX = event.touches[0].clientX;
		lastMouseY = event.touches[0].clientY;
		activeTouchMode = 'drag';
	} else if (event.touches.length === 2) {
		// Two fingers = pinch zoom
		lastTouchDistance = getTouchDistance(event.touches);
		activeTouchMode = 'zoom';
	}
    console.log('handle touch start')
}

function handleTouchMove(event) {
	if (activeTouchMode === 'drag' && event.touches.length === 1) {
		event.preventDefault();
        dragStarted = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
		handleDragging(event.touches[0]);
	} else if (activeTouchMode === 'zoom' && event.touches.length === 2) {
		event.preventDefault();

		const newDistance = getTouchDistance(event.touches);
		const distanceChange = newDistance - lastTouchDistance;

		const oldZoom = zoom;
		const zoomAmount = distanceChange * 0.005; // Adjust sensitivity
		zoom = Math.min(maxZoom, Math.max(minZoom, zoom + zoomAmount));
		const zoomFactor = zoom / oldZoom;

		//  Calculate the midpoint between two fingers
		const rect = imgRef.getBoundingClientRect();
		const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
		const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;

		//  Adjust translateX and translateY to zoom centered around pinch
		translateX = centerX - zoomFactor * (centerX - translateX);
		translateY = centerY - zoomFactor * (centerY - translateY);

		lastTouchDistance = newDistance;
        clampPan()

        clickedX = null;
        clickedY = null;
	}

    console.log('handle touch move')
}


function handleTouchEnd(event) {
	if (event.touches.length === 0) {
		isDragging = false;
		activeTouchMode = null;
		lastTouchDistance = null;
	}
    console.log('touch end')
}

function startDragging(event) {
	dragStarted = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
	event.preventDefault(); 
    console.log('started drag')
}

function stopDragging() {
    if (isDragging) {
		wasDragging = true;
	}

	isDragging = false;
    dragStarted = false;

    clampPan();
    console.log('stopped drag')
}

function handleDragging(event) {
	if (dragStarted) {
		const dx = event.clientX - lastMouseX;
		const dy = event.clientY - lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!isDragging && distance > dragThreshold) {
		    isDragging = true;
            clickedX = null;
            clickedY = null;
	    }

        if (isDragging) {
            translateX += dx;
            translateY += dy;

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            clickedX = null;
            clickedY = null;

            clampPan()
        }
	}
    console.log('handle drag')

}

function clampPan() {
	const containerWidth = containerRef.clientWidth;
	const containerHeight = containerRef.clientHeight;

	const imageWidth = imgRef.clientWidth * zoom;  // 🔥 scaled visible size
	const imageHeight = imgRef.clientHeight * zoom;

	let minTranslateX = Math.min(0, containerWidth - imageWidth);
	let maxTranslateX = 0;

	let minTranslateY = Math.min(0, containerHeight - imageHeight);
	let maxTranslateY = 0;

	translateX = clamp(translateX, minTranslateX, maxTranslateX);
	translateY = clamp(translateY, minTranslateY, maxTranslateY);
}



</script>



<!-- pick from photo -->
<div class="form-section">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <h3 on:click={() => showPhoto = !showPhoto}>
        Pick color from image
        <span>{showPhoto ? '▾' : '▸'}</span>
    </h3>

    {#if showPhoto}
        <div class="section-body">
            <input type="file" accept="image/*" on:change={handleFileChange} />
            {#if imageSrc}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div style="position: relative;  width: 100%; max-width: 600px;  touch-action: none;"
                    bind:this={containerRef}    
                    on:wheel={handleWheelZoom}
                    on:mousedown={startDragging}
                    on:mouseup={stopDragging}
                    on:mouseleave={stopDragging}
                    on:mousemove={handleDragging}
                    
                    on:touchstart={handleTouchStart}
                    on:touchmove={handleTouchMove}
                    on:touchend={handleTouchEnd}
                >

                    <div class="zoom-controls">
                        <div class="zoom-group">
                            <button type="button" class="button" on:click={() => zoom = Math.max(zoom - 0.1, 0.5)}>-</button>
                            <span class="zoom-amount">{Math.round(zoom * 100)}%</span>
                            <button type="button" class="button" on:click={() => zoom = Math.min(zoom + 0.1, 5)}>+</button>
                        </div>

                        <div class="zoom-reset">
                            <button type="button" class="button reset" on:click={resetZoom}>↺</button>
                        </div>
                    </div>

                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <div style="position: relative; overflow: hidden; width: 100%; max-width: 600px;  height: auto;">
                        <img
                            src={imageSrc}
                            bind:this={imgRef}
                            on:load={handleImageLoad}
                            on:click={handleImageClick}
                            
                            alt="Preview"
                            style="transform: translate({translateX}px, {translateY}px) scale({zoom});
                            max-width: 100%;height: auto;
                            cursor: {isDragging ? 'grabbing' : 'crosshair'};
                            transition: transform 0.3s ease; 
                            transform-origin: top left;"
                        />
                    </div>
                    <canvas bind:this={canvasRef} style="display: none;"></canvas>
                
                    <!-- Dot marker-->
                    {#if clickedX !== null && clickedY !== null}
                        <div
                            style="
                                position: absolute;
                                width: 10px;
                                height: 10px;
                                border-radius: 50%;
                                border: 2px solid white;
                                background-color: {pickedHex};
                                box-shadow: 0 0 0 1px black;
                                left: {clickedX - 5}px;
                                top: {clickedY - 5}px;
                                pointer-events: none;
                            "
                        ></div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</div>


<style>
.zoom-controls {
    display: flex;
    justify-content: space-between;
    
}

.zoom-group {
  display: flex;
  align-items: left;
  gap: 0.5rem
}

.zoom-reset {
  display: flex;
  align-items: right;
}


.zoom-amount{
    padding: 0;
    margin: 0;
    font-size: .9rem;
    color: #6C6C6C;
    text-align: center;
}

.reset {
    margin-left: 2rem;
}
</style>