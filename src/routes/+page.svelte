<script>
// @ts-nocheck

    //components
    import '../app.css';
    import Help from '$lib/Help.svelte';
    import Search from '$lib/Search.svelte';
    import Sliders from '$lib/Sliders.svelte';
    import PhotoPicker from '$lib/PhotoPicker.svelte';

    //data variables

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
                    (brands.includes(d.brand)) &&
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



 

    //reactively apply filters any time the search criteria are changed
    $: if (baseHex !== undefined && searchDesc !== undefined && searchBrands !== undefined &&
                adjustR !== undefined && adjustG !== undefined && adjustB!== undefined &&  adjustLight!== undefined) {
        applyFilters(baseHex, searchBrands, searchDesc, adjustR, adjustG, adjustB, adjustLight);
    } 



</script>



<header>
	<div class="header-content">
		<h1 class="header-title" style="color: {baseHex}; ">Threadpicker</h1>
		<button class="question-button" on:click={() => showHelp = !showHelp}>?</button>
	</div>
</header>


<main>
     <!-- help box -->
    {#if showHelp}
        <Help onClose={() => showHelp = false} />
    {/if}

	<form class = 'userinfo' on:submit|preventDefault={applyFilters(baseHex, searchBrands, searchDesc, adjustR, adjustG, adjustB, adjustLight)}>
        <!-- search box -->
        <Search
            bind:baseHex
            bind:searchDesc
            bind:searchBrands
            bind:adjustR
            bind:adjustG
            bind:adjustB
            bind:adjustLight
            {colorShift}
            {resetSliders}
           />
   

        <!-- color sliders -->
        <Sliders
            bind:adjustR
            bind:adjustG
            bind:adjustB
            bind:adjustLight
            {resetSliders}
       />

        <!-- Pick color from photo -->
        <PhotoPicker
            bind:baseHex
            {resetSliders}
            {rgbToHex}
        />

	</form>

    <table class="data-table">
        <thead>
            <tr>
                <th><button class="button" type="button" on:click={resetFilters}>×</button></th>
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
	font-size: 1.2rem;
	cursor: pointer;
	color: #6C6C6C;
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


.data-table th {
    background: #FFFFFF;
    padding: 0.5rem;
}


.data-table tr {
    border-bottom: 1px solid #eee; 
}


</style>