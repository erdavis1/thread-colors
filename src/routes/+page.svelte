<script>
// @ts-nocheck

    //data variables
    import '../app.css';
    import rawData from '../data/data.json';
    let data = rawData;

    let baseHex = '';
	let searchDesc = '';
    let searchBrands = ['DMC', 'Anchor', 'Cosmo'];

    let adjustR = 0;
    let adjustG = 0;
    let adjustB = 0;
    let adjustLight = 0;

    //helper variables
    let showSliders = false;
	let showSearch = true;
    let showHelp = false;
    let showPhoto = true
	let clickTimer = null;


    // color functions
	function colorDistance(c1, c2) {
		return Math.sqrt(
			(c1.r - c2.r) ** 2 +
			(c1.g - c2.g) ** 2 +
			(c1.b - c2.b) ** 2
		);
	}

    function normalizeHex(hex) {
	    return hex
            ? '#' + hex.replace(/^#/, '').slice(0, 6).toLowerCase()
            : '';
    }

	function hexToRgb(hex) {
		const cleaned = hex.replace(/^#/, '');
		const bigint = parseInt(cleaned, 16);
		return {
			r: (bigint >> 16) & 255,
			g: (bigint >> 8) & 255,
			b: bigint & 255
		};
	}

    function rgbToHex({ r, g, b }) {
        const toHex = (c) => c.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function colorShift (hex = null, rShift = 0, gShift = 0, bShift=0, adjustLight = 0) {
        const rgb = hexToRgb(normalizeHex(hex));
	    let { r, g, b } = rgb;

        //adjust color
        r = clamp(r + rShift, 0, 255);
        g = clamp(g + gShift, 0, 255);
        b = clamp(b + bShift, 0, 255); 

     
        // Lighten or darken
        if (adjustLight > 0) {
            r = clamp(r + (255 - r) * adjustLight, 0, 255);
            g = clamp(g + (255 - g) * adjustLight, 0, 255);
            b = clamp(b + (255 - b) * adjustLight, 0, 255);
        }

        
        if (adjustLight < 0) {
            r = clamp(r * (1 + adjustLight), 0, 255);
            g = clamp(g * (1 + adjustLight), 0, 255);
            b = clamp(b * (1 + adjustLight), 0, 255);
        }
	 
        r = Math.round(r);
        g= Math.round(g);
        b = Math.round(b);

        return rgbToHex({ r, g, b })
       
    }

    function clamp(value, min, max) {
	    return Math.max(min, Math.min(max, value));
    }


    //filter function
    function applyFilters(hex = null, brands = ['DMC', 'Anchor', 'Cosmo'], desc = '', 
                            adjustR =0, adjustG=0, adjustB=0, adjustLight=0) {

        // Wait to see if a double-click comes
		clickTimer = setTimeout(() => {
            //update color
            const searchHex = colorShift(normalizeHex(hex), adjustR, adjustG, adjustB, adjustLight)
            const targetColor = searchHex ? hexToRgb(searchHex) : null;

            //filter and sort

            data = [...rawData]
                .filter(d =>
                    //filter by brand
                    (brands.length === 0 || brands.includes(d.brand)) &&
                    //filter by description/id
                    (desc.trim() === '' ||
                        d.desc.toLowerCase().includes(desc.toLowerCase()) ||
                        d.id.toLowerCase().includes(desc.toLowerCase()))
                )
                //  sort by color
                .sort((a, b) => {
                    if (!targetColor) return 0;
                    const distA = colorDistance(hexToRgb(a.hex), targetColor);
                    const distB = colorDistance(hexToRgb(b.hex), targetColor);
                    return distA - distB;
                });
        }, 250); // delay in ms
    }

    function resetFilters() {
        baseHex = baseHex !== '' ? baseHex : (data.length > 0 ? data[0].hex : '');
        searchBrands = ['DMC', 'Anchor', 'Cosmo'];
        searchDesc = '';
        adjustR =0;
        adjustG=0;
        adjustB=0;
        adjustLight=0;
    }
    
    function resetSliders() {
        adjustR = 0;
        adjustG = 0;
        adjustB = 0;
        adjustLight = 0;
    }

    function filterFamily(id = 310, brand = 'DMC', family = 97) {
        clearTimeout(clickTimer); // cancel the pending click

        if (family) {
            data = [...rawData]
                .filter(d => d.brand === brand && d.family === family)
                .sort((a, b) => a.hex.localeCompare(b.hex));
        } else {
            data = [...rawData]
                .filter(d => d.brand === brand && d.id === id);
        }
    }


    //color picker
    function openColorPicker() {
            // programmatically click the hidden color input
            const input = document.getElementById('color-picker');
            if (input) {
                input.click();
            }
        }

        function handleColorPick(event) {
            baseHex = event.target.value;
        }

    //reactively apply filters any time the search criteria are changed
    $: if (baseHex !== undefined && searchDesc !== undefined && searchBrands !== undefined &&
                adjustR !== undefined && adjustG !== undefined && adjustB!== undefined &&  adjustLight!== undefined ) {
        applyFilters(baseHex, searchBrands, searchDesc, adjustR, adjustG, adjustB, adjustLight);
    } 

</script>



<header>
	<div class="header-content">
		<h1 class="header-title">Threadpicker</h1>
		<button class="question-button" on:click={() => showHelp = !showHelp}>﹖</button>
	</div>

</header>



<main>
     <!-- help box -->
    {#if showHelp}
        <div class="form-section">
            <div class="section-header">
                    <h3>How to Use Threadpicker
                        <span>
                        <button class="cancel" type="button" on:click={showHelp = false}>×</button></span>
                    </h3>
            </div>
            <div class="section-body">
                <b>Search box</b>
                    <ul>
                        <li>Click the <strong>color preview circle</strong> to select a color</li>
                        <li>Type a <strong>hex code</strong> to sort table by similarity</li>
                        <li>Filter floss by <strong>id or name</strong></li>
                        <li>Pick which <strong>brands</strong> of floss to show</li>
                    </ul>
                <b>Tweak color box</b>
                    <ul>
                        <li>Use the <strong>sliders</strong> for finer control over the color</li>
                        <li>Click the <strong>↺</strong> to reset the sliders</li>
                    </ul>
                <b>Color table</b>
                    <ul>
                        <li>Table shows the <strong>colors</strong> that meet your criteria</li>
                        <li>Click the <strong>color preview circle</strong> to sort for similar colors</li>
                        <li>Double click the <strong>color preview circle</strong> to see other colors in that family</li>
                        <li>Click the <strong>x</strong> to remove your filters and color tweaks</li>
                    </ul>
                <i>Contact erinrdavis1@gmail.com with questions, concerns, hopes, dreams, or fears</i>
                </div>
            </div>
    {/if}

	<form class = 'userinfo' on:submit|preventDefault={applyFilters(baseHex, searchBrands, searchDesc, adjustR, adjustG, adjustB, adjustLight)}>
        <!-- search box -->
        <div class="form-section">
            <h3 on:click={() => showSearch = !showSearch}>
                Search
                <span>{showSearch ? '▾' : '▸'}</span>
            </h3>
        
            {#if showSearch}
                <div class="section-body">
                    <div class="hex-input-row">
                     <!--    <div class="hex-swatch" on:click={openColorPicker} style="cursor: pointer; background-color: {colorShift(baseHex, adjustR, adjustG, adjustB, adjustLight)};"></div>
 -->
                        <label style="cursor: pointer;">
                            <div class="hex-swatch" style="background-color: {colorShift(baseHex, adjustR, adjustG, adjustB, adjustLight)};"></div>
                            <input
                                type="color"
                                bind:value={baseHex}
                                on:input={handleColorPick}
                                style="opacity: 0; position: absolute; width: 1px; height: 1px;"
                            />
                        </label>

                        <input type="color" id="color-picker" value={baseHex} on:input={handleColorPick} style="opacity: 0; position: absolute; width: 1px; height: 1px; pointer-events: none;"/>
                        <input type="Text" class = "search-hex" bind:value={baseHex} placeholder = 'Hex' />
                  
                    </div>
                        <input type="Text" class = "search-desc" bind:value={searchDesc} placeholder = 'Description or code'/>
                </div>

                <fieldset>
                    <label>
                        <input type="checkbox" bind:group={searchBrands} value="DMC" />
                        DMC
                    </label>
                    <label>
                        <input type="checkbox" bind:group={searchBrands} value="Anchor" />
                        Anchor
                    </label>
                    <label>
                        <input type="checkbox" bind:group={searchBrands} value="Cosmo" />
                        Cosmo
                    </label>
                </fieldset>
            {/if}
        </div>

        <!-- color sliders -->
        <div class="form-section">
            <div class="section-header" on:click={() => showSliders = !showSliders}>
                <h3>Tweak color
                    <span>
                    <button class="reset-button" type="button" on:click|stopPropagation={resetSliders}>↺</button>
                    {showSliders ? '▾' : '▸'}</span>
            </h3>
            </div>

            {#if showSliders}
                <div class="section-body">
                    <div class="slider-grid">
                        <span class="label-left">Cyan</span>
                        <input type="range" class="red-cyan" min="-100" max="100" step="1" bind:value={adjustR} />
                        <span class="label-right">Red</span>
                    </div>
                    
                    <div class="slider-grid">
                        <span class="label-left">Magenta</span>
                        <input type="range" class="green-magenta" min="-100" max="100" step="1" bind:value={adjustG} />
                        <span class="label-right" >Green</span>
                    </div>
                    
                    <div class="slider-grid">
                        <span class="label-left">Yellow</span>
                        <input type="range" class="blue-yellow" min="-100" max="100" step="1" bind:value={adjustB} />
                        <span class="label-right">Blue</span>
                    </div>
                    
                    <div class="slider-grid">
                        <span class="label-left">Darker</span>
                        <input type="range" class="light-dark" min="-1" max="1" step=".01" bind:value={adjustLight} />
                        <span class="label-right">Lighter</span>
                    </div>
                    
                  
                </div>
            {/if}
         </div>
	</form>

    <table class="data-table">
        <thead>
            <tr>
                <th><button class="cancel" type="button" on:click={resetFilters}>×</button></th>
                <th>Brand</th>
                <th>ID</th>
                <th>Description</th>
                <th>Hex</th>
            </tr>
        </thead>
        <tbody>
            {#each data as d}
                <tr >
                    <td 
                        on:click={() => {resetSliders(); baseHex = d.hex;}} 
                        on:dblclick={() => {filterFamily(d.id, d.brand, d.family)}}
                        style="cursor: pointer;">
                        <div
                            class="swatch-circle"
		                    style="background-color: {d.hex};"
                        ></div></td>
                    <td>{d.brand}</td>
                    <td>{d.id}</td>
                    <td>{d.desc}</td>
                    <td>{d.hex}</td>
                </tr>
            {/each}
        </tbody>
    </table>



</main>

<style>
	header {
	background-color: #F0F0F0;
	padding: 0.5rem 1rem;np
	position: relative;
}

.header-content {
    display: flex;
	position: relative;
	max-width: 800px;
	margin: 0 auto;
	height: 2rem; /* make sure there's enough vertical space */
}

.header-title {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	font-size: 1.5rem;
	font-weight: 500;
	margin: 0;
}

.question-button {
	position: absolute;
	right: 0;
	top: 0;
	bottom: 0;
	margin: auto 0;
	background: none;
	border: none;
	font-size: 1rem;
	cursor: pointer;
	color: #6C6C6C;
}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		max-width: 400px;
		margin: 2rem auto;
	}

    .form-section {
		border: 1px solid #F0F0F0;
		border-radius: 4px;
		overflow: hidden;
        margin: 0;
	    padding: 100;
	}

	.form-section h3 {
		margin: 0;
		padding: 0.2rem .5rem;
		background: #FFFFFF;
        color: #222222;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1rem;
        font-weight: 500;
        
	}

	.section-body {
		padding: 0.5rem 1rem;
		background: #FFFFFF;
	}

    /* TABLE */
    .swatch-circle {
        width: 20px;
        height:20px;
        border: 1px solid #ccc;
        border-radius: 15px;
    }

    .data-table {
        text-align: center;
        width: 100%;
        max-width: 500px; 
        border-collapse: collapse;
        font-size: .9rem;
        vertical-align: middle;
        margin: 2rem auto; 
        background: #FFFFFF;
    }

    .cancel{
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        font-size: 1rem;
        cursor: pointer;
	    color: #6C6C6C;
        background: #FFFFFF;
    }

    .data-table th {
	    background: #FFFFFF;
        padding: 0.5rem;
    }


    .data-table tr {
	    border-bottom: 1px solid #eee; 
    }

/* SEARCH */
    .hex-input-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%; /* optional — lets it stretch across a container */
        margin-bottom: 0.25rem;
    }

    input.search-hex {
        width: 25%;
        padding: 0.5rem;
        font-size: 0.8rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box; 
        

    }

    input.search-desc {
        width: 100%;
        padding: 0.5rem;
        font-size: 0.8rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box; 
    }

    .hex-swatch {
        width: 25px;
        height: 25px;
        border: 1px solid #ccc;
        border-radius: 25px;
    }

    /* BRANDS */
    fieldset {
        border: none;
        background: #FFFFFF;
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: left;
    }

    fieldset label {
        display: flex;
        align-items: left;
        gap: 0.5rem;
        font-size: 0.95rem;
        cursor: pointer;
    }


    /* SLIDERS */
    input[type="range"]{
		width: 100%;
		appearance: none;
		outline: none;
		cursor: pointer;
		margin-top: 0.5rem;
	}

    input[type="range"].red-cyan {
		background: linear-gradient(to right, #34F2F2,#8f8f8f, #F21A0C);
	}

    input[type="range"].green-magenta {
		background: linear-gradient(to right, #F20EF2,#8f8f8f, #1EF20C);
	}

    input[type="range"].blue-yellow {
		background: linear-gradient(to right, #F2F20E,#8f8f8f, #290EF2);
	}

    input[type="range"].light-dark {
		background: linear-gradient(to right, black,#8f8f8f, white);
	}

	input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #fff;
		border: 1px solid #999;
	}

    .slider-grid {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		column-gap: 0.75rem;
		margin-bottom: 0.1rem;
	}


    .slider-grid span {
        width: 4rem;
        font-size: 0.9rem;
        position: relative;
        top: 3px; 
        
    }
    .label-left {
        text-align: right;
    }

    .label-right {
        text-align: left;
    }
    

	input[type="range"] {
		width: 100%;
		height: 10px;
		border-radius: 3px;
		cursor: pointer;
	}

    .reset-button {
        padding-right: 0.5rem;
		background: none;
		border: none;
		font-size: 1rem;
		cursor: pointer;
        color: #6C6C6C;
	}


</style>