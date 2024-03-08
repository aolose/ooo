<script lang="ts">
    import {submit} from "$lib/form";

    let link = ''
    let name = ''
    const done = async (r: Response) => {
        link = await r.text()
    }
    const before = (f: FormData) => {
        const fi = f.get('file') as File
        name = fi.name
    }
</script>
<div>
    <form on:submit={submit(done,before)} method="post" action="/api/upload">
        <input name="file" type="file">
        <input type="submit" value="submit">
    </form>
    {#if link}<a href={`/res/${link}`} download={name}>{link}</a>{/if}
</div>