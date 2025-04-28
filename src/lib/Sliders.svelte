<script>

    export let adjustR=0;
    export let adjustG=0;
    export let adjustB=0;
    export let adjustLight=0;
    export let resetSliders = () => {}; 
    let showSliders = false;
</script>



<div class="form-section">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="section-header" on:click={() => showSliders = !showSliders}>
        <h3>Tweak color
            <span>
            <button class="button" type="button" on:click|stopPropagation={resetSliders}>↺</button>
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

 <style>
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

 </style>