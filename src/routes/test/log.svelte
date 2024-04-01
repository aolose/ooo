<script lang="ts">
    import Box from './box.svelte'
    import {api} from "$lib/req";
    import {onMount} from "svelte";
    let msg=[] as string[]
    const q = api('log')
    onMount(()=>{
        const t = setInterval(async ()=>{
            msg=msg.concat(await q.get<string[]>())
        },3000)
        return ()=>clearInterval(t)
    })
</script>

<Box name="LOGS">
    <textarea readonly>{msg.join('\n')}</textarea>
</Box>
<style lang="scss">
  textarea {
    white-space: pre;
    resize: none;
    width: 100%;
    height: 600px;
  }
</style>
