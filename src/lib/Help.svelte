<script>
    export let onClose = () => {}; 
</script>

<div class="form-section">
    <div class="section-header">
            <h3>I want to...
                <span>
                    <button class="cancel" type="button" on:click={onClose}>×</button>
                </span>
            </h3>
    </div>
    <div class="section-body">
        <b>Find the closest floss match to a hex code</b>   
            <ul>
                <li>Enter a hex code in the box OR click on the swatch to pick a color</li>
                <li>Optionally, add in additional criteria in the Search box</li>
                <li>Color list will auto-sort to have the closest match on top</li>
            </ul>

            <b>Find the closest match to another floss</b>   
            <ul>
                <li>Use the search criteria to find your starting floss</li>
                <li>Click on its color swatch to sort the table by similarity </li>
                <li>Remove your search criteria to show all flosses<br>
                    <i>Alteratively, click the X above the swatches to show everything</i></li>
            </ul>

            <b>See all floss colors in a family</b>
            <uL>
                <li>Use the search criteria to find your starting floss</li>
                <li>Double click on its color swatch</li>
                <li>When you're done, click the X above the swatches to remove the filter</li>
            </uL>

            <b>Provide questions, comments, concerns, hopes, dreams, or fears</b>
            <ul><li>Contact me at erinrdavis1@gmail.com</li></ul>

        <div>
            <i style = "font-size:0.8rem">
                <ul class = "sources">
                    <li>DMC hex codes via <a href="https://dmc.crazyartzone.com/">Crazy Art Zone</a></li>
                    <li>Cosmo hex codes via <a href="https://tallcoleman.me/crafts/2022/01/01/experimenting-rgb-colours-cosmo-embroidery-floss.html">Ben Coleman</a></li>
                    <li>Anchor hex codes sampled from <a href="https://mayagobelin.com/wp-content/uploads/2020/09/Anchor-Color-Chart-MayaNeedlepoin.com_.png">Maya Needlepoint</a> and may not be totally accurate</li>
            </ul>
            </i>
        </div>
    
        
        </div>
</div>

<style>
    .sources {
        list-style-type: none;
        padding-left: 0;
    }
</style>