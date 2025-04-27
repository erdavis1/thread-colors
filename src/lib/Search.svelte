<script>
    export let baseHex;
    export let searchDesc;
    export let searchBrands;
    export let adjustR;
    export let adjustG;
    export let adjustB;
    export let adjustLight;
  
    export let colorShift = (hex) => hex; // dummy default
    export let resetSliders = () => {}; 

    let showSearch = true;
    let isEditing = false;
    let shiftedHex = baseHex;

    function handleColorPick(event) {
        baseHex = event.target.value;
     }

    // Watch baseHex and reset sliders if it changes
    $: if (baseHex !== undefined) {
      resetSliders();
    }

    $: if (!isEditing) {
      shiftedHex = colorShift(baseHex, adjustR, adjustG, adjustB, adjustLight);
    }
    
  </script>
  
   <div class="form-section">
      <h3 on:click={() => showSearch = !showSearch}>
        Search
        <span>{showSearch ? '▾' : '▸'}</span>
      </h3>
  
      {#if showSearch}
        <div class="section-body">
          <div class="hex-input-row">
            <label style="cursor: pointer;">
              <div class="hex-swatch" style="background-color: {shiftedHex};"></div>
              <input
                    type="color"
                    bind:value={baseHex}
                    on:input={handleColorPick}
                    style="opacity: 0; position: absolute; width: 1px; height: 1px;"
              />
            </label>
  
            <input
              type="text"
              class="search-hex"
              bind:value={shiftedHex}
              placeholder="Hex"
              on:input={(e) => {
                isEditing = true;
                baseHex = e.target.value;
              }}
              on:blur={() => {
                isEditing = false;
              }} 
          />
          </div>
  
          <input
            type="text"
            class="search-desc"
            bind:value={searchDesc}
            placeholder="Description or code"
          />
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

  

  <style>
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
  </style>