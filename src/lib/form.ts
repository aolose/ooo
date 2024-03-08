export const submit = (success?: (result: Response) => void, before?: (form: FormData) => void) => function (e: Event) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    if (before) before(data)
    fetch(form.action, {
        method: form.method,
        body: data
    }).then(r => {
        if (success) success(r)
    })
    return false
}