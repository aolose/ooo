use wasm_bindgen::prelude::*;
use js_sys::{Array, Object};

#[wasm_bindgen]
pub fn is_object(o: Object) {
    use web_sys::console;
    let a = Array::new();
    a.push(&format!("is_object: {}", o.is_object()).into());
    console::log(&a);
}
