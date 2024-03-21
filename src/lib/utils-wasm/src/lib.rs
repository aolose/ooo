use wasm_bindgen::prelude::*;
use js_sys::{Object};

#[wasm_bindgen]
extern "C" {
    fn console(s: &str);
}


#[wasm_bindgen]
pub fn is_object(o: Object) {
    console(&format!("Hello, {}!", o.is_object()));
}
