export const bufHash = async (buf: ArrayBuffer) => {
    const hashBuf = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint32Array(hashBuf),a=>a.toString(36)).join('')
}