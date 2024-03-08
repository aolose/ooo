<script lang="ts">
    import {submit} from "$lib/form";
    import {onMount} from "svelte";

    let link = ''
    let name = ''
    let bucketOk = 0
    const done = async (r: Response) => {
        link = await r.text()
    }
    const before = (f: FormData) => {
        const fi = f.get('file') as File
        name = fi.name
    }

    onMount(() => {
        fetch('/api/ok').then(async a => bucketOk = +await a.text())
    })
</script>
<div>
    <p>bucketOk:{bucketOk}</p>
    <form on:submit={submit(done,before)} method="post" action="/api/upload">
        <input name="file" type="file">
        <input type="submit" value="submit">
    </form>
    {#if link}<a href={`/res/${link}`} download={name}>{link}</a>{/if}
</div>